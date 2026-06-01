import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-system-setup-icon',
  imports: [NzIconModule],
  templateUrl: './system-setup-icon.component.html',
  styleUrl: './system-setup-icon.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemSetupIconComponent {
  @Input() setup: 'cloud' | 'on-site' | undefined | null;
}
