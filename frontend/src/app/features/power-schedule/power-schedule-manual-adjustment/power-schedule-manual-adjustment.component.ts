import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  inject,
  Input,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isBefore } from 'date-fns';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import {
  combineLatest,
  distinctUntilChanged,
  map,
  Observable,
  ReplaySubject,
  shareReplay,
  switchMap,
} from 'rxjs';
import { DataRequest } from 'src/app/constants';
import { DataAdapter } from 'src/app/data/adapters';
import { Plant } from 'src/app/data/models';
import { PlantsService } from 'src/app/data/services/plants.service';
import { UserSettingsService } from 'src/app/data/services/user-settings.service';
import { handleAnyError } from 'src/app/helpers';
import { BaseChartContext } from 'src/app/shared/base-chart-component/base-chart-component.component';
import {
  DatetimeRangeModel,
  isSameDatetimeRange,
} from 'src/app/shared/datetime-range-select/models';
import { PageRoutingService } from 'src/app/shared/page-routing.service';
import { CustomAlertComponent } from '../../../shared/custom-alert/custom-alert.component';
import { DatetimeRangeSelectComponent } from '../../../shared/datetime-range-select/datetime-range-select.component';
import { HighchartsExportOptionComponent } from '../../../shared/highcharts-export-option/highcharts-export-option.component';
import { NavUpComponent } from '../../../shared/nav-up/nav-up.component';
import { PowerScheduleTrackingService } from './_data/power-schedule-tracking-service';
import { adaptPowerScheduleTracking } from './_data/power-schedule-tracking.adapter';
import { PowerScheduleTracking } from './_data/power-schedule-tracking.model';
import { PowerScheduleManualAdjustmentTableComponent } from './power-schedule-manual-adjustment-table/power-schedule-manual-adjustment-table.component';
import { PowerScheduleTrackingChartBESSComponent } from './power-schedule-tracking-chart/power-schedule-tracking-chart-bess.component';
import { PowerScheduleTrackingChartGridComponent } from './power-schedule-tracking-chart/power-schedule-tracking-chart-grid.component';
import { PowerScheduleTrackingChartPVComponent } from './power-schedule-tracking-chart/power-schedule-tracking-chart-pv.component';
// import { PowerScheduleTrackingChartPVComponent } from './power-schedule-tracking-chart/power-schedule-tracking-chart-pv.component';

@Component({
  selector: 'app-power-schedule-manual-adjustment',
  templateUrl: './power-schedule-manual-adjustment.component.html',
  styleUrl: './power-schedule-manual-adjustment.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [
    CommonModule,
    NzButtonModule,
    NzIconModule,
    NzEmptyModule,
    NzTooltipModule,
    NzSpinModule,
    PowerScheduleTrackingChartPVComponent,
    PowerScheduleTrackingChartBESSComponent,
    PowerScheduleTrackingChartGridComponent,
    NavUpComponent,
    DatetimeRangeSelectComponent,
    HighchartsExportOptionComponent,
    CustomAlertComponent,
    PowerScheduleManualAdjustmentTableComponent,
  ],
  providers: [PowerScheduleTrackingService],
})
export class PowerScheduleManualAdjustmentComponent {
  @Input() onDashboard = false;

  @HostBinding('class.on-dashboard') get onDashboardClass() {
    return this.onDashboard;
  }

  @ViewChild('chartPVRef')
  chartPVComponent: PowerScheduleTrackingChartPVComponent | undefined;

  private _targetRange$: ReplaySubject<DatetimeRangeModel> = new ReplaySubject(1);
  private _plantsService = inject(PlantsService);
  private _userSettingsService = inject(UserSettingsService);
  private _cdr = inject(ChangeDetectorRef);

  // @ViewChild('chartPVComponent', { read: PowerScheduleTrackingChartPVComponent })
  // chartPVComponent: PowerScheduleTrackingChartPVComponent | undefined;

  plant$: Observable<Plant>;
  targetRange$: Observable<DatetimeRangeModel>;
  trackingDataRequest$: Observable<DataRequest<PowerScheduleTracking>>;
  chartContext$: Observable<BaseChartContext>;
  tableVisible: boolean = false;

  noSchedule: boolean = false;

  constructor(
    pageRouting: PageRoutingService,
    private trackingService: PowerScheduleTrackingService,
  ) {
    this.plant$ = pageRouting.getPlantFromQueryParams().pipe(takeUntilDestroyed());
    this.targetRange$ = this._targetRange$.asObservable();

    this.trackingDataRequest$ = combineLatest([
      this.plant$,
      this._targetRange$.pipe(distinctUntilChanged(isSameDatetimeRange)),
    ]).pipe(
      switchMap(([plant, targetRange]) => {
        this.noSchedule = false;

        const from = DataAdapter.modelToDtoTimestamp(targetRange.from);
        const to = DataAdapter.modelToDtoTimestamp(targetRange.to);
        const liveData = !isBefore(targetRange.to, new Date());

        return this.trackingService.fetchPowerScheduleTracking(plant.id, from, to, liveData).pipe(
          map((request) => {
            if (request.data?.intervals?.length === 0) {
              request.data = undefined;
              request.error = new Error(
                'No schedule data available. This usually means that there was no schedule file uploaded for the selected period.',
              );
              this.noSchedule = true;
            }
            return request;
          }),
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

            // Adapt DTO to shared model
            const adaptedData = adaptPowerScheduleTracking(request.data, plant);

            // Set export filename
            adaptedData.exportFileName = this._plantsService.generateFileNameForExport_New(
              $localize`Power Schedule Tracking`,
              plant.id,
              undefined,
              targetRange,
            );

            return {
              isLoading: false,
              data: adaptedData,
            };
          }),
        );
      }),
      shareReplay(1),
      takeUntilDestroyed(),
    );

    this.chartContext$ = combineLatest([
      this.plant$,
      this._targetRange$.pipe(distinctUntilChanged(isSameDatetimeRange)),
    ]).pipe(
      map(([plant, targetRange]) => ({
        plant,
        deviceId: null,
        targetRange,
      })),
      shareReplay(1),
      takeUntilDestroyed(),
    );
  }

  ngOnInit(): void {
    if (this.onDashboard) {
      this.tableVisible = false;
    } else {
      this.tableVisible =
        this._userSettingsService.getCurrentUserSettings()
          .powerScheduleManualAdjustmentTableVisible ?? true;
    }
  }

  onDatetimeRangeChange(value: DatetimeRangeModel) {
    this._targetRange$.next(value);
  }

  getErrorTitle(): string {
    return $localize`Failed to load schedule tracking data`;
  }

  toggleTableVisibility() {
    this.tableVisible = !this.tableVisible;
    this._userSettingsService.updateCurrentUserSettings({
      powerScheduleManualAdjustmentTableVisible: this.tableVisible,
    });
    this._cdr.markForCheck();
  }
}
