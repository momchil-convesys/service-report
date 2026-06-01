import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { powerScheduleStatusLabels } from '../../../constants';
import { PowerSchedule } from '../_data/models';
import { PowerScheduleStatus } from '../_data/power-schedule.dto';

@Component({
  selector: 'app-power-schedule-activity',
  templateUrl: './power-schedule-activity.component.html',
  styleUrl: './power-schedule-activity.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class PowerScheduleActivityComponent {
  @Input({ required: true }) schedule!: PowerSchedule;

  powerScheduleStatusLabels = powerScheduleStatusLabels;

  getColorForStatus(status: PowerScheduleStatus): string {
    if (status === 'enabled') {
      return '#23BE73'; // @green-6
    }

    if (status === 'disabled') {
      return '#d9343a'; // @red-7
    }

    return 'gray';
  }
}
