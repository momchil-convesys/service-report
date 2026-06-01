import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Observable, shareReplay, switchMap } from 'rxjs';
import { DataRequest, DeviceType } from '../../constants';
import { Plant } from '../../data/models';
import { AlarmEventsService } from '../../features/alarm-events/_data/data.service';
import { AlarmEvent } from '../../features/alarm-events/_data/models';
import { PageRoutingService } from '../../shared/page-routing.service';

@Component({
  selector: 'app-plant-overview-page',
  templateUrl: './plant-overview-page.component.html',
  styleUrls: ['./plant-overview-page.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PageRoutingService],
  standalone: false,
})
export class PlantOverviewPageComponent {
  alarmEventsRequest$: Observable<DataRequest<AlarmEvent[]>> | undefined;

  plant$: Observable<Plant>;

  devicesCountBreakpoint = 4;

  constructor(
    alarmEventsService: AlarmEventsService,
    private pageRouting: PageRoutingService,
    private router: Router,
  ) {
    this.plant$ = pageRouting.getPlantFromQueryParams();

    this.alarmEventsRequest$ = this.plant$.pipe(
      switchMap((plant) => alarmEventsService.getAlarmEvents(1, 5, plant.deviceIds, [])),
      shareReplay(1),
      takeUntilDestroyed(),
    );
  }

  isPump(plant: Plant | null): boolean {
    if (plant && plant.devices.length > 0) {
      return plant.devices[0].type === DeviceType.Pump;
    }

    return false;
  }

  isSolar(plant: Plant | null): boolean {
    if (plant && plant.devices.length > 0) {
      return plant.devices[0].type === DeviceType.Solar;
    }

    return false;
  }

  isWind(plant: Plant | null): boolean {
    if (plant && plant.devices.length > 0) {
      return plant.devices[0].type === DeviceType.Wind;
    }

    return false;
  }

  isAratidenPlant(plant: Plant | null): boolean {
    /**
     * TODO: do not check against HARDCODED ids!
     */
    return plant?.id === '17';
  }

  onDeviceClick(deviceId: string) {
    void this.router.navigate(['..', 'devices', deviceId], {
      relativeTo: this.pageRouting.route,
      preserveFragment: true,
    });
  }
}
