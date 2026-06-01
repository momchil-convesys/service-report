import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import Highcharts from '../../../../highcharts-global-config';
import {
  BaseChartComponentComponent,
  BaseChartContext,
} from '../../../../shared/base-chart-component/base-chart-component.component';
import { PVPowerDataForPlant_NEW } from '../_data/pv-power';
import { chartOptions, updateChartData } from './chart-manipulation';

@Component({
  selector: 'app-pv-power-chart',
  templateUrl: './pv-power-chart.component.html',
  styleUrls: ['./pv-power-chart.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class PvPowerChartComponent extends BaseChartComponentComponent<PVPowerDataForPlant_NEW> {
  override getChartOptions(): Highcharts.Options {
    return chartOptions;
  }

  override updateChartData(
    chart: Highcharts.Chart,
    data: PVPowerDataForPlant_NEW | undefined,
  ): void {
    if (!this.loading) {
      updateChartData(chart, data, this.context);
    }
  }

  override handleContextChange(
    chart: Highcharts.Chart,
    previousValue: BaseChartContext | null,
    currentValue: BaseChartContext | null,
  ): void {
    if (previousValue?.plant.id !== currentValue?.plant.id) {
      updateChartData(chart, undefined, currentValue);
    }
  }
}
