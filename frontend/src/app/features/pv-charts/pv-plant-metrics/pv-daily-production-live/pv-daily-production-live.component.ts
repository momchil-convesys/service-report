import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

import Highcharts from '../../../../highcharts-global-config';
import {
  BaseChartComponentComponent,
  BaseChartContext,
} from '../../../../shared/base-chart-component/base-chart-component.component';
import { PVPlantEssentialMetrics } from '../_data/pv-plant-metrics.model';
import { chartOptions, handleContextChange, updateChartData } from './chart-manipulation';

@Component({
  selector: 'app-pv-daily-production-live',
  templateUrl: './pv-daily-production-live.component.html',
  styleUrls: ['./pv-daily-production-live.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class PvDailyProductionLiveComponent extends BaseChartComponentComponent<PVPlantEssentialMetrics> {
  override getChartOptions(): Highcharts.Options {
    return chartOptions;
  }

  override updateChartData(
    chart: Highcharts.Chart,
    data: PVPlantEssentialMetrics | undefined,
  ): void {
    updateChartData(chart, data, this.context);
  }

  override handleContextChange(
    chart: Highcharts.Chart,
    previousValue: BaseChartContext | null,
    currentValue: BaseChartContext | null,
  ): void {
    handleContextChange(chart, currentValue);
  }
}
