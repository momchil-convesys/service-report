import Highcharts from '../../../../highcharts-global-config';
import { HybridInverterHistoricalData } from '../../_data/models';
import {
  seriesExport_Consumption,
  seriesExport_ConsumptionFromBatteries,
  series_BatteryIn,
  series_DirectConsumptionFromGrid,
  series_GridOut,
} from '../charts-series';

import {
  chartsCommonOptions,
  updateDatetimeAxisRange,
  updateSeriesOptions,
  updateYAxisOptions,
} from '../charts-common';

import {
  seriesId_BatteryIn,
  seriesId_ConsumptionFromBatteries_Export,
  seriesId_Consumption_Export,
  seriesId_DirectConsumptionFromGrid,
  seriesId_GridOut,
  yAxis_Shared,
  yAxis_SharedHidden,
} from '../charts-definitions';

import { seriesById } from '../../../../helpers';

export const chartOptions: Highcharts.Options = {
  ...chartsCommonOptions,
  yAxis: [yAxis_Shared, yAxis_SharedHidden],
  series: [
    series_DirectConsumptionFromGrid,
    series_BatteryIn,
    series_GridOut,
    // These are used for exporting data
    seriesExport_ConsumptionFromBatteries,
    seriesExport_Consumption,
  ],
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
  const seriesData_GridOut: Highcharts.PointOptionsType[] =
    data.dataPoints.map((point) => [
      point.timestamp.getTime(),
      point.energyDistribution?.gridOut,
    ]) || [];
  seriesById(chart, seriesId_GridOut)?.setData(seriesData_GridOut, false, false);

  const seriesData_ConsumtionFromGrid: Highcharts.PointOptionsType[] =
    data.dataPoints.map((point) => [
      point.timestamp.getTime(),
      point.energyDistribution?.consumption?.fromGrid,
    ]) || [];
  seriesById(chart, seriesId_DirectConsumptionFromGrid)?.setData(
    seriesData_ConsumtionFromGrid,
    false,
    false,
  );

  const seriesData_BatteryIn: Highcharts.PointOptionsType[] =
    data.dataPoints.map((point) => [
      point.timestamp.getTime(),
      point.energyDistribution?.batteryIn,
    ]) || [];
  seriesById(chart, seriesId_BatteryIn)?.setData(seriesData_BatteryIn, false, false);

  //----------------------------------------------------------------------------
  // For export pnly

  const seriesData_ConsumtionFromBatteries: Highcharts.PointOptionsType[] =
    data.dataPoints.map((point) => [
      new Date(point.timestamp).getTime(),
      point.energyDistribution?.consumption?.fromBatteries,
    ]) || [];
  seriesById(chart, seriesId_ConsumptionFromBatteries_Export)?.setData(
    seriesData_ConsumtionFromBatteries,
    false,
    false,
  );

  const seriesData_Consumtion: Highcharts.PointOptionsType[] =
    data.dataPoints.map((point) => [
      new Date(point.timestamp).getTime(),
      point.energyDistribution?.consumption?.total,
    ]) || [];
  seriesById(chart, seriesId_Consumption_Export)?.setData(seriesData_Consumtion, false, false);
}
