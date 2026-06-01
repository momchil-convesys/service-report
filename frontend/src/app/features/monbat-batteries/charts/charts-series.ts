import { chartColors } from '../../../constants';
import Highcharts from '../../../highcharts-global-config';
import {
  seriesId_BatteryIn,
  seriesId_Consumption,
  seriesId_ConsumptionFromBatteries,
  seriesId_ConsumptionFromBatteries_Export,
  seriesId_ConsumptionFromGrid,
  seriesId_Consumption_Export,
  seriesId_DirectConsumptionFromGrid,
  seriesId_GridOut,
  yAxisId_Shared,
  yAxisId_SharedHidden,
} from './charts-definitions';
import { gradientFill } from './charts-helpers';

const disableHide: Highcharts.SeriesEventsOptionsObject = {
  // Disable hide
  legendItemClick: function (e) {
    e.preventDefault();
  },
};
//------------------------------------------------------------------------------
// First chart / Grid ussage

export const series_DirectConsumptionFromGrid: Highcharts.SeriesOptionsType = {
  id: seriesId_DirectConsumptionFromGrid,
  type: 'areaspline',
  stack: 'gridOut',
  stacking: 'normal',
  name: 'Direct consumption',
  yAxis: yAxisId_Shared,
  color: chartColors[4],
  fillColor: gradientFill(chartColors[4]),
  lineWidth: 1,
  zIndex: 1,
  events: disableHide,
};

export const series_BatteryIn: Highcharts.SeriesOptionsType = {
  id: seriesId_BatteryIn,
  type: 'areaspline',
  stack: 'gridOut',
  stacking: 'normal',
  name: 'Charging batteries',
  yAxis: yAxisId_Shared,
  color: chartColors[0],
  fillColor: gradientFill(chartColors[0]),
  lineWidth: 1,
  zIndex: 1,
  events: disableHide,
};

export const series_GridOut: Highcharts.SeriesOptionsType = {
  id: seriesId_GridOut,
  type: 'areaspline',
  name: 'Total energy used from grid',
  yAxis: yAxisId_Shared,
  color: chartColors[1] + '00',
  zIndex: 0,
  showInLegend: false,
  events: disableHide,
};

//------------------------------------------------------------------------------
// Second chart / Consumption

export const series_ConsumptionFromGrid: Highcharts.SeriesOptionsType = {
  id: seriesId_ConsumptionFromGrid,
  type: 'areaspline',
  stack: 'consumption',
  stacking: 'normal',
  name: 'Consumption from grid',
  yAxis: yAxisId_Shared,
  color: chartColors[4],
  fillColor: gradientFill(chartColors[4]),
  lineWidth: 1,
  zIndex: 1,
  events: disableHide,
};

export const series_ConsumptionFromBatteries: Highcharts.SeriesOptionsType = {
  id: seriesId_ConsumptionFromBatteries,
  type: 'areaspline',
  stack: 'consumption',
  stacking: 'normal',
  name: 'Consumption from batteries',
  yAxis: yAxisId_Shared,
  color: chartColors[6],
  fillColor: gradientFill(chartColors[6]),
  lineWidth: 1,
  zIndex: 1,
  events: disableHide,
};

export const series_Consumption: Highcharts.SeriesOptionsType = {
  id: seriesId_Consumption,
  type: 'areaspline',
  name: 'Total consumption',
  yAxis: yAxisId_Shared,
  color: chartColors[5] + '00',
  lineWidth: 0,
  visible: true,
  showInLegend: false,
  zIndex: 0,
  events: disableHide,
};

//------------------------------------------------------------------------------
// Added to first chart for export only

export const seriesExport_ConsumptionFromBatteries: Highcharts.SeriesOptionsType = {
  ...series_ConsumptionFromBatteries,
  id: seriesId_ConsumptionFromBatteries_Export,
  stack: undefined,
  stacking: undefined,
  color: chartColors[6] + '00',
  fillColor: chartColors[6] + '00',
  zIndex: 0,
  lineWidth: 0,
  visible: true,
  showInLegend: false,
  tooltip: undefined,
  yAxis: yAxisId_SharedHidden,
};

export const seriesExport_Consumption: Highcharts.SeriesOptionsType = {
  ...series_Consumption,
  id: seriesId_Consumption_Export,
  yAxis: yAxisId_SharedHidden,
};
