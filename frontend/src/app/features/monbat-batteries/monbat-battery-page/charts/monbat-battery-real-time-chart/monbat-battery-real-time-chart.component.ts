import {
  ChangeDetectionStrategy,
  Component,
  Input,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { BatteriesApiService } from '../../../_data/api.service';

import { TypedChange } from '../../../../../constants';
import Highcharts from '../../../../../highcharts-global-config';
import { MonbatBatteryHistoricalData } from '../../../_data/models';
import { chartOptions, updateChartData } from './chart-manipulation';

interface ComponentChanges extends SimpleChanges {
  data: TypedChange<MonbatBatteryHistoricalData | undefined>;
  loading: TypedChange<boolean>;
}

@Component({
  selector: 'app-monbat-battery-real-time-chart',
  imports: [],
  templateUrl: './monbat-battery-real-time-chart.component.html',
  styleUrl: './monbat-battery-real-time-chart.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonbatBatteryRealTimeChartComponent {
  @Input() data: MonbatBatteryHistoricalData | undefined;
  @Input() loading = false;

  chartContainerId = this.constructor.name + Math.random().toString();

  private _chart: Highcharts.Chart | undefined;

  constructor(private api: BatteriesApiService) {}

  ngOnChanges(changes: ComponentChanges): void {
    if (!this._chart) {
      return;
    }

    if (changes.loading) {
      this._handleLoadingState(this._chart, changes.loading.currentValue);
    }

    if (!this.loading) {
      this._handleNewData(this._chart, this.data);

      // this.test().subscribe();
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this._chart = Highcharts.chart(this.chartContainerId, chartOptions);

      this._handleLoadingState(this._chart, this.loading);
      this._handleNewData(this._chart, this.data);
    }, 0);
  }

  ngOnDestroy(): void {
    this._chart?.destroy();
  }

  private _handleNewData(chart: Highcharts.Chart, data: MonbatBatteryHistoricalData | undefined) {
    updateChartData(chart, data);

    chart.redraw();
  }

  private _handleLoadingState(chart: Highcharts.Chart, isLoading: boolean) {
    if (isLoading) {
      chart.showLoading();
    } else {
      chart.hideLoading();
    }
  }

  // test() {
  //   const timeSpanSeconds = 60 * 15;

  //   const to = new Date();
  //   const from = subSeconds(to, timeSpanSeconds);

  //   let queryParams = `?from=${DataAdapter.modelToDtoTimestamp(
  //     from
  //   )}&to=${DataAdapter.modelToDtoTimestamp(to)}`;

  //   const requestUrl = `/battery-strings/dbd83adde66db6/battery-real-time-data/5${queryParams}`;

  //   // Live updated data
  //   return this.api.sseApi.fetch<BatteryHistoricalData>(
  //     requestUrl,
  //     (currentData, newData, updateMethod) => {
  //       if (updateMethod === SSE_DataUpdateMethod.Append) {
  //         /**
  //          * Temporary fix for backend responding with duplicated points
  //          */

  //         const lastPointFromCurrentData =
  //           currentData.dataPoints.length > 0
  //             ? currentData.dataPoints[currentData.dataPoints.length - 1]
  //             : undefined;
  //         const newDataPoints = lastPointFromCurrentData
  //           ? newData.dataPoints.filter((p) =>
  //               isAfter(new Date(p.timestamp), new Date(lastPointFromCurrentData.timestamp))
  //             )
  //           : newData.dataPoints;

  //         if (this._chart && newDataPoints.length > 0) {
  //           appendChartData(this._chart, { ...newData, dataPoints: newDataPoints });
  //           this._chart.redraw();
  //         }

  //         return {
  //           ...currentData,
  //           dataPoints: [...currentData.dataPoints, ...newData.dataPoints],
  //         };
  //       }

  //       if (updateMethod === SSE_DataUpdateMethod.Patch) {
  //         const patchedDataPoints = [...currentData.dataPoints];
  //         newData.dataPoints.forEach((newPoint) => {
  //           const pointIndex = patchedDataPoints.findIndex(
  //             (p) => p.timestamp === newPoint.timestamp
  //           );
  //           if (pointIndex >= 0) {
  //             patchedDataPoints[pointIndex] = newPoint;
  //           }
  //         });
  //         return {
  //           ...currentData,
  //           dataPoints: patchedDataPoints,
  //         };
  //       }

  //       if (updateMethod === SSE_DataUpdateMethod.Replace) {
  //         return {
  //           ...newData,
  //         };
  //       }

  //       console.warn(
  //         `New data from SSE was not applied! Unknown update method: ${updateMethod}. Request: ${requestUrl}`
  //       );
  //       return currentData;
  //     },
  //     true
  //   );
  // }
}
