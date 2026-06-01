import Highcharts from '../../../../highcharts-global-config';

import { EnergyTrendData } from '../../_data/models';

import { chartsCommonOptions, updateDatetimeAxisRangeGeneric } from '../charts-common';

import {
  semanticColor_BatteryCharging,
  semanticColor_BatteryDischarging,
  semanticColor_GridIn,
  semanticColor_GridOut,
} from '../../../../constants/_chart-series-colors';

import { chartColors } from '../../../../constants';
import { seriesById, updateTimeZoneSettings } from '../../../../helpers';
import { yAxisZeroLine } from '../charts-definitions';

export const yAxis_Shared: Highcharts.YAxisOptions = {
  id: 'yAxisId_Shared',
  title: { text: undefined },
  labels: { enabled: true },
  opposite: true,
};

export const yAxis_SharedHidden: Highcharts.YAxisOptions = {
  id: 'yAxisId_SharedHidden',
  visible: false,
};

// series ids
export const seriesId_PvOutput = 'seriesId_PvOutput';
export const seriesId_MainsPower = 'seriesId_MainsPower';
export const seriesId_ConsumptionPower = 'seriesId_ConsumptionPower';
export const seriesId_FeedInPower = 'seriesId_FeedInPower';
export const seriesId_BatteryPower = 'seriesId_BatteryPower';

// simple colors (swap to your palette later)
const C_PV = chartColors[3];
const C_MAINS_OUT = semanticColor_GridOut;
const C_MAINS_IN = semanticColor_GridIn;
const C_CONS = '#66839b'; // @gray-7
const C_BATT_IN = semanticColor_BatteryCharging;
const C_BATT_OUT = semanticColor_BatteryDischarging;

// minimal series configs (line is fine; your final theme can override)
export const series_PvOutput: Highcharts.SeriesOptionsType = {
  id: seriesId_PvOutput,
  type: 'line',
  name: $localize`PV output`,
  yAxis: 'yAxisId_Shared',
  color: C_PV,
  data: [],
};

export const series_MainsPower: Highcharts.SeriesOptionsType = {
  id: seriesId_MainsPower,
  type: 'line',
  name: $localize`Grid power`,
  yAxis: 'yAxisId_Shared',
  color: C_MAINS_OUT,
  negativeColor: C_MAINS_IN,
  data: [],
  lineWidth: 1,
};

export const series_ConsumptionPower: Highcharts.SeriesOptionsType = {
  id: seriesId_ConsumptionPower,
  type: 'line',
  name: $localize`Consumption power`,
  yAxis: 'yAxisId_Shared',
  color: C_CONS,
  data: [],
  lineWidth: 1,
};

export const series_BatteryPower: Highcharts.SeriesOptionsType = {
  id: seriesId_BatteryPower,
  type: 'line',
  name: $localize`Battery power`,
  yAxis: 'yAxisId_Shared',
  color: C_BATT_IN,
  negativeColor: C_BATT_OUT,
  data: [],
};

/* ---------------------------------------------------------------- */

export const chartOptions: Highcharts.Options = {
  ...chartsCommonOptions,
  title: { text: 'Energy trend', align: 'left', x: 0 },
  yAxis: [{ ...yAxis_Shared, plotLines: [yAxisZeroLine] }],
  series: [series_PvOutput, series_MainsPower, series_ConsumptionPower, series_BatteryPower],
};

export function updateChartData(chart: Highcharts.Chart, data: EnergyTrendData | undefined) {
  if (!data || data.dataPoints.length === 0) {
    chart.series.forEach((s) => s.setData([], false, false));

    chart.zoomOut();
    return;
  }

  setData(chart, data);

  chart.redraw();

  updateTimeZoneSettings(chart, data?.timeZone, false);
  // Do this last so the “Reset zoom” button and range match your full window
  updateDatetimeAxisRangeGeneric(chart, chart.xAxis[0], data);
}

function setData(chart: Highcharts.Chart, data: EnergyTrendData) {
  const ts = (d: Date) => d.getTime();

  // PV output
  seriesById(chart, seriesId_PvOutput)?.setData(
    data.dataPoints.map((p) => [ts(p.timestamp), p.pvOutput ?? null]),
    false,
    false,
  );

  // Mains power
  seriesById(chart, seriesId_MainsPower)?.setData(
    data.dataPoints.map((p) => [ts(p.timestamp), p.mainsPower ?? null]),
    false,
    false,
  );

  // Consumption power
  seriesById(chart, seriesId_ConsumptionPower)?.setData(
    data.dataPoints.map((p) => [
      ts(p.timestamp),
      p.consumptionPower == null ? null : -Math.abs(p.consumptionPower),
    ]),
    false,
    false,
  );

  // Battery power
  seriesById(chart, seriesId_BatteryPower)?.setData(
    data.dataPoints.map((p) => [ts(p.timestamp), p.batteryPower ?? null]),
    false,
    false,
  );
}
