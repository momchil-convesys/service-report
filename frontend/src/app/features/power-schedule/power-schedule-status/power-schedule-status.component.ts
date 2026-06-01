import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { PowerSchedule } from '../_data/models';

import { PositionInTime, powerScheduleStatusLabels } from '../../../constants';
import { ClockService } from '../../../data/services/clock.service';

@Component({
  selector: 'app-power-schedule-status',
  templateUrl: './power-schedule-status.component.html',
  styleUrls: ['./power-schedule-status.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class PowerScheduleStatusComponent {
  @Input() schedule: PowerSchedule | undefined;

  powerScheduleStatusLabels = powerScheduleStatusLabels;

  private _clock = inject(ClockService);

  positionInTime(item: PowerSchedule): PositionInTime {
    const interval = {
      start: new Date(item.applicableRange.from),
      end: new Date(item.applicableRange.to),
    };

    return this._clock.getZonedPositionInTimeForInterval(interval, item.plantTimeZone);
  }
}
