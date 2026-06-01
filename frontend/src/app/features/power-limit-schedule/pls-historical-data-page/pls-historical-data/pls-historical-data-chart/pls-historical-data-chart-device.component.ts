import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import {
  BaseChartComponentComponent,
  BaseChartContext,
} from '../../../../../shared/base-chart-component/base-chart-component.component';
import { MasterGwScheduledPowerLimitHistoricalData } from '../../_data/dto';
import { commonChartOptions, updateChartData } from './chart-manipulation';
import { patchOptions_Device } from './chart-manipulation-device';

@Component({
  selector: 'app-pls-historical-data-chart-device',
  templateUrl: './pls-historical-data-chart-device.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class PlsHistoricalDataChartDeviceComponent extends BaseChartComponentComponent<MasterGwScheduledPowerLimitHistoricalData> {
  override getChartOptions(): Highcharts.Options {
    return patchOptions_Device(commonChartOptions);
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
