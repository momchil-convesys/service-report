import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { PowerLimitScheduleStatus, powerLimitScheduleStatusLabels } from 'src/app/constants';
import { MonbatSchedule } from '../_data/models';

@Component({
  selector: 'app-monbat-activity',
  templateUrl: './monbat-activity.component.html',
  styleUrl: './monbat-activity.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class MonbatActivityComponent {
  @Input({ required: true }) schedule!: MonbatSchedule;

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
