import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import {
  BehaviorSubject,
  Observable,
  Subject,
  combineLatest,
  map,
  shareReplay,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { DataRequest, PredefinedTimeRange } from '../../../constants';
import { convertPredefinedRange } from '../../../helpers';
import { DatetimeRangeFilterModule } from '../../../shared/datetime-range-filter/datetime-range-filter.module';
import { HighchartsExportOptionComponent } from '../../../shared/highcharts-export-option/highcharts-export-option.component';
import { BatteriesApiService } from '../_data/api.service';
import { MonbatBattery, MonbatBatteryHistoricalData, MonbatBatteryString } from '../_data/models';
import { MonbatBatteryStringDataService } from '../_data/monbat-battery-data.service';
import { MonbatBatteryTemperatureBarComponent } from '../bars/monbat-battery-temperature-bar/monbat-battery-temperature-bar.component';
import { MonbatBatteryVoltageBarComponent } from '../bars/monbat-battery-voltage-bar/monbat-battery-voltage-bar.component';
import { MonbatBatteryHistoricalDataChartComponent } from './charts/monbat-battery-historical-data-chart/monbat-battery-historical-data-chart.component';
import { MonbatBatteryRealTimeChartComponent } from './charts/monbat-battery-real-time-chart/monbat-battery-real-time-chart.component';

interface Context {
  deviceId: string;
  stringIndex: string;
  batteryId: string;
}

@Component({
  selector: 'app-monbat-battery-page',
  templateUrl: './monbat-battery-page.component.html',
  styleUrls: ['./monbat-battery-page.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    DatetimeRangeFilterModule,
    MonbatBatteryTemperatureBarComponent,
    MonbatBatteryVoltageBarComponent,
    MonbatBatteryHistoricalDataChartComponent,
    MonbatBatteryRealTimeChartComponent,
    NzAlertModule,
    HighchartsExportOptionComponent,
  ],
})
export class MonbatBatteryPageComponent implements OnDestroy {
  batteryString$: Observable<MonbatBatteryString | undefined>;
  battery$: Observable<MonbatBattery | undefined>;

  private _timeRange$ = new BehaviorSubject<Date[] | PredefinedTimeRange>(
    PredefinedTimeRange.Last24Hours,
  );

  timeRange$: Observable<Date[] | PredefinedTimeRange>;

  timeRanges = Object.values(PredefinedTimeRange);

  historicalDataRequest$: Observable<DataRequest<MonbatBatteryHistoricalData>>;

  destroy$ = new Subject<void>();

  @ViewChild('chartComponent', { read: MonbatBatteryHistoricalDataChartComponent }) chartComponent:
    | MonbatBatteryHistoricalDataChartComponent
    | undefined;

  constructor(
    private route: ActivatedRoute,
    private api: BatteriesApiService,
    private batteryStringDataService: MonbatBatteryStringDataService,
  ) {
    const context$ = this.route.paramMap.pipe(
      map((params: ParamMap) => {
        const deviceId: string | null = params.get('deviceId');
        const stringIndex: string | null = params.get('stringIndex');
        const batteryId: string | null = params.get('batteryId');

        if (!deviceId || !stringIndex || !batteryId) {
          throw 'Missing context (string/device/battery ID).';
        }

        const context: Context = {
          deviceId,
          stringIndex,
          batteryId,
        };

        return context;
      }),
      tap((context: Context) => {
        setTimeout(() => {
          const element = document.getElementById(`battery-nav-item-${context.batteryId}`);
          if (element != undefined) {
            element.scrollIntoView({ behavior: 'instant', block: 'nearest' });
          }
        }, 0);
      }),
      shareReplay(1),
      takeUntil(this.destroy$),
    );

    this.batteryString$ = context$.pipe(
      switchMap((context: Context) =>
        this.batteryStringDataService.getBatteryStringByIndex(
          context.stringIndex,
          context.deviceId,
        ),
      ),
    );

    this.battery$ = context$.pipe(
      switchMap((context: Context) =>
        this.batteryStringDataService
          .getBatteryStringByIndex(context.stringIndex, context.deviceId)
          .pipe(
            map((batteryString) =>
              batteryString?.batteries.find((battery) => battery.id === context.batteryId),
            ),
          ),
      ),
    );

    this.timeRange$ = this._timeRange$.asObservable();

    this.historicalDataRequest$ = combineLatest([context$, this.timeRange$]).pipe(
      switchMap(([context, timerange]) => {
        if (timerange === PredefinedTimeRange.RealTime) {
          return this.api
            .fetchBatteryRealTimeData(context.deviceId, context.batteryId, 60 * 15)
            .pipe(takeUntil(this.destroy$));
        }

        const tr = convertPredefinedRange(timerange, false);
        return this.api
          .fetchBatteryHistoricalData(
            context.deviceId || '',
            context.batteryId || '',
            new Date(tr[0]),
            new Date(tr[1]),
          )
          .pipe(
            map((req) => this.enchanceWithExtras(req, timerange, context.deviceId || '')),
            takeUntil(this.destroy$),
          );
      }),
      shareReplay(1),
      takeUntil(this.destroy$),
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTimeRangeChange(range: Date[]) {
    this._timeRange$.next(range);
  }

  onPredefinedTimeRangeChange(predefinedRange: PredefinedTimeRange) {
    this._timeRange$.next(predefinedRange);
  }

  private enchanceWithExtras(
    req: DataRequest<MonbatBatteryHistoricalData>,
    timerange: PredefinedTimeRange | Date[] | undefined,
    deviceId: string,
  ): DataRequest<MonbatBatteryHistoricalData> {
    if (req.data) {
      return {
        ...req,
        data: {
          ...req.data,
          requestedTimerange: timerange,
          deviceId,
        },
      };
    }

    return req;
  }
}
