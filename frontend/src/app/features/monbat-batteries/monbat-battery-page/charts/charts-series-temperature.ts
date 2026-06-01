import { chartColors } from '../../../../constants';
import { defaultDataGroupingApproximation } from './charts-data-grouping';

export const seriesId_Temperature = 'seriesId_Temperature';
export const seriesId_Temperature_Navigator = 'seriesId_Temperature_Navigator';

const sharedOptions: Highcharts.SeriesOptionsType = {
  type: 'spline',
  name: $localize`Temperature`,
  data: [],
  color: chartColors[3],
  tooltip: { valueDecimals: 2, valueSuffix: '°C' },
  visible: true,
  dataGrouping: {
    approximation: defaultDataGroupingApproximation,
  },
};

export const seriesOptions_Temperature: Highcharts.SeriesOptionsType = {
  ...sharedOptions,
  id: seriesId_Temperature,
  yAxis: 1,
};

export const seriesOptions_Temperature_Navigator: Highcharts.SeriesOptionsType = {
  ...sharedOptions,
  id: seriesId_Temperature_Navigator,
};
