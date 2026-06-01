import Highcharts from '../../../../highcharts-global-config';
import { HybridInverterHistoricalData } from '../../_data/models';
import {
  series_Consumption,
  series_ConsumptionFromBatteries,
  series_ConsumptionFromGrid,
} from '../charts-series';

import {
  chartsCommonOptions,
  updateDatetimeAxisRange,
  updateSeriesOptions,
  updateYAxisOptions,
} from '../charts-common';

import {
  seriesId_ActivePower,
  seriesId_Consumption,
  seriesId_ConsumptionFromBatteries,
  seriesId_ConsumptionFromGrid,
  yAxis_Shared,
} from '../charts-definitions';

import { seriesById } from '../../../../helpers';

export const chartOptions: Highcharts.Options = {
  ...chartsCommonOptions,
  yAxis: [yAxis_Shared],
  series: [series_ConsumptionFromGrid, series_ConsumptionFromBatteries, series_Consumption],
};

export function updateChartData(
  chart: Highcharts.Chart,
  data: HybridInverterHistoricalData | undefined,
) {
  if (!data || data.dataPoints.length === 0) {
    chart.series.forEach((series) => series.setData([], false, false));
    updateDatetimeAxisRange(chart, chart.xAxis[0], data);
    chart.zoomOut();
    return;
  }

  updateSeriesOptions(chart, data);
  updateYAxisOptions(chart, data);

  setData(chart, data);

  chart.redraw();

  // This should be done after setting series data,
  // else chart is zoomed according to provided series data
  updateDatetimeAxisRange(chart, chart.xAxis[0], data);
}

function setData(chart: Highcharts.Chart, data: HybridInverterHistoricalData) {
  const seriesData_ActivePower: Highcharts.PointOptionsType[] =
    data.dataPoints.map((point) => [new Date(point.timestamp).getTime(), point.activePower]) || [];
  seriesById(chart, seriesId_ActivePower)?.setData(seriesData_ActivePower, false, false);

  const seriesData_Consumtion: Highcharts.PointOptionsType[] =
    data.dataPoints.map((point) => [
      new Date(point.timestamp).getTime(),
      point.energyDistribution?.consumption?.total,
    ]) || [];
  seriesById(chart, seriesId_Consumption)?.setData(seriesData_Consumtion, false, false);

  const seriesData_ConsumtionFromGrid: Highcharts.PointOptionsType[] =
    data.dataPoints.map((point) => [
      new Date(point.timestamp).getTime(),
      point.energyDistribution?.consumption?.fromGrid,
      // (point.energyDistribution?.consumption?.fromGrid || 0) / 2,
    ]) || [];
  seriesById(chart, seriesId_ConsumptionFromGrid)?.setData(
    seriesData_ConsumtionFromGrid,
    false,
    false,
  );

  const seriesData_ConsumtionFromBatteries: Highcharts.PointOptionsType[] =
    data.dataPoints.map((point) => [
      new Date(point.timestamp).getTime(),
      point.energyDistribution?.consumption?.fromBatteries,
      // (point.energyDistribution?.consumption?.fromGrid || 0) / 2,
    ]) || [];
  seriesById(chart, seriesId_ConsumptionFromBatteries)?.setData(
    seriesData_ConsumtionFromBatteries,
    false,
    false,
  );
}
