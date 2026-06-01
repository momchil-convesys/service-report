import { chartColors } from '../../../../constants';
import { defaultDataGroupingApproximation } from './charts-data-grouping';

export const seriesId_ElectricCurrent = 'seriesId_ElectricCurrent';

export const seriesOptions_ElectricCurrent: Highcharts.SeriesOptionsType = {
  id: seriesId_ElectricCurrent,
  type: 'areaspline',
  name: $localize`:@@electric-current:Current`,
  lineWidth: 1,
  data: [],
  yAxis: 3,
  fillOpacity: 0.2,
  color: chartColors[5],
  negativeColor: chartColors[5],
  tooltip: { valueDecimals: 2, valueSuffix: ' A' },
  visible: true,
  dataGrouping: {
    approximation: defaultDataGroupingApproximation,
  },
};
