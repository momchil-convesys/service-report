import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { PositionInTime, powerLimitScheduleStatusLabels } from '../../../constants';
import { MonbatSchedule } from '../_data/models';

@Component({
  selector: 'app-monbat-status',
  templateUrl: './monbat-status.component.html',
  styleUrls: ['./monbat-status.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class MonbatStatusComponent {
  @Input() schedule: MonbatSchedule | undefined;

  powerLimitScheduleStatusLabels = powerLimitScheduleStatusLabels;

  positionInTime(item: MonbatSchedule): PositionInTime {
    return 'future';
  }
}
