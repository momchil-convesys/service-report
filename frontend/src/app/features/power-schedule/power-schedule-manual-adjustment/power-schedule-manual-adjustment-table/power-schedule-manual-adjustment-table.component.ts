import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  signal,
  SimpleChanges,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { isSameDay } from 'date-fns';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { AccessControlPermission, DataRequest, PositionInTime } from '../../../../constants';
import { Plant } from '../../../../data/models';
import { ClockService } from '../../../../data/services/clock.service';
import { UsersService } from '../../../../data/services/users.service';
import {
  calcScheduleAdjustmentPercentage,
  calcScheduleAdjustmentPercentageFormatted,
} from '../../../../helpers/_schedule-adjustment-coefficient';
import { utcToZonedTimeSafe } from '../../../../helpers/_time-zone-convertions';
import { DatetimeRangeModel } from '../../../../shared/datetime-range-select/models';
import { PlsEquivalentIconComponent } from '../../../../shared/power-limit/pls-equivalent-icon/pls-equivalent-icon.component';
import { ValueDisplayComponent } from '../../../../shared/value-display/value-display.component';
import { PriorityMode, priorityModes } from '../../_data/priority-modes.dto';
import { PowerScheduleSetpointValueComponent } from '../../power-schedule-setpoint-value/power-schedule-setpoint-value.component';
import { PriorityModeType } from '../_data/manual-adjustments.dto';
import {
  PowerScheduleTracking,
  PowerScheduleTrackingInterval,
  SetpointValue,
} from '../_data/power-schedule-tracking.model';
import { PowerScheduleManualAdjustmentCellHistoryComponent } from '../power-schedule-manual-adjustment-cell-history/power-schedule-manual-adjustment-cell-history.component';
import {
  PowerScheduleManualAdjustment_ModalComponentData,
  PowerScheduleManualAdjustment_ModalComponentResult,
  PowerScheduleManualAdjustmentModalComponent,
} from '../power-schedule-manual-adjustment-modal/power-schedule-manual-adjustment-modal.component';
import {
  bessDeviationFromTargetTreshold,
  gridDeviationFromTargetTreshold,
  pvDeviationFromTargetTreshold,
} from '../power-schedule-tracking-chart/chart-common';

interface TableRow extends PowerScheduleTrackingInterval {
  key: string;
  priorityMode: PriorityModeType | null;
  positionInTime: PositionInTime; // Pre-calculated for performance
}

@Component({
  selector: 'app-power-schedule-manual-adjustment-table',
  templateUrl: './power-schedule-manual-adjustment-table.component.html',
  styleUrl: './power-schedule-manual-adjustment-table.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzTooltipModule,
    NzIconModule,
    NzButtonModule,
    PowerScheduleSetpointValueComponent,
    PowerScheduleManualAdjustmentCellHistoryComponent,
    PlsEquivalentIconComponent,
    ValueDisplayComponent,
  ],
  providers: [NzModalService],
})
export class PowerScheduleManualAdjustmentTableComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) plant: Plant | null | undefined;
  @Input({ required: true }) targetRange: DatetimeRangeModel | null | undefined;
  @Input({ required: true }) dataRequest: DataRequest<PowerScheduleTracking> | null | undefined;

  @Input() inWidget = false;

  @HostListener('window:resize')
  updateViewPortHeight() {
    if (!this.inWidget) {
      this.viewPortHeight.set(window.innerHeight);
    }
  }

  // The same value is used as media breakpoint in the parent component
  // to determine if the table should be scrollable or not
  maxViewPortHeight = 800;
  tableHeadersHeight = 90;
  viewPortHeight = signal(window.innerHeight);

  get parentViewHeight(): number {
    return this.elementRef.nativeElement.parentElement?.offsetHeight || 300;
  }

  tableData: TableRow[] = [];

  get isLoading(): boolean {
    return this.dataRequest?.isLoading || false;
  }

  private _clockService = inject(ClockService);
  private _tick$ = this._clockService.tick$;
  private _destroy$ = new Subject<void>();
  private _hasScrolledToCurrent = false;

  readonly priorityModes = priorityModes;
  readonly PriorityMode = PriorityMode;

  private _usersService = inject(UsersService);

  get pvSetpointTargetCoefficient(): number {
    return this.plant?.plantSpecificMetadata?.powerLimitTargetCoefficient || 1;
  }

  get bessSetpointTargetCoefficient(): number {
    return this.plant?.plantSpecificMetadata?.bessSetpointTargetCoefficient || 1;
  }

  get pvAdjustmentPercentageFormatted(): string | null {
    if (this.pvSetpointTargetCoefficient === 1) {
      return null;
    }
    const formatted = calcScheduleAdjustmentPercentageFormatted(this.pvSetpointTargetCoefficient);
    return formatted.replace('(', '').replace(')', '').replace(' ', '');
  }

  get bessAdjustmentPercentageFormatted(): string | null {
    if (this.bessSetpointTargetCoefficient === 1) {
      return null;
    }
    const formatted = calcScheduleAdjustmentPercentageFormatted(this.bessSetpointTargetCoefficient);
    return formatted.replace('(', '').replace(')', '').replace(' ', '');
  }

  constructor(
    private cdr: ChangeDetectorRef,
    private elementRef: ElementRef<HTMLElement>,
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
  ) {}

  get targetDate(): Date {
    return this.tableData[0]?.zonedInterval.start ?? new Date();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['plant'] && this.plant) {
      this._subscribeToClockTicks();
    }
    if (changes['dataRequest'] && this.dataRequest?.data) {
      this.tableData = this._adaptTrackingDataToTableRows(this.dataRequest.data);

      // Scroll to current interval on initial load if today's data
      if (!this._hasScrolledToCurrent && this.targetRange) {
        this._scrollToCurrentIntervalIfToday();
      }
      this.cdr.markForCheck();
    }
    if (changes['targetRange'] && !changes['targetRange'].firstChange) {
      // Reset scroll flag when range changes
      this._hasScrolledToCurrent = false;
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  get hasPermissionToAdjust(): boolean {
    return this._usersService.hasCurrentUserPermission(
      AccessControlPermission.PowerSchedule_Adjust,
    );
  }

  private _subscribeToClockTicks(): void {
    // Subscribe to clock ticks once and update all rows' positionInTime
    this._tick$.pipe(takeUntil(this._destroy$)).subscribe(() => {
      if (this.plant && this.tableData.length > 0) {
        this.tableData = this.tableData.map((row) => ({
          ...row,
          positionInTime: this._clockService.getZonedPositionInTimeForInterval(
            row.zonedInterval,
            this.plant?.timeZone,
          ),
        }));
        this.cdr.markForCheck();
      }
    });
  }

  private _adaptTrackingDataToTableRows(trackingData: PowerScheduleTracking): TableRow[] {
    return trackingData.intervals.map((interval, index) => {
      // Map PriorityModeType string to PriorityMode enum
      const priorityMode: PriorityModeType | null = interval.priorityModeCustom;

      // Pre-calculate position in time for performance
      const positionInTime = this._clockService.getZonedPositionInTimeForInterval(
        interval.zonedInterval,
        this.plant?.timeZone,
      );

      return {
        ...interval,
        key: `row-${index}`,
        priorityMode,
        positionInTime,
      };
    });
  }

  getRowClass(row: TableRow): PositionInTime {
    return row.positionInTime;
  }

  getBessPowerSetpointClass(setpoint: SetpointValue): string {
    if (!setpoint.value) {
      return '';
    }

    return setpoint.value > 0 ? 'discharge' : 'charge';
  }

  openAdjustModal(row: TableRow, type: 'pv' | 'bess' | 'priorityMode'): void {
    // TODO: Uncomment when implementation is complete
    // if (
    //   this.plant?.activePowerLimitSchedule$.getValue() === null &&
    //   this.plant?.activeBESSSchedule$.getValue() === null
    // ) {
    //   this.modal.error({
    //     nzTitle: $localize`No active schedule`,
    //     nzContent: $localize`A schedule must be enabled to make adjustments.`,
    //   });

    //   return;
    // }

    const modalData: PowerScheduleManualAdjustment_ModalComponentData = {
      type,
      data: {
        interval: row.zonedInterval,
        pvPowerSetpoint: row.pvPowerSetpoint,
        pvPowerSetpointCustom: row.pvPowerSetpointCustom,
        bessPowerSetpoint: row.bessPowerSetpoint,
        bessPowerSetpointCustom: row.bessPowerSetpointCustom,
        priorityMode: row.priorityMode,
      },
      plant: this.plant ?? undefined,
    };

    const modalRef = this.modal.create<
      PowerScheduleManualAdjustmentModalComponent,
      PowerScheduleManualAdjustment_ModalComponentData,
      PowerScheduleManualAdjustment_ModalComponentResult
    >({
      nzTitle:
        (type === 'pv'
          ? $localize`Adjust PV power setpoint`
          : type === 'bess'
            ? $localize`Adjust BESS power setpoint`
            : $localize`Adjust priority mode`) + ' for interval',
      nzContent: PowerScheduleManualAdjustmentModalComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: modalData,
      nzFooter: null,
      nzBodyStyle: {
        padding: '0',
      },
    });

    modalRef.afterClose.subscribe((result) => {
      // Data will be refreshed automatically by the parent component
      // when the tracking service emits new data
    });
  }

  getPriorityModeTitle(mode: PriorityMode | null): string {
    if (!mode || mode === PriorityMode.DEFAULT) {
      return '';
    }

    return mode as string;

    // const modeConfig = this.priorityModes.find((m) => m.id === mode);
    // return modeConfig?.title ?? mode;
  }

  /**
   * Check if deviation is significant (greater than threshold)
   */
  isDeviationSignificant(deviation: number | null, type: 'pv' | 'bess' | 'grid'): boolean {
    if (deviation === null) {
      return false;
    }
    const threshold =
      type === 'pv'
        ? pvDeviationFromTargetTreshold
        : type === 'bess'
          ? bessDeviationFromTargetTreshold
          : gridDeviationFromTargetTreshold;

    return Math.abs(deviation) > threshold;
  }

  /**
   * Get tooltip text for initial value in custom columns
   */
  getInitialValueTooltip(
    setpoint: SetpointValue | null | undefined,
    type: 'pv' | 'bess',
  ): string | null {
    if (!setpoint || setpoint.value === null || setpoint.value === undefined) {
      return null;
    }

    const adjustedValue = setpoint.valueAdjusted ?? setpoint.value;
    // Only show tooltip if initial value differs from adjusted value
    if (adjustedValue === setpoint.value) {
      return null;
    }

    const coefficient =
      type === 'pv' ? this.pvSetpointTargetCoefficient : this.bessSetpointTargetCoefficient;

    // If coefficient is 1, no adjustment was applied
    if (coefficient === 1) {
      return null;
    }

    const formattedInitial = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(setpoint.value);

    const formattedAdjusted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(adjustedValue);

    const percentage = calcScheduleAdjustmentPercentage(coefficient);
    const percentageSign = percentage && percentage > 0 ? '+' : '';
    const percentageFormatted = percentage !== undefined ? `${percentageSign}${percentage}%` : '';

    const initialSign = type === 'bess' && setpoint.value > 0 ? '+' : '';
    const adjustedSign = type === 'bess' && adjustedValue > 0 ? '+' : '';

    return `${initialSign}${formattedInitial} ${percentageFormatted} = ${adjustedSign}${formattedAdjusted} kW`;
  }

  private _scrollToCurrentIntervalIfToday(): void {
    if (!this.targetRange || !this.plant || this.inWidget) {
      return;
    }

    // Check if the selected range is for today
    const now = new Date();
    const targetDateInPlantTimeZone = utcToZonedTimeSafe(now, this.plant.timeZone);
    const rangeStartInPlantTimeZone = utcToZonedTimeSafe(
      this.targetRange.from,
      this.plant.timeZone,
    );

    if (!isSameDay(targetDateInPlantTimeZone, rangeStartInPlantTimeZone)) {
      return;
    }

    // Find the current interval (where positionInTime is 'present')
    const currentIndex = this.tableData.findIndex((row) => row.positionInTime === 'present');

    if (currentIndex === -1) {
      return;
    }

    // Mark as scrolled to prevent scrolling on subsequent updates
    this._hasScrolledToCurrent = true;

    // Wait for DOM to update, then scroll
    setTimeout(() => {
      const tableElement = this.elementRef.nativeElement.querySelector('nz-table');
      if (!tableElement) {
        return;
      }

      const scrollContainer = tableElement.querySelector('.ant-table-body');
      if (!scrollContainer) {
        return;
      }

      const rows = scrollContainer.querySelectorAll('tbody tr');
      if (currentIndex >= rows.length) {
        return;
      }

      const targetRow = rows[currentIndex] as HTMLElement;
      if (targetRow) {
        targetRow.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }
}
