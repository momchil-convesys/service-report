import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { PowerScheduleSetpointValueComponent } from '../../power-schedule-setpoint-value/power-schedule-setpoint-value.component';
import {
  PowerScheduleTrackingInterval,
  SetpointValue,
} from '../_data/power-schedule-tracking.model';

@Component({
  selector: 'app-power-schedule-manual-adjustment-cell-history',
  imports: [NzIconModule, NzPopoverModule, PowerScheduleSetpointValueComponent, DatePipe],
  templateUrl: './power-schedule-manual-adjustment-cell-history.component.html',
  styleUrl: './power-schedule-manual-adjustment-cell-history.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class PowerScheduleManualAdjustmentCellHistoryComponent {
  @Input({ required: true }) interval: PowerScheduleTrackingInterval | undefined;

  getBessPowerSetpointClass(setpoint: SetpointValue): string {
    if (!setpoint.value) {
      return '';
    }
    return setpoint.value > 0 ? 'discharge' : 'charge';
  }
}
