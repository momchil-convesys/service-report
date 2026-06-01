import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isAfter } from 'date-fns';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzCardModule } from 'ng-zorro-antd/card';
import {
  BehaviorSubject,
  Observable,
  ReplaySubject,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  of,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';
import { DataRequest, DeviceType } from '../../../constants';
import { Device, Plant } from '../../../data/models';
import { BaseChartContext } from '../../../shared/base-chart-component/base-chart-component.component';
import { DatetimeRangeSelectComponent } from '../../../shared/datetime-range-select/datetime-range-select.component';
import {
  DatetimeRangeModel,
  isSameDatetimeRange,
} from '../../../shared/datetime-range-select/models';
import { DeviceCurrentErrorsWidgetComponent } from '../../../shared/device-current-errors-widget/device-current-errors-widget.component';
import { HighchartsExportOptionComponent } from '../../../shared/highcharts-export-option/highcharts-export-option.component';
import { PageRoutingService } from '../../../shared/page-routing.service';
import { BatteriesApiService } from '../_data/api.service';
import { InverterDataService } from '../_data/inverter-data.service';
import {
  EnergyTrendData,
  EnergyTrendDataPoint,
  HybridInverterCurrentData,
  HybridInverterDataPoint,
} from '../_data/models';
import { EnergyTrendChartComponent } from '../charts/energy-trend-chart.component.ts/energy-trend-chart.component';
import { MonbatFlowChartWidgetComponent } from '../monbat-flow-chart-widget/monbat-flow-chart-widget.component';

@Component({
  selector: 'app-hybrid-inverter-overview-page',
  imports: [
    NzCardModule,
    EnergyTrendChartComponent,
    // HybridInverterChartComponent,
    // HybridInverterChartConsumptionComponent,
    // HybridInverterChartAccumulatedConsumptionComponent,
    // HybridInverterChartAccumulatedGridUsageComponent,
    AsyncPipe,
    HighchartsExportOptionComponent,
    MonbatFlowChartWidgetComponent,
    DatetimeRangeSelectComponent,
    NzAlertModule,
    DeviceCurrentErrorsWidgetComponent,
  ],
  templateUrl: './hybrid-inverter-overview-page.component.html',
  styleUrl: './hybrid-inverter-overview-page.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [InverterDataService, BatteriesApiService],
})
export class HybridInverterOverviewPageComponent {
  private _targetRange$: ReplaySubject<DatetimeRangeModel> = new ReplaySubject(1);

  // historicalDataRequest$: Observable<DataRequest<HybridInverterHistoricalData> | undefined>;
  // historicalDataIsLoading$: Observable<boolean>;

  currentDataRequest$: Observable<DataRequest<HybridInverterCurrentData | null> | undefined>;
  currentDataRequestIsLoading$: Observable<boolean>;

  energyTrendRequest$: Observable<DataRequest<EnergyTrendData> | undefined>;
  energyTrendIsLoading$: Observable<boolean>;

  chartContext$: Observable<BaseChartContext>;

  timeZone$: Observable<string | undefined>;

  newDayTrigger$ = new BehaviorSubject<boolean>(true);

  hasPV$: Observable<boolean>;

  constructor(data: InverterDataService, pageRouting: PageRoutingService) {
    const plant$: Observable<Plant> = pageRouting.getPlantFromQueryParams().pipe(
      filter((plant) => plant.type === DeviceType.BatteryString),
      takeUntilDestroyed(),
    );

    const device$: Observable<Device | undefined> = pageRouting.getDeviceFromQueryParams().pipe(
      filter((device) => device.type === DeviceType.BatteryString),
      takeUntilDestroyed(),
    );

    this.hasPV$ = device$.pipe(map((device) => !!device?.deviceSpecificMetadata?.hasPV));
    this.timeZone$ = plant$.pipe(map((plant) => plant.timeZone));

    this.chartContext$ = combineLatest([
      plant$,
      device$,
      this._targetRange$.pipe(distinctUntilChanged(isSameDatetimeRange)),
    ]).pipe(
      map(([plant, device, targetRange]) => ({
        plant,
        deviceId: device?.id || null,
        targetRange,
      })),
      shareReplay(1),
      takeUntilDestroyed(),
    );

    // this.historicalDataRequest$ = combineLatest([device$, this._targetRange$]).pipe(
    //   switchMap(([device, targetRange]) =>
    //     device?.id
    //       ? data
    //           .getInverterHistoricalData(
    //             device.id,
    //             targetRange.from.toISOString(),
    //             targetRange.to.toISOString(),
    //           )
    //           .pipe(tap((req) => this.checkNewDay(req?.data?.dataPoints || [], targetRange)))
    //       : of(undefined),
    //   ),
    //   shareReplay(1),
    //   takeUntilDestroyed(),
    // );

    // this.historicalDataIsLoading$ = this.historicalDataRequest$.pipe(
    //   map((req) => (req ? req.isLoading : false)),
    // );

    this.energyTrendRequest$ = combineLatest([device$, this._targetRange$]).pipe(
      switchMap(([device, targetRange]) =>
        device?.id
          ? data
              .getEnergyTrendData(
                //todo change
                device.id,
                targetRange.from.toISOString(),
                targetRange.to.toISOString(),
              )
              .pipe(
                tap((req) => this.checkNewDayEnergyTrend(req?.data?.dataPoints || [], targetRange)),
              )
          : of(undefined),
      ),
      shareReplay(1),
      takeUntilDestroyed(),
    );

    this.energyTrendIsLoading$ = this.energyTrendRequest$.pipe(
      map((req) => (req ? req.isLoading : false)),
    );

    this.currentDataRequest$ = device$.pipe(
      switchMap((device) => (device?.id ? data.getInverterCurrentlData(device.id) : of(undefined))),
      shareReplay(1),
      takeUntilDestroyed(),
    );

    this.currentDataRequestIsLoading$ = this.currentDataRequest$.pipe(
      map((req) => (req ? req.isLoading : false)),
    );
  }

  onDatetimeRangeChange(value: DatetimeRangeModel) {
    this._targetRange$.next(value);
  }

  private checkNewDay(dataPoints: HybridInverterDataPoint[], targetRange: DatetimeRangeModel) {
    if (dataPoints.length > 0) {
      const lastPoint = dataPoints[dataPoints.length - 1];
      const targetRangeEnd = targetRange.to;
      if (isAfter(lastPoint.timestamp, targetRangeEnd) && isAfter(new Date(), targetRangeEnd)) {
        console.warn('A new day has come!');
        this.newDayTrigger$.next(false);
        setTimeout(() => {
          this.newDayTrigger$.next(true);
        }, 0);
      }
    }
  }
  private checkNewDayEnergyTrend(
    dataPoints: EnergyTrendDataPoint[],
    targetRange: DatetimeRangeModel,
  ) {
    if (dataPoints.length > 0) {
      const lastPoint = dataPoints[dataPoints.length - 1];
      const targetRangeEnd = targetRange.to;
      if (isAfter(lastPoint.timestamp, targetRangeEnd) && isAfter(new Date(), targetRangeEnd)) {
        console.warn('A new day has come!');
        this.newDayTrigger$.next(false);
        setTimeout(() => {
          this.newDayTrigger$.next(true);
        }, 0);
      }
    }
  }
}
