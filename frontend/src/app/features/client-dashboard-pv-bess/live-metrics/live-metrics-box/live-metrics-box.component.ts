import { formatNumber } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { APP_LOCALE_ID } from '../../../../app-locale';
import { BaseUnit, formatUnitSpacing, scaleAndFormatValue_v2 } from '../../../../helpers';
import { IconName } from '../../../../shared/flow-chart/icons/icon-names';
import { IconsComponent } from '../../../../shared/flow-chart/icons/icons.component';
import { LiveMetricsBoxData } from './models';

@Component({
  selector: 'app-live-metrics-box',
  imports: [NzIconModule, IconsComponent, NzTooltipModule],
  templateUrl: './live-metrics-box.component.html',
  styleUrl: './live-metrics-box.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiveMetricsBoxComponent {
  @Input({ required: true }) data: LiveMetricsBoxData | undefined;
  @Input({ required: true }) baseUnit: BaseUnit | undefined;
  @Input({ required: true }) title: string | undefined;
  @Input({ required: true }) icon: IconName | undefined;
  @Input({ required: true }) arrowIcon: IconName | undefined;

  @HostBinding('class.large-box') @Input() largeBox = false;

  getScaledValue(value: number | null): { value: string | null; unit: string | undefined } {
    return scaleAndFormatValue_v2(value, value ?? undefined, this.baseUnit, 0);
  }

  formatNumber(value: number | null): string {
    const unit = this.baseUnit ? 'k' + this.baseUnit : '';
    return value !== null
      ? formatNumber(value, APP_LOCALE_ID, '1.0-3') + formatUnitSpacing(unit)
      : 'No data';
  }
}
