import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Observable,
  ReplaySubject,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  shareReplay,
  switchMap,
  withLatestFrom,
} from 'rxjs';
import { DataRequest, DeviceType, IntegrationPeriod } from '../../../constants';
import { Plant } from '../../../data/models';
import { BaseChartContext } from '../../../shared/base-chart-component/base-chart-component.component';
import {
  DatetimeRangeModel,
  isSameDatetimeRange,
} from '../../../shared/datetime-range-select/models';
import { PageRoutingService } from '../../../shared/page-routing.service';
import { PVProductionApiService } from './_data/api.service';
import { PVProductionDataService } from './_data/data.service';
import { PVProductionData } from './_data/pv-production';

@Component({
  selector: 'app-pv-production-chart-widget',
  templateUrl: './pv-production-chart-widget.component.html',
  styleUrls: ['./pv-production-chart-widget.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PVProductionApiService, PVProductionDataService],
  standalone: false,
})
export class PvProductionChartWidgetComponent {
  private _targetRange$: ReplaySubject<DatetimeRangeModel> = new ReplaySubject(1);

  chartDataRequest$: Observable<DataRequest<PVProductionData>>;

  chartContext$: Observable<BaseChartContext>;

  timeZone$: Observable<string | undefined>;

  defaultIntegrationPeriod$: Observable<IntegrationPeriod>;

  constructor(data: PVProductionDataService, pageRouting: PageRoutingService) {
    const plant$: Observable<Plant> = pageRouting
      .getPlantFromQueryParams()
      .pipe(takeUntilDestroyed());
    const deviceId$: Observable<string | undefined> = pageRouting
      .getDeviceIdFromQueryParams()
      .pipe(takeUntilDestroyed());

    this.timeZone$ = plant$.pipe(map((plant) => plant.timeZone));

    this.defaultIntegrationPeriod$ = combineLatest([plant$, deviceId$]).pipe(
      map(([plant, deviceId]) => {
        /**
         * Targeting production chart in plant page (not device)
         * for plants with schedules that are provided in 15 min intervals.
         */
        if (!deviceId && plant.plantSpecificMetadata?.scheduleIntegrationPeriodMinutes === 15) {
          return IntegrationPeriod.QuaterOfAnHour;
        }

        return IntegrationPeriod.Hours;
      }),
    );

    this.chartContext$ = combineLatest([
      plant$,
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
      withLatestFrom(plant$),
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
      plant$,
    ]).pipe(
      switchMap(([deviceIds, targetRange, plant]) =>
        data.getPVProductionData(plant, deviceIds, targetRange),
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
}
