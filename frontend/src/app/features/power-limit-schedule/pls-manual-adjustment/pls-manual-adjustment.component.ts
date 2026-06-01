import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  HostListener,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import {
  Observable,
  ReplaySubject,
  combineLatest,
  concat,
  delay,
  distinctUntilChanged,
  filter,
  map,
  of,
  shareReplay,
  switchMap,
  withLatestFrom,
} from 'rxjs';
import { DataRequest, DeviceType, IntegrationPeriod } from '../../../constants';
import { Plant } from '../../../data/models';
import { BaseChartContext } from '../../../shared/base-chart-component/base-chart-component.component';
import { DatetimeRangeSelectComponent } from '../../../shared/datetime-range-select/datetime-range-select.component';
import {
  DatetimeRangeModel,
  isSameDatetimeRange,
  isSameDatetimeRangeIgnoreIntegrationPeriod,
} from '../../../shared/datetime-range-select/models';
import { HighchartsExportOptionComponent } from '../../../shared/highcharts-export-option/highcharts-export-option.component';
import { LiveDataIndicatorComponent } from '../../../shared/live-data-indicator/live-data-indicator.component';
import { PageRoutingService } from '../../../shared/page-routing.service';
import { ProductionValueComponent } from '../../pv-charts/_shared/production-value/production-value.component';
import { PVProductionApiService } from '../../pv-charts/pv-production-chart/_data/api.service';
import { PVProductionDataService } from '../../pv-charts/pv-production-chart/_data/data.service';
import { PVProductionData } from '../../pv-charts/pv-production-chart/_data/pv-production';
import { PvProductionChartComponent } from '../../pv-charts/pv-production-chart/pv-production-chart.component';
import { PlsManualAdjustmentTableComponent } from './pls-manual-adjustment-table/pls-manual-adjustment-table.component';

@Component({
  selector: 'app-pls-manual-adjustment',
  imports: [
    CommonModule,
    NzTooltipModule,
    NzCardModule,
    NzAlertModule,
    NzIconModule,
    ProductionValueComponent,
    LiveDataIndicatorComponent,
    DatetimeRangeSelectComponent,
    HighchartsExportOptionComponent,
    PvProductionChartComponent,
    PlsManualAdjustmentTableComponent,
  ],
  providers: [PVProductionDataService, PVProductionApiService, PageRoutingService],
  templateUrl: './pls-manual-adjustment.component.html',
  styleUrl: './pls-manual-adjustment.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlsManualAdjustmentComponent {
  private _targetRange$: ReplaySubject<DatetimeRangeModel> = new ReplaySubject(1);

  chartDataRequest$: Observable<DataRequest<PVProductionData>>;
  tableDataRequest$: Observable<DataRequest<PVProductionData>>;

  chartContext$: Observable<BaseChartContext>;

  plant$: Observable<Plant>;

  @HostBinding('class.sticky-chart') stickyCahart: boolean = false;

  @HostListener('window:resize')
  updateStickyChartFlag() {
    this.stickyCahart = window.innerHeight > 900;
  }

  constructor(data: PVProductionDataService, pageRouting: PageRoutingService) {
    this.updateStickyChartFlag();

    this.plant$ = pageRouting.getPlantFromQueryParams().pipe(takeUntilDestroyed());

    // Note that PV production request
    // needs a list of device IDs
    // instead of just the plant ID.
    const deviceId$: Observable<string | undefined> = pageRouting
      .getDeviceIdFromQueryParams()
      .pipe(takeUntilDestroyed());

    this.chartContext$ = combineLatest([
      this.plant$,
      deviceId$,
      this._targetRange$.pipe(distinctUntilChanged(isSameDatetimeRange)),
    ]).pipe(
      map(([plant, deviceId, targetRange]) => ({
        plant,
        deviceId: deviceId || null,
        targetRange,
      })),
      shareReplay(1),
      takeUntilDestroyed(),
    );

    const deviceIds$: Observable<string[]> = deviceId$.pipe(
      withLatestFrom(this.plant$),
      map(([deviceId, plant]) => {
        if (deviceId) {
          const device = plant.devices.find((x) => deviceId === x.id);
          return device && device.type === DeviceType.Solar ? [device.id] : [];
        }

        return plant.type === DeviceType.Solar ? plant.deviceIds : [];
      }),
      filter((deviceIds) => deviceIds.length > 0),
    );

    this.chartDataRequest$ = combineLatest([
      deviceIds$,
      this._targetRange$.pipe(distinctUntilChanged(isSameDatetimeRange)),
      this.plant$,
    ]).pipe(
      switchMap(([deviceIds, targetRange, plant]) => {
        if (targetRange.integrationPeriod !== IntegrationPeriod.QuaterOfAnHour) {
          return data.getPVProductionData(plant, deviceIds, targetRange);
        }

        return concat(
          // This sequence will force refresh chart data.
          // Delay is added to make smoother switching.
          of({ isLoading: true, data: undefined }),
          of({ isLoading: false, data: undefined }).pipe(delay(1000)),
          this.tableDataRequest$,
        );
      }),
      shareReplay(1),
      takeUntilDestroyed(),
    );

    this.tableDataRequest$ = combineLatest([
      deviceIds$,
      this._targetRange$.pipe(distinctUntilChanged(isSameDatetimeRangeIgnoreIntegrationPeriod)),
      this.plant$,
    ]).pipe(
      switchMap(([deviceIds, targetRange, plant]) =>
        data.getPVProductionData(plant, deviceIds, {
          ...targetRange,
          integrationPeriod: IntegrationPeriod.QuaterOfAnHour,
        }),
      ),
      shareReplay(1),
      takeUntilDestroyed(),
    );
  }

  onDatetimeRangeChange(value: DatetimeRangeModel) {
    this._targetRange$.next(value);
  }

  showPowerMeterIndicator(context: BaseChartContext | null): boolean {
    return (context?.plant.plantSpecificMetadata?.hasPowerMeter && !context.deviceId) || false;
  }

  getDefaultIntegrationPeriod(): IntegrationPeriod {
    return IntegrationPeriod.QuaterOfAnHour;
  }
}
