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
} from 'rxjs';
import { PVPowerDataForDevice_NEW } from 'src/app/features/pv-charts/pv-power/_data/pv-power';
import { DataRequest, DeviceType } from '../../../../constants';
import { Device, Plant } from '../../../../data/models';
import { BaseChartContext } from '../../../../shared/base-chart-component/base-chart-component.component';
import {
  DatetimeRangeModel,
  isSameDatetimeRange,
} from '../../../../shared/datetime-range-select/models';
import { PageRoutingService } from '../../../../shared/page-routing.service';
import { PVPowerApiService } from '../_data/api.service';
import { PVPowerDataService } from '../_data/pv-power.service';

@Component({
  selector: 'app-pv-power-chart-widget-device',
  templateUrl: './pv-power-chart-widget-device.component.html',
  styleUrl: './pv-power-chart-widget-device.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PVPowerApiService, PVPowerDataService],
  standalone: false,
})
export class PvPowerChartWidgetDeviceComponent {
  chartDataRequest$: Observable<DataRequest<PVPowerDataForDevice_NEW>>;

  private _targetRange$: ReplaySubject<DatetimeRangeModel> = new ReplaySubject(1);

  timeZone$: Observable<string | undefined>;

  chartContext$: Observable<BaseChartContext>;

  constructor(data: PVPowerDataService, pageRouting: PageRoutingService) {
    const plant$: Observable<Plant> = pageRouting.getPlantFromQueryParams().pipe(
      filter((plant) => plant.type === DeviceType.Solar || plant.type === DeviceType.Pump),
      takeUntilDestroyed(),
    );

    const device$: Observable<Device> = pageRouting.getDeviceFromQueryParams().pipe(
      filter((device) => device.type === DeviceType.Solar || device.type === DeviceType.Pump),
      takeUntilDestroyed(),
    );

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

    this.chartDataRequest$ = combineLatest([device$, this._targetRange$]).pipe(
      switchMap(([device, targetRange]) => data.getPVPowerDataForDevice(device, targetRange)),
      shareReplay(1),
      takeUntilDestroyed(),
    );
  }

  onDatetimeRangeChange(value: DatetimeRangeModel) {
    this._targetRange$.next(value);
  }
}
