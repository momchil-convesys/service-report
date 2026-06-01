import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import Highcharts from '../../../../highcharts-global-config';
import {
  BaseChartComponentComponent,
  BaseChartContext,
} from '../../../../shared/base-chart-component/base-chart-component.component';
import { PVPowerDataForDevice_NEW } from '../_data/pv-power';
import { chartOptions, updateChartData } from './chart-manipulation';

@Component({
  selector: 'app-pv-power-chart-device',
  templateUrl: './pv-power-chart-device.component.html',
  styleUrl: './pv-power-chart-device.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class PvPowerChartDeviceComponent extends BaseChartComponentComponent<PVPowerDataForDevice_NEW> {
  override getChartOptions(): Highcharts.Options {
    return chartOptions;
  }

  override updateChartData(
    chart: Highcharts.Chart,
    data: PVPowerDataForDevice_NEW | undefined,
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
