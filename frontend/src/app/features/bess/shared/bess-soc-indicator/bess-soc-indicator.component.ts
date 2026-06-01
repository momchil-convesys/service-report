import { formatNumber } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { APP_LOCALE_ID } from '../../../../app-locale';
import {
  BaseUnit,
  formatUnitSpacing,
  nullOrNumber,
  scaleAndFormatValue_v2,
} from '../../../../helpers';
import { ValueDisplayComponent } from '../../../../shared/value-display/value-display.component';
import { BessSocIndicatorData } from './model';

@Component({
  selector: 'app-bess-soc-indicator',
  imports: [NzProgressModule, ValueDisplayComponent, NzTooltipModule],
  templateUrl: './bess-soc-indicator.component.html',
  styleUrl: './bess-soc-indicator.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BessSocIndicatorComponent {
  @Input({ required: true }) data: BessSocIndicatorData | null = null;

  @Input() small = false;
  @Input() subPlant = false;

  @HostBinding('class.sub-plant') get isSubPlant() {
    return this.subPlant;
  }
  @HostBinding('class.main-plant') get isMainPlant() {
    return !this.subPlant;
  }

  get numberOfSteps(): number {
    return this.small ? 20 : 20;
  }

  get steps(): number[] {
    return Array.from({ length: this.numberOfSteps }, (_, index) => index);
  }

  private get clampedSocPercent(): number {
    if (!this.data) {
      return 0;
    }

    const value = nullOrNumber(this.data.soc);

    return Math.max(0, Math.min(100, value ?? 0));
  }

  isStepActive(stepIndex: number): boolean {
    const threshold = ((stepIndex + 1) / this.numberOfSteps) * 100;
    return this.clampedSocPercent >= threshold;
  }

  getScaledValue(
    value: number | null | undefined,
    baseUnit: BaseUnit | undefined,
  ): { value: string | null; unit: string | undefined } {
    return scaleAndFormatValue_v2(value, value, baseUnit ?? undefined, 0);
  }

  formatNumber(value: number | null | undefined, unit: string): string {
    return value !== null && value !== undefined
      ? formatNumber(value, APP_LOCALE_ID, '1.0-3') + formatUnitSpacing(unit)
      : 'No data';
  }
}
