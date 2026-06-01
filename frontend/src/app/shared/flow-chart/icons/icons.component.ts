import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { ArrowLeftComponent } from './arrow-left.component';
import { ArrowRightComponent } from './arrow-right.component';
import { BattIconChargeComponent } from './batt-icon-charge.component';
import { BattIconDefaultComponent } from './batt-icon-default.component';
import { GridIconComponent } from './grid-icon.component';
import { IconName } from './icon-names';
import { PvOutputComponent } from './pv-output.component';

@Component({
  selector: 'app-icons',
  imports: [
    ArrowLeftComponent,
    ArrowRightComponent,
    BattIconChargeComponent,
    BattIconDefaultComponent,
    GridIconComponent,
    PvOutputComponent,
  ],
  templateUrl: './icons.component.html',
  styleUrl: './icons.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class IconsComponent {
  @Input() icon: IconName | undefined;
  @Input() scaleFactor: number = 1;
  @Input() color: string | undefined;
}
