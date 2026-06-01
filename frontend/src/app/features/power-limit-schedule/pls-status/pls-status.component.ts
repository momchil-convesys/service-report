import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { powerLimitScheduleStatusLabels } from '../../../constants';
import { PowerLimitSchedule } from '../_data/models';
import { PositionInTime, positionInTime } from '../helpers';

@Component({
  selector: 'app-pls-status',
  templateUrl: './pls-status.component.html',
  styleUrls: ['./pls-status.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class PlsStatusComponent {
  @Input() schedule: PowerLimitSchedule | undefined;

  powerLimitScheduleStatusLabels = powerLimitScheduleStatusLabels;

  positionInTime(item: PowerLimitSchedule): PositionInTime {
    return positionInTime(item);
  }
}
