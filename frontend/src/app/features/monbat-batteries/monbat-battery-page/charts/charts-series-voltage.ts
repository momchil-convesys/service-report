import { chartColors } from '../../../../constants';
import { defaultDataGroupingApproximation } from './charts-data-grouping';

export const seriesId_Voltage = 'seriesId_Voltage';
export const seriesId_Voltage_Navigator = 'seriesId_Voltage_Navigator';

const commonOptions: Highcharts.SeriesOptionsType = {
  type: 'spline',
  name: $localize`Voltage`,
  lineWidth: 1,
  data: [],
  color: chartColors[0],
  tooltip: { valueDecimals: 3, valueSuffix: ' V' },
  dataGrouping: {
    approximation: defaultDataGroupingApproximation,
  },
  zIndex: 1, // To appear above electric current areaspline
};

export const seriesOptions_Voltage: Highcharts.SeriesOptionsType = {
  ...commonOptions,
  id: seriesId_Voltage,
  yAxis: 0,
};

export const seriesOptions_Voltage_Navigator: Highcharts.SeriesOptionsType = {
  ...commonOptions,
  id: seriesId_Voltage_Navigator,
};
