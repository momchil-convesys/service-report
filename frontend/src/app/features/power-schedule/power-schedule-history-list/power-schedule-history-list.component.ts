import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { PowerSchedule } from '../_data/models';

@Component({
  selector: 'app-power-schedule-history-list',
  templateUrl: './power-schedule-history-list.component.html',
  styleUrls: ['./power-schedule-history-list.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class PowerScheduleHistoryListComponent {
  @Input() data: PowerSchedule[] = [];
  @Input() loading: boolean = false;
}

