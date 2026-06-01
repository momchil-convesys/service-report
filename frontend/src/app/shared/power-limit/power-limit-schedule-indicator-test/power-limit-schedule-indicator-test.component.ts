import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { PowerLimitIconComponent } from 'src/app/shared/power-limit/power-limit-icon/power-limit-icon.component';
import { PowerLimitScheduleIndicatorComponent } from 'src/app/shared/power-limit/power-limit-schedule-indicator/power-limit-schedule-indicator.component';
import {
  ActivePowerLimitSchedule,
  adaptActivePowerLimitSchedule,
} from '../../../features/power-limit-schedule/_data/active-schedule';
import { mockSchedule1, mockSchedule2, mockSchedule3 } from './mock';

@Component({
  selector: 'app-power-limit-schedule-indicator-test',
  imports: [PowerLimitScheduleIndicatorComponent, PowerLimitIconComponent, NzCardComponent],
  templateUrl: './power-limit-schedule-indicator-test.component.html',
  styleUrl: './power-limit-schedule-indicator-test.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PowerLimitScheduleIndicatorTestComponent {
  pwSchedule1: ActivePowerLimitSchedule = adaptActivePowerLimitSchedule(
    mockSchedule1,
    'Europe/Sofia',
    undefined,
  );

  pwSchedule2: ActivePowerLimitSchedule = adaptActivePowerLimitSchedule(
    mockSchedule2,
    'Europe/Sofia',
    undefined,
  );

  pwSchedule3: ActivePowerLimitSchedule = adaptActivePowerLimitSchedule(
    mockSchedule3,
    'Europe/Sofia',
    undefined,
  );
}
