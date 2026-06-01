import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { PowerLimitScheduleStatus, powerLimitScheduleStatusLabels } from 'src/app/constants';
import { PowerLimitSchedule } from 'src/app/features/power-limit-schedule/_data/models';

@Component({
  selector: 'app-pls-activity',
  templateUrl: './pls-activity.component.html',
  styleUrl: './pls-activity.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class PlsActivityComponent {
  @Input({ required: true }) schedule!: PowerLimitSchedule;

  powerLimitScheduleStatusLabels = powerLimitScheduleStatusLabels;

  getColorForStatus(status: PowerLimitScheduleStatus): string {
    if (status === 'enabled') {
      return '#23BE73'; // @green-6
    }

    if (status === 'disabled') {
      return '#d9343a'; // @red-7
    }

    return 'gray';
  }
}
