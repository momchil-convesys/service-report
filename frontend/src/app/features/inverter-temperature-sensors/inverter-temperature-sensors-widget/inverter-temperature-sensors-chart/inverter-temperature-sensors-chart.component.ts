import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import {
  BaseChartComponentComponent,
  BaseChartContext,
} from '../../../../shared/base-chart-component/base-chart-component.component';
import { InverterTemperatureSensorsData } from '../../_data/models';

import Highcharts from '../../../../highcharts-global-config';
import { chartOptions, updateChartData } from './chart-manipulation';

@Component({
  selector: 'app-inverter-temperature-sensors-chart',
  imports: [],
  templateUrl: './inverter-temperature-sensors-chart.component.html',
  styleUrl: './inverter-temperature-sensors-chart.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InverterTemperatureSensorsChartComponent extends BaseChartComponentComponent<InverterTemperatureSensorsData> {
  override getChartOptions(): Highcharts.Options {
    return chartOptions;
  }

  override updateChartData(
    chart: Highcharts.Chart,
    data: InverterTemperatureSensorsData | undefined,
  ): void {
    updateChartData(chart, data);
  }

  override handleContextChange(
    chart: Highcharts.Chart,
    previousValue: BaseChartContext | null,
    currentValue: BaseChartContext | null,
  ): void {}
}
