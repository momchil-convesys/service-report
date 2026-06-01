import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import {
  BaseChartComponentComponent,
  BaseChartContext,
} from '../../../shared/base-chart-component/base-chart-component.component';

import { updateTimeZoneSettings } from '../../../helpers';
import Highcharts from '../../../highcharts-global-config';
import { isSameDatetimeRange_Safe } from '../../../shared/datetime-range-select/models';
import { DevicesAvailability } from '../_data/models';
import {
  chartOptions,
  getCategories,
  setCategories,
  updateChartData,
  updateDatetimeAxisRange,
} from './chart-manipulation';

@Component({
  selector: 'app-device-availability-x-range-chart',
  imports: [],
  templateUrl: './device-availability-x-range-chart.component.html',
  styleUrl: './device-availability-x-range-chart.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeviceAvailabilityXRangeChartComponent extends BaseChartComponentComponent<DevicesAvailability> {
  override getChartOptions(): Highcharts.Options {
    return chartOptions;
  }

  override updateChartData(chart: Highcharts.Chart, data: DevicesAvailability | undefined): void {
    updateChartData(chart, data);

    const categories = getCategories(this.context);

    this._updateChartSize(categories);
  }

  override handleContextChange(
    chart: Highcharts.Chart,
    previousValue: BaseChartContext | null,
    currentValue: BaseChartContext | null,
  ): void {
    const categories = getCategories(this.context);

    const previousTargetRange = previousValue?.targetRange;
    const currentTargetRange = currentValue?.targetRange;

    if (!isSameDatetimeRange_Safe(previousTargetRange, currentTargetRange)) {
      updateChartData(chart, undefined);

      updateTimeZoneSettings(chart, this.context?.plant.timeZone, false);

      updateDatetimeAxisRange(
        chart,
        chart.xAxis[0],
        currentValue?.targetRange,
        currentValue?.plant.timeZone,
      );

      chart.zoomOut();
    }

    setCategories(chart, categories);

    this._updateChartSize(categories);
  }

  private _updateChartSize(categories: string[]) {
    const calculatedHeight = (categories.length || 1) * 37 + 100;
    this._chart?.setSize(null, calculatedHeight);
  }
}
