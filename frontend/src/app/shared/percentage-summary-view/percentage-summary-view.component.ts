import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { IconsComponent } from '../flow-chart/icons/icons.component';
import { ValueDisplayComponent } from '../value-display/value-display.component';
import { PercentageSummaryViewData, PercentageSummaryViewItem } from './models';

interface CalculatedItem extends PercentageSummaryViewItem {
  percentage: number;
}

@Component({
  selector: 'app-percentage-summary-view',
  imports: [ValueDisplayComponent, NzIconModule, IconsComponent, NzTooltipModule],
  templateUrl: './percentage-summary-view.component.html',
  styleUrl: './percentage-summary-view.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PercentageSummaryViewComponent {
  @Input() data: PercentageSummaryViewData | undefined;

  get calculatedParts(): CalculatedItem[] {
    if (!this.data?.parts || this.data.total.value === 0) {
      return [];
    }

    // Maximum 3 parts are supported for now
    const limitedParts = this.data.parts.slice(0, 3);

    return limitedParts.map((part) => ({
      ...part,
      percentage: (part.value / this.data!.total.value) * 100,
    }));
  }

  getTooltipPlacement(index: number, length: number): string {
    if (index === 0) {
      return 'bottomLeft';
    }

    if (index === length - 1) {
      return 'bottomRight';
    }

    return 'bottom';
  }
}
