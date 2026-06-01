import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import {
  BaseChartComponentComponent,
  BaseChartContext,
} from '../../../../shared/base-chart-component/base-chart-component.component';
import { ActivePowerLimitSchedule } from '../../_data/active-schedule';
import { chartOptions, updateChartData } from './chart-manipulation';

@Component({
  selector: 'app-pls-active-schedule-chart',
  templateUrl: './pls-active-schedule-chart.component.html',
  styleUrl: './pls-active-schedule-chart.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class PlsActiveScheduleChartComponent extends BaseChartComponentComponent<ActivePowerLimitSchedule> {
  override getChartOptions(): Highcharts.Options {
    return chartOptions;
  }

  override updateChartData(
    chart: Highcharts.Chart,
    data: ActivePowerLimitSchedule | undefined,
  ): void {
    updateChartData(chart, data);
  }

  override handleContextChange(
    chart: Highcharts.Chart,
    previousValue: BaseChartContext | null,
    currentValue: BaseChartContext | null,
  ): void {}
}
