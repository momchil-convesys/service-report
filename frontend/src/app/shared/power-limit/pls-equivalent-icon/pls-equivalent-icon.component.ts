import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'app-pls-equivalent-icon',
  imports: [NzTooltipModule],
  templateUrl: './pls-equivalent-icon.component.html',
  styleUrl: './pls-equivalent-icon.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlsEquivalentIconComponent {
  @Input() hint: 'pvSetpoint' | 'bessSetpoint' | 'gridSetpoint' | undefined;

  getTooltipText(): string {
    if (this.hint === 'pvSetpoint') {
      return $localize`The maximum energy that can be generated, considering the specified PV power setpoint.`;
    }

    if (this.hint === 'bessSetpoint') {
      return $localize`The energy that can be stored or discharged, considering the specified BESS power setpoint.`;
    }

    if (this.hint === 'gridSetpoint') {
      return $localize`The energy equivalent for grid export or import, considering the specified grid power setpoint.`;
    }

    // This was the initial text for the tooltip limit, but the component was extended to support other hints.
    return $localize`The maximum energy that can be generated, considering the specified active power limit.`;
  }
}
