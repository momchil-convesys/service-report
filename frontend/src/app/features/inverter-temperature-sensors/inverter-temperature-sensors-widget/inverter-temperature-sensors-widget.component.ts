import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import {
  BehaviorSubject,
  Observable,
  ReplaySubject,
  Subject,
  combineLatest,
  distinctUntilChanged,
  map,
  of,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';
import { DataRequest } from '../../../constants';
import { PlantsService } from '../../../data/services/plants.service';
import { BaseChartContext } from '../../../shared/base-chart-component/base-chart-component.component';
import { DatetimeRangeSelectComponent } from '../../../shared/datetime-range-select/datetime-range-select.component';
import {
  DatetimeRangeModel,
  isSameDatetimeRange,
} from '../../../shared/datetime-range-select/models';
import { HighchartsExportOptionComponent } from '../../../shared/highcharts-export-option/highcharts-export-option.component';
import { PageRoutingService } from '../../../shared/page-routing.service';
import { TemperatureSensorsDataService } from '../_data/data.service';
import { InverterTemperatureSensorsData, MinMaxTemperaturePoint } from '../_data/models';
import { InverterTemperatureSensorsChartComponent } from './inverter-temperature-sensors-chart/inverter-temperature-sensors-chart.component';
import { InverterTemperatureSensorsTableComponent } from './inverter-temperature-sensors-table/inverter-temperature-sensors-table.component';

type AvailableViews = 'chart-view' | 'table-view';

@Component({
  selector: 'app-inverter-temperature-sensors-widget',
  imports: [
    AsyncPipe,
    DatetimeRangeSelectComponent,
    InverterTemperatureSensorsChartComponent,
    InverterTemperatureSensorsTableComponent,
    NzIconModule,
    NzButtonModule,
    NzRadioModule,
    FormsModule,
    HighchartsExportOptionComponent,
  ],
  providers: [PageRoutingService],
  templateUrl: './inverter-temperature-sensors-widget.component.html',
  styleUrl: './inverter-temperature-sensors-widget.component.less',
  encapsulation: ViewEncapsulation.Emulated, // Default
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InverterTemperatureSensorsWidgetComponent {
  @ViewChild('chartComponent', { static: false, read: InverterTemperatureSensorsChartComponent })
  chartComponent?: InverterTemperatureSensorsChartComponent;

  private _targetRange$: ReplaySubject<DatetimeRangeModel> = new ReplaySubject(1);
  private _dataNeedsReload$: ReplaySubject<void> = new ReplaySubject(1);

  // Used when redirecting to long term extreme on another day
  private _highlightOnLoad: MinMaxTemperaturePoint | undefined;

  private _activeView$ = new BehaviorSubject<AvailableViews>('chart-view');
  activeView$: Observable<AvailableViews> = this._activeView$.asObservable();

  deviceId$: Observable<string | undefined>;

  dataRequest$: Observable<DataRequest<InverterTemperatureSensorsData>>;
  dataIsLoading$: Observable<boolean>;

  chartContext$: Observable<BaseChartContext>;

  // Change date picker date from outside.
  datePickerDateModel$ = new Subject<Date>();

  timeZone$: Observable<string | undefined>;

  constructor(
    pageRouting: PageRoutingService,
    dataService: TemperatureSensorsDataService,
    plantsService: PlantsService,
  ) {
    const plant$ = pageRouting.getPlantFromQueryParams().pipe(takeUntilDestroyed());
    this.deviceId$ = pageRouting.getDeviceIdFromQueryParams().pipe(takeUntilDestroyed());

    this.chartContext$ = combineLatest([
      plant$,
      this.deviceId$,
      this._targetRange$.pipe(distinctUntilChanged(isSameDatetimeRange)),
    ]).pipe(
      map(([plant, deviceId, targetRange]) => ({
        plant,
        deviceId: deviceId || null,
        targetRange,
      })),
      shareReplay(1),
    );

    this.timeZone$ = this.deviceId$.pipe(
      map((deviceId) => plantsService.getCachedPlantByDeviceId(deviceId || '')?.timeZone),
    );

    this.dataRequest$ = combineLatest([
      this.deviceId$,
      this._targetRange$,
      this._dataNeedsReload$,
    ]).pipe(
      switchMap(([deviceId, targetRange, options]) => {
        if (!deviceId) {
          return of({
            isLoading: false,
            error: new Error('Device ID is not defined. (Probably missing in route parameters.)'),
          });
        }

        const highlightOnLoad: MinMaxTemperaturePoint | undefined = this._highlightOnLoad
          ? { ...this._highlightOnLoad }
          : undefined;

        return dataService.getTemperatureSensorsDataForDevice(deviceId, targetRange).pipe(
          map((req) => ({
            ...req,
            data: req.data && {
              ...req.data,
              highlightOnLoad,
            },
          })),
          tap(() => (this._highlightOnLoad = undefined)),
        );
      }),
      shareReplay(1),
    );

    this.dataIsLoading$ = this.dataRequest$.pipe(map((req) => req.isLoading));

    // Initiate first request, as combineLatest will wait for all streams
    this._dataNeedsReload$.next();
  }

  onDatetimeRangeChange(value: DatetimeRangeModel) {
    this._targetRange$.next(value);
  }

  onReloadDataClick() {
    this._dataNeedsReload$.next();
  }

  onActiveViewOptionChange(event: AvailableViews) {
    this._activeView$.next(event);
  }

  onGoToRecord(point: MinMaxTemperaturePoint) {
    this._highlightOnLoad = point;

    // This will trigger onDateChange
    this.datePickerDateModel$.next(point.timestamp);
  }
}
