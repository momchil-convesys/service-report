import { formatNumber } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { APP_LOCALE_ID } from '../../../app-locale';
import { BaseUnit, formatUnitSpacing, scaleAndFormatValue_v2 } from '../../../helpers';
import { IconName } from '../../../shared/flow-chart/icons/icon-names';
import { IconsComponent } from '../../../shared/flow-chart/icons/icons.component';
import { EnergySummaryBoxData } from './models';

@Component({
  selector: 'app-energy-summary-box',
  imports: [NzIconModule, IconsComponent, NzTooltipModule],
  templateUrl: './energy-summary-box.component.html',
  styleUrl: './energy-summary-box.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnergySummaryBoxComponent {
  @Input({ required: true }) data: EnergySummaryBoxData | undefined;
  @Input({ required: true }) baseUnit: BaseUnit | undefined;
  @Input({ required: true }) title: string | undefined;
  @Input({ required: true }) icon: IconName | undefined;
  @Input({ required: true }) arrowIcon: IconName | undefined;

  getScaledValue(value: number | null | undefined): {
    value: string | null;
    unit: string | undefined;
  } {
    return scaleAndFormatValue_v2(value, value ?? undefined, this.baseUnit, 0);
  }

  formatNumber(value: number | null | undefined): string {
    return value !== null && value !== undefined
      ? formatNumber(value, APP_LOCALE_ID, '1.0-3') + formatUnitSpacing('kWh')
      : 'No data';
  }
}
