import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

import {
  BaseChartComponentComponent,
  BaseChartContext,
} from '../../../../shared/base-chart-component/base-chart-component.component';
import { HybridInverterHistoricalData } from '../../_data/models';

import Highcharts from '../../../../highcharts-global-config';
import { chartOptions, updateChartData } from './chart-manipulation';

@Component({
  selector: 'app-hybrid-inverter-chart-accumulated-consumption',
  imports: [],
  templateUrl: './hybrid-inverter-chart-accumulated-consumption.component.html',
  styleUrl: './hybrid-inverter-chart-accumulated-consumption.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HybridInverterChartAccumulatedConsumptionComponent extends BaseChartComponentComponent<HybridInverterHistoricalData> {
  override getChartOptions(): Highcharts.Options {
    return chartOptions;
  }

  override updateChartData(
    chart: Highcharts.Chart,
    data: HybridInverterHistoricalData | undefined,
  ): void {
    updateChartData(chart, data);
  }

  override handleContextChange(
    chart: Highcharts.Chart,
    previousValue: BaseChartContext | null,
    currentValue: BaseChartContext | null,
  ): void {}
}
