import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { filter, map, Observable, shareReplay, Subject, switchMap, takeUntil } from 'rxjs';
import { DataRequest, IntegrationPeriod } from '../../../../constants';
import { DataAdapter } from '../../../../data/adapters';
import { handleAnyError, utcToZonedTimeSafe, zonedTimeToUtcSafe } from '../../../../helpers';
import { DatetimeRangeModel } from '../../../../shared/datetime-range-select/models';
import { PageRoutingService } from '../../../../shared/page-routing.service';
import { CurrentControlStateDTO } from '../../../power-schedule/_data/control-state.dto';
import { PriorityMode, priorityModes } from '../../../power-schedule/_data/priority-modes.dto';
import { PowerScheduleTrackingService } from '../../../power-schedule/power-schedule-manual-adjustment/_data/power-schedule-tracking-service';
import { adaptPowerScheduleTracking } from '../../../power-schedule/power-schedule-manual-adjustment/_data/power-schedule-tracking.adapter';
import { PowerScheduleTracking } from '../../../power-schedule/power-schedule-manual-adjustment/_data/power-schedule-tracking.model';
import { PowerScheduleManualAdjustmentTableComponent } from '../../../power-schedule/power-schedule-manual-adjustment/power-schedule-manual-adjustment-table/power-schedule-manual-adjustment-table.component';

@Component({
  selector: 'app-control-interface',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzCardModule,
    NzFormModule,
    NzInputNumberModule,
    NzSelectModule,
    NzButtonModule,
    NzTypographyModule,
    NzSkeletonModule,
    PowerScheduleManualAdjustmentTableComponent,
  ],
  templateUrl: './control-interface.component.html',
  styleUrl: './control-interface.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PowerScheduleTrackingService],
})
export class ControlInterfaceComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly pageRouting = inject(PageRoutingService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly trackingService = inject(PowerScheduleTrackingService);

  @Input() controlState$?: Observable<CurrentControlStateDTO | null>;

  plant$ = this.pageRouting.getPlantFromQueryParams();

  activeSection: 'schedule' | 'manual' = 'schedule';

  targetRange$: Observable<DatetimeRangeModel>;
  trackingDataRequest$: Observable<DataRequest<PowerScheduleTracking>>;

  controlForm: FormGroup;

  readonly priorityModes = priorityModes;
  readonly PriorityMode = PriorityMode;

  private _destroy$ = new Subject<void>();

  constructor() {
    this.controlForm = this.fb.group({
      pvPower: [null, [Validators.min(0)]],
      bessPower: [null],
      priorityMode: [PriorityMode.DEFAULT],
    });

    this.targetRange$ = this.plant$.pipe(
      map((plant) => this.buildTodayTargetRange(plant)),
      shareReplay(1),
      takeUntil(this._destroy$),
    );

    this.trackingDataRequest$ = this.plant$.pipe(
      switchMap((plant) =>
        this.targetRange$.pipe(
          switchMap((targetRange) => {
            const from = DataAdapter.modelToDtoTimestamp(targetRange.from);
            const to = DataAdapter.modelToDtoTimestamp(targetRange.to);
            const liveData = !this.isBeforeNow(targetRange.to);

            return this.trackingService
              .fetchPowerScheduleTracking(plant.id, from, to, liveData)
              .pipe(
                map((request) => {
                  if (request.error) {
                    return {
                      isLoading: false,
                      error: handleAnyError(request.error, undefined),
                      data: undefined,
                    };
                  }
                  if (request.isLoading) {
                    return {
                      isLoading: true,
                      data: undefined,
                    };
                  }
                  if (!request.data) {
                    return {
                      isLoading: false,
                      data: undefined,
                    };
                  }

                  const adaptedData = adaptPowerScheduleTracking(request.data, plant);
                  const trimmedData = this.limitTrackingToCurrentInterval(adaptedData, new Date());

                  return {
                    isLoading: false,
                    data: trimmedData,
                  };
                }),
              );
          }),
        ),
      ),
      shareReplay(1),
      takeUntil(this._destroy$),
    );
  }

  ngOnInit(): void {
    // Determine active section based on control state - sync with control state view
    if (this.controlState$) {
      this.controlState$
        .pipe(
          filter((state): state is CurrentControlStateDTO => state !== null),
          takeUntil(this._destroy$),
        )
        .subscribe((state) => {
          const mechanismType = state.controlMechanism.type;
          // Sync active section with control state view mechanism type
          if (mechanismType === 'ManualControl') {
            this.activeSection = 'manual';
          } else if (
            mechanismType === 'DailySchedule' ||
            mechanismType === 'ManualScheduleAdjustment'
          ) {
            this.activeSection = 'schedule';
          } else {
            // ExternalSystemControl or unknown - default to schedule
            this.activeSection = 'schedule';
          }
          this.cdr.markForCheck();
        });
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  onSubmit(): void {
    if (this.controlForm.valid) {
      // TODO: Implement API call to update manual control parameters
      const formValue = this.controlForm.value;
      console.log('Updating manual control parameters:', formValue);
    }
  }

  private buildTodayTargetRange(plant: { timeZone?: string | undefined }): DatetimeRangeModel {
    const now = new Date();
    const nowInPlantTz = plant.timeZone ? utcToZonedTimeSafe(now, plant.timeZone) : now;
    const startInPlantTz = new Date(
      nowInPlantTz.getFullYear(),
      nowInPlantTz.getMonth(),
      nowInPlantTz.getDate(),
      0,
      0,
      0,
      0,
    );
    const endInPlantTz = new Date(startInPlantTz);
    endInPlantTz.setDate(endInPlantTz.getDate() + 1);

    const from = plant.timeZone
      ? zonedTimeToUtcSafe(startInPlantTz, plant.timeZone)
      : startInPlantTz;
    const to = plant.timeZone ? zonedTimeToUtcSafe(endInPlantTz, plant.timeZone) : endInPlantTz;

    return {
      pickerId: 0,
      type: 'single-date',
      from,
      to,
      integrationPeriod: IntegrationPeriod.QuaterOfAnHour,
      predefinedRangeTypeOption: 'day',
    };
  }

  private isBeforeNow(date: Date): boolean {
    return date.getTime() < new Date().getTime();
  }

  private limitTrackingToCurrentInterval(
    tracking: PowerScheduleTracking,
    now: Date,
    beforeCount: number = 2,
    afterCount: number = 2,
  ): PowerScheduleTracking {
    const intervals = tracking.intervals;
    if (!intervals.length) {
      return tracking;
    }

    let currentIndex = intervals.findIndex(
      (interval) => now >= interval.interval.start && now < interval.interval.end,
    );

    if (currentIndex === -1) {
      currentIndex = intervals.findIndex((interval) => interval.interval.start > now);
    }

    if (currentIndex === -1) {
      currentIndex = intervals.length - 1;
    }

    const totalToShow = beforeCount + afterCount + 1;
    let startIndex = Math.max(0, currentIndex - beforeCount);
    let endIndex = Math.min(intervals.length, currentIndex + afterCount + 1);

    if (startIndex === 0) {
      endIndex = Math.min(intervals.length, totalToShow);
    } else if (endIndex === intervals.length) {
      startIndex = Math.max(0, intervals.length - totalToShow);
    }

    return {
      ...tracking,
      intervals: intervals.slice(startIndex, endIndex),
    };
  }
}
