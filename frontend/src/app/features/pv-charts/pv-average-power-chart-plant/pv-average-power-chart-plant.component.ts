import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import {
  BaseChartComponentComponent,
  BaseChartContext,
} from '../../../shared/base-chart-component/base-chart-component.component';
import { PVAveragePowerData } from './_data/pv-average-power.model';
import { chartOptions, updateChartData } from './chart-manipulation';

@Component({
  selector: 'app-pv-average-power-chart-plant',
  templateUrl: './pv-average-power-chart-plant.component.html',
  styleUrl: './pv-average-power-chart-plant.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class PvAveragePowerChartPlantComponent extends BaseChartComponentComponent<PVAveragePowerData> {
  override getChartOptions(): Highcharts.Options {
    return chartOptions;
  }

  override updateChartData(chart: Highcharts.Chart, data: PVAveragePowerData | undefined): void {
    updateChartData(chart, data, this.context);
  }

  override handleContextChange(
    chart: Highcharts.Chart,
    previousValue: BaseChartContext | null,
    currentValue: BaseChartContext | null,
  ): void {}
}
