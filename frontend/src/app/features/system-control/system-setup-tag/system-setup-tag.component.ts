import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-system-setup-tag',
  imports: [],
  templateUrl: './system-setup-tag.component.html',
  styleUrl: './system-setup-tag.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemSetupTagComponent {
  @Input() setup: 'cloud' | 'on-site' | undefined | null;
}
