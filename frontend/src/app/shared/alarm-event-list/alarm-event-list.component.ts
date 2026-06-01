import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { Observable } from 'rxjs';
import { AlarmTriggerType, DataRequest } from '../../constants';
import {
  AlarmEvent,
  AlarmEventDetailsDeviceStateChange,
} from '../../features/alarm-events/_data/models';
import { AlarmTypeComponent } from '../alarm-type/alarm-type.component';
import { DeviceLinkModule } from '../device-link/device-link.module';
import { DeviceStateModule } from '../device-state/device-state.module';
import { RelativeTimestampComponent } from '../relative-timestamp/relative-timestamp.component';

@Component({
  selector: 'app-alarm-event-list[alarmEventsRequest]',
  imports: [
    CommonModule,
    RouterModule,
    DeviceStateModule,
    DeviceLinkModule,
    AlarmTypeComponent,
    RelativeTimestampComponent,
    NzEmptyModule,
    NzSpinModule,
    NzAlertModule,
  ],
  templateUrl: './alarm-event-list.component.html',
  styleUrls: ['./alarm-event-list.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlarmEventListComponent {
  @Input({ required: true }) alarmEventsRequest: Observable<DataRequest<AlarmEvent[]>> | undefined;
  @Input() deviceIds: (string | null)[] | null = null;

  AlarmTriggerType = AlarmTriggerType;

  detailsForDeviceStateChange(eventItem: AlarmEvent): AlarmEventDetailsDeviceStateChange[] {
    return <AlarmEventDetailsDeviceStateChange[]>eventItem.details;
  }
}
