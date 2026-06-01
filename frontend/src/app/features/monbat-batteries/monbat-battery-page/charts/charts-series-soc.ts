import { chartColors } from '../../../../constants';
import { defaultDataGroupingApproximation } from './charts-data-grouping';

export const seriesId_SOC = 'seriesId_SOC';

export const seriesOptions_SOC: Highcharts.SeriesOptionsType = {
  id: seriesId_SOC,
  type: 'spline',
  name: 'SoC',
  data: [],
  yAxis: 2,
  color: chartColors[6],
  // showInNavigator: false,
  // step: 'center',
  tooltip: { valueDecimals: 2, valueSuffix: '%' },
  visible: false,
  dataGrouping: {
    approximation: defaultDataGroupingApproximation,
  },
};
