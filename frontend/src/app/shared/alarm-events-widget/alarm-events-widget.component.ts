import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { Observable } from 'rxjs';
import { DataRequest } from '../../constants';
import { AlarmEvent } from '../../features/alarm-events/_data/models';
import { AlarmEventListComponent } from '../alarm-event-list/alarm-event-list.component';

@Component({
  selector: 'app-alarm-events-widget[alarmEventsRequest]',
  imports: [NzCardModule, AlarmEventListComponent, RouterModule],
  templateUrl: './alarm-events-widget.component.html',
  styleUrls: ['./alarm-events-widget.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlarmEventsWidgetComponent {
  @Input({ required: true }) alarmEventsRequest: Observable<DataRequest<AlarmEvent[]>> | undefined;
  @Input() deviceIds: (string | null)[] | null = [];
}
