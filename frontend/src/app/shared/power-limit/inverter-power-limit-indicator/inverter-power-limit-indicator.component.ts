import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { PowerLimitDetails } from '../../../data/models';
import { RelativeTimestampComponent } from '../../relative-timestamp/relative-timestamp.component';
import { PowerLimitIconComponent } from '../power-limit-icon/power-limit-icon.component';

@Component({
  selector: 'app-inverter-power-limit-indicator',
  imports: [NzPopoverModule, RelativeTimestampComponent, PowerLimitIconComponent],
  templateUrl: './inverter-power-limit-indicator.component.html',
  styleUrls: ['./inverter-power-limit-indicator.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InverterPowerLimitIndicatorComponent {
  @Input() powerLimit: PowerLimitDetails | null = null;
  @Input() mode: 'icon' | 'value' | 'icon-value' | 'tag' = 'icon';
}
