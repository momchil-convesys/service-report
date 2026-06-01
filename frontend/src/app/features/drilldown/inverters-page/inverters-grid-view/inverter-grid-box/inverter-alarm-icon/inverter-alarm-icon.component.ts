import { Component, HostBinding, Input, ViewEncapsulation } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { InverterAlarm_DTO } from '../../../_data/dto';

@Component({
  selector: 'app-inverter-alarm-icon',
  standalone: true,
  imports: [NzIconModule],
  templateUrl: './inverter-alarm-icon.component.html',
  styleUrls: ['./inverter-alarm-icon.component.less'],
  encapsulation: ViewEncapsulation.None,
})
export class InverterAlarmIconComponent {
  @Input() severity: InverterAlarm_DTO['severity'] = 'info';
  @Input() inverse = false;

  @HostBinding('class') get hostClass() {
    return this.severity;
  }
}
