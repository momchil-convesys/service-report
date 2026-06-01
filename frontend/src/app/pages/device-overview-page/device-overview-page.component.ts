import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, Observable, shareReplay, switchMap } from 'rxjs';
import { DataRequest, DeviceType } from '../../constants';
import { Device } from '../../data/models';
import { AlarmEventsService } from '../../features/alarm-events/_data/data.service';
import { AlarmEvent } from '../../features/alarm-events/_data/models';
import { PageRoutingService } from '../../shared/page-routing.service';

@Component({
  selector: 'app-device-overview-page',
  templateUrl: './device-overview-page.component.html',
  styleUrls: ['./device-overview-page.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PageRoutingService],
  standalone: false,
})
export class DeviceOverviewPageComponent {
  alarmEventsRequest$: Observable<DataRequest<AlarmEvent[]>> | undefined;
  device$: Observable<Device>;

  DeviceType = DeviceType;

  constructor(dataService: AlarmEventsService, pageRouting: PageRoutingService) {
    this.device$ = pageRouting.getDeviceFromQueryParams();

    this.alarmEventsRequest$ = this.device$.pipe(
      filter((device) => device.type === DeviceType.Solar || device.type === DeviceType.Pump),
      switchMap((device) => dataService.getAlarmEvents(1, 5, [device.id], [])),
      shareReplay(1),
      takeUntilDestroyed(),
    );
  }
}
