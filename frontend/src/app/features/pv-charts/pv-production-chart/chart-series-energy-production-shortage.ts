import { seriesById } from '../../../helpers';
import { excludeSeriesFromCrossHairClassName } from '../../../highcharts-global-config';
import { seriesId_TargetPowerLimitAdjusted } from '../../power-limit-schedule/charts/chart-common-definitions';
import { PVProductionData } from './_data/pv-production';
import {
  calculateDeviationPoints,
  formatDataLabel,
} from './chart-series-energy-production-deviation';

export const seriesId_EnergyProduction_Shortage = 'seriesId_EnergyProduction_Shortage';

export const seriesOptions_EnergyProduction_Shortage: Highcharts.SeriesOptionsType[] = [
  {
    id: seriesId_EnergyProduction_Shortage,
    type: 'columnrange',
    name: 'Production Shortage',
    className: excludeSeriesFromCrossHairClassName,
    enableMouseTracking: false,
    linkedTo: seriesId_TargetPowerLimitAdjusted,
    color: '#ff4b4b' + '44',
    dataLabels: {
      enabled: true,
      // useHTML: true,
      style: {
        fontSize: '0.6em',
        pointerEvents: 'none',
      },
      formatter: function (options: Highcharts.DataLabelsOptions) {
        return formatDataLabel(this, options, 'shortage');
      },
    },
  },
];

export function updateSeriesData_EnergyProduction_Shortage(
  chart: Highcharts.Chart,
  data: PVProductionData,
) {
  const seriesData: Highcharts.PointOptionsType[] = calculateDeviationPoints(data, 'shortage');
  seriesById(chart, seriesId_EnergyProduction_Shortage)?.setData(seriesData, false, false);
}

export function updateSeriesOptions_EnergyProduction_Shortage(
  chart: Highcharts.Chart,
  data: PVProductionData,
) {
  // seriesById(chart, seriesId_EnergyProduction_Shortage)?.update(
  //   {
  //     type: 'columnrange',
  //     dataLabels: {
  //       enabled: data.integrationPeriod === IntegrationPeriod.Hours,
  //     },
  //   },
  //   false
  // );
}
