import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-power-limit-icon',
  imports: [NzIconModule],
  templateUrl: './power-limit-icon.component.html',
  styleUrls: ['./power-limit-icon.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PowerLimitIconComponent {
  @Input() scheduledLimit = false;
}
