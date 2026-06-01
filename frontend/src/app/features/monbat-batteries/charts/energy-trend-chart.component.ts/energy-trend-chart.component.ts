import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import Highcharts from '../../../../highcharts-global-config';
import {
  BaseChartComponentComponent,
  BaseChartContext,
} from '../../../../shared/base-chart-component/base-chart-component.component';
import { EnergyTrendData } from '../../_data/models';
import { chartOptions, updateChartData } from './chart-manipulation';

@Component({
  selector: 'app-energy-trend-chart',
  standalone: true,
  imports: [],
  templateUrl: './energy-trend-chart.component.html',
  styleUrls: ['./energy-trend-chart.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnergyTrendChartComponent extends BaseChartComponentComponent<EnergyTrendData> {
  override getChartOptions(): Highcharts.Options {
    return chartOptions;
  }

  override updateChartData(chart: Highcharts.Chart, data: EnergyTrendData | undefined): void {
    updateChartData(chart, data);
  }

  override handleContextChange(
    chart: Highcharts.Chart,
    previousValue: BaseChartContext | null,
    currentValue: BaseChartContext | null,
  ): void {}
}
