import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
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
import { DataRequest, DeviceType } from '../../constants';
import { DeviceStateModule } from '../../shared/device-state/device-state.module';
import { DeviceAvailabilityPercentageComponent } from './device-availability-percentage/device-availability-percentage.component';
import { DeviceAvailabilityTimelineComponent } from './device-availability-timeline/device-availability-timeline.component';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Plant } from 'src/app/data/models';
import { DatetimeRangeSelectComponent } from 'src/app/shared/datetime-range-select/datetime-range-select.component';
import {
  DatetimeRangeModel,
  isSameDatetimeRange,
} from 'src/app/shared/datetime-range-select/models';
import { PageRoutingService } from 'src/app/shared/page-routing.service';
import { BaseChartContext } from '../../shared/base-chart-component/base-chart-component.component';
import { DeviceAvailabilityApiService } from './_data/api.service';
import { DevicesAvailability } from './_data/models';
import { DeviceAvailabilityXRangeChartComponent } from './device-availability-x-range-chart/device-availability-x-range-chart.component';
import { DeviceAvailabilityService } from './device-availability.service';

@Component({
  selector: 'app-device-availability-widget',
  imports: [
    CommonModule,
    NzCardModule,
    NzAlertModule,
    NzTabsModule,
    DeviceStateModule,
    DatetimeRangeSelectComponent,
    DeviceAvailabilityTimelineComponent,
    DeviceAvailabilityPercentageComponent,
    DeviceAvailabilityXRangeChartComponent,
  ],
  providers: [DeviceAvailabilityApiService, DeviceAvailabilityService],
  templateUrl: './device-availability-widget.component.html',
  styleUrls: ['./device-availability-widget.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeviceAvailabilityWidgetComponent {
  private _targetRange$: ReplaySubject<DatetimeRangeModel> = new ReplaySubject(1);

  dataRequest$: Observable<DataRequest<DevicesAvailability>> | undefined;

  chartContext$: Observable<BaseChartContext>;

  timeZone$: Observable<string | undefined>;

  constructor(pageRouting: PageRoutingService, dataService: DeviceAvailabilityService) {
    const plant$: Observable<Plant> = pageRouting.getPlantFromQueryParams().pipe(
      filter((plant) => plant.type === DeviceType.Solar || plant.type === DeviceType.Pump),
      takeUntilDestroyed(),
    );
    const deviceId$: Observable<string | undefined> = pageRouting
      .getDeviceIdFromQueryParams()
      .pipe(takeUntilDestroyed());

    this.timeZone$ = plant$.pipe(map((plant) => plant.timeZone));

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
    );

    const deviceIds$: Observable<string[]> = deviceId$.pipe(
      withLatestFrom(plant$),
      map(([deviceId, plant]) => {
        if (deviceId) {
          const device = plant.devices.find((x) => deviceId === x.id);
          return device ? [device.id] : [];
        }

        return plant.deviceIds;
      }),
      filter((deviceIds) => deviceIds.length > 0),
    );

    this.timeZone$ = plant$.pipe(map((plant) => plant.timeZone));

    this.dataRequest$ = combineLatest([deviceIds$, this._targetRange$]).pipe(
      switchMap(([deviceIds, targetRange]) =>
        dataService.getDevicesAvailability(deviceIds, targetRange),
      ),
      shareReplay(1),
      takeUntilDestroyed(),
    );
  }

  onDatetimeRangeChange(value: DatetimeRangeModel) {
    this._targetRange$.next(value);
  }
}
