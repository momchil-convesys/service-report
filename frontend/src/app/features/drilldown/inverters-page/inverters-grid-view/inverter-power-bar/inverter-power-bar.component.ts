import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'app-inverter-power-bar',
  imports: [],
  templateUrl: './inverter-power-bar.component.html',
  styleUrl: './inverter-power-bar.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InverterPowerBarComponent {
  @Input({ required: true }) actualValue: number | null = null;
  @Input({ required: true }) maximumValue: number | null = null;
  @Input({ required: true }) isPerformanceRatio: boolean = false;

  @HostBinding('class.performance-ratio') get isPerformanceRatioClass() {
    return this.isPerformanceRatio;
  }

  @HostBinding('class.active-power') get isActivePowerClass() {
    return !this.isPerformanceRatio;
  }
}
