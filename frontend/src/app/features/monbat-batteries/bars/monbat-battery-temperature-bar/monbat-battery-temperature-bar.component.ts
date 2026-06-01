import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { ValueDisplayComponent } from '../../../../shared/value-display/value-display.component';

@Component({
  selector: 'app-monbat-battery-temperature-bar',
  templateUrl: './monbat-battery-temperature-bar.component.html',
  styleUrls: ['./monbat-battery-temperature-bar.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ValueDisplayComponent],
})
export class MonbatBatteryTemperatureBarComponent {
  @Input() temperature: number | null = null;
  @Input() fullHeight = false;

  getColor() {
    return `rgba(255, ${158 - 158 * (this.temperature || 0 / 100)}, 19, 1)`;
  }
}
