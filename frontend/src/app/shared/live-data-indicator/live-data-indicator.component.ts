import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'app-live-data-indicator',
  imports: [NzTooltipModule, NzBadgeModule],
  templateUrl: './live-data-indicator.component.html',
  styleUrl: './live-data-indicator.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiveDataIndicatorComponent {
  @Input() title: string = $localize`Data is updated live. No need to refresh the page.`;
  @Input() size: 'default' | 'large' = 'default';

  @HostBinding('class.default-size') get() {
    return this.size === 'default';
  }
}
