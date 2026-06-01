import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

import Highcharts from '../../../highcharts-global-config';
import {
  BaseChartComponentComponent,
  BaseChartContext,
} from '../../../shared/base-chart-component/base-chart-component.component';
import { PVProductionData } from './_data/pv-production';
import { chartOptions, updateChartData } from './chart-manipulation';

@Component({
  selector: 'app-pv-production-chart',
  templateUrl: './pv-production-chart.component.html',
  styleUrls: ['./pv-production-chart.component.less'],
  imports: [],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PvProductionChartComponent extends BaseChartComponentComponent<PVProductionData> {
  override getChartOptions(): Highcharts.Options {
    return chartOptions;
  }

  override updateChartData(chart: Highcharts.Chart, data: PVProductionData | undefined): void {
    updateChartData(chart, data, this.context);
  }

  override handleContextChange(
    chart: Highcharts.Chart,
    previousValue: BaseChartContext | null,
    currentValue: BaseChartContext | null,
  ): void {}
}
