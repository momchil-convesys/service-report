import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { ValueDisplayComponent } from '../../../../shared/value-display/value-display.component';

@Component({
  selector: 'app-monbat-battery-charge-bar',
  templateUrl: './monbat-battery-charge-bar.component.html',
  styleUrls: ['./monbat-battery-charge-bar.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [ValueDisplayComponent, NgClass],
})
export class MonbatBatteryChargeBarComponent implements OnChanges {
  @Input() percentage: number | null = null;
  @Input() cellsCount = 10;

  @Input() small = false;

  cells = new Array(this.cellsCount).fill(0);

  ngOnChanges(changes: SimpleChanges): void {
    this.cells = new Array(this.cellsCount).fill(0);
  }
}
