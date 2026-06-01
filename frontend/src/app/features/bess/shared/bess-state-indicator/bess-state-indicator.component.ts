import { formatNumber, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { APP_LOCALE_ID } from '../../../../app-locale';
import { formatUnitSpacing, scaleAndFormatValue_v2 } from '../../../../helpers';
import { BESSMomentaryDataValue } from '../../_data/models';
import { getBessState } from '../bess-state';

export type BessState = 'charging' | 'discharging' | 'idle';

@Component({
  selector: 'app-bess-state-indicator',
  standalone: true,
  imports: [NgTemplateOutlet, NzTooltipModule],
  templateUrl: './bess-state-indicator.component.html',
  styleUrl: './bess-state-indicator.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BessStateIndicatorComponent {
  @Input({ required: true }) data: BESSMomentaryDataValue | null = null;
  @Input() small = false;
  @Input() subPlant = false;

  @HostBinding('class.sub-plant') get isSubPlant() {
    return this.subPlant;
  }

  @HostBinding('class.main-plant') get isMainPlant() {
    return !this.subPlant;
  }

  @HostBinding('class.small') get isSmall() {
    return this.small || this.subPlant;
  }

  get bessState(): BessState | null {
    return getBessState(this.data);
  }

  getScaledValue(value: number | null | undefined) {
    return scaleAndFormatValue_v2(value, value ?? undefined, 'W', 0);
  }

  formatNumber(value: number | null | undefined): string {
    return value !== null && value !== undefined
      ? formatNumber(value, APP_LOCALE_ID, '1.0-3') + formatUnitSpacing('kW')
      : 'No data';
  }
}
