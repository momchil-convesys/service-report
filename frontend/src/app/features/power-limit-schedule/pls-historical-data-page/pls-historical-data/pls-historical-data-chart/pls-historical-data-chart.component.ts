import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import {
  BaseChartComponentComponent,
  BaseChartContext,
} from '../../../../../shared/base-chart-component/base-chart-component.component';
import { MasterGwScheduledPowerLimitHistoricalData } from '../../_data/dto';
import { commonChartOptions, updateChartData } from './chart-manipulation';
import { patchOptions_Plant } from './chart-manipulation-plant';

@Component({
  selector: 'app-pls-historical-data-chart',
  templateUrl: './pls-historical-data-chart.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class PlsHistoricalDataChartComponent extends BaseChartComponentComponent<MasterGwScheduledPowerLimitHistoricalData> {
  override getChartOptions(): Highcharts.Options {
    return patchOptions_Plant(commonChartOptions);
  }

  override updateChartData(
    chart: Highcharts.Chart,
    data: MasterGwScheduledPowerLimitHistoricalData | undefined,
  ): void {
    if (!this.loading) {
      updateChartData(chart, data, this.context);

      chart.redraw();
    }
  }

  override handleContextChange(
    chart: Highcharts.Chart,
    previousValue: BaseChartContext | null,
    currentValue: BaseChartContext | null,
  ): void {}
}
