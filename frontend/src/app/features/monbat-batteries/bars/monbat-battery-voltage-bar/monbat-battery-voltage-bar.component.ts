import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { ValueDisplayComponent } from '../../../../shared/value-display/value-display.component';

@Component({
  selector: 'app-monbat-battery-voltage-bar',
  templateUrl: './monbat-battery-voltage-bar.component.html',
  styleUrls: ['./monbat-battery-voltage-bar.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ValueDisplayComponent],
})
export class MonbatBatteryVoltageBarComponent {
  @Input() voltage: number | null = null;
  @Input() fullHeight = false;
}
