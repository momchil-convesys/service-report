import { seriesById } from '../../../helpers';
import { excludeSeriesFromCrossHairClassName } from '../../../highcharts-global-config';
import { seriesId_TargetPowerLimitAdjusted } from '../../power-limit-schedule/charts/chart-common-definitions';
import { PVProductionData } from './_data/pv-production';
import {
  calculateDeviationPoints,
  formatDataLabel,
} from './chart-series-energy-production-deviation';

export const seriesId_EnergyProduction_Excess = 'seriesId_EnergyProduction_Excess';

export const seriesOptions_EnergyProduction_Excess: Highcharts.SeriesOptionsType[] = [
  {
    id: seriesId_EnergyProduction_Excess,
    type: 'columnrange',
    name: $localize`Production Excess`,
    className: excludeSeriesFromCrossHairClassName,
    enableMouseTracking: false,
    linkedTo: seriesId_TargetPowerLimitAdjusted,
    color: '#d9343a' + '77',
    dataLabels: {
      enabled: true,
      // useHTML: true,
      style: {
        fontSize: '0.6em',
        pointerEvents: 'none',
      },
      formatter: function (options: Highcharts.DataLabelsOptions) {
        return formatDataLabel(this, options, 'excess');
      },
    },
  },
];

export function updateSeriesData_EnergyProduction_Excess(
  chart: Highcharts.Chart,
  data: PVProductionData,
) {
  const seriesData: Highcharts.PointOptionsType[] = calculateDeviationPoints(data, 'excess');
  seriesById(chart, seriesId_EnergyProduction_Excess)?.setData(seriesData, false, false);
}

export function updateSeriesOptions_EnergyProduction_Excess(
  chart: Highcharts.Chart,
  data: PVProductionData,
) {
  // seriesById(chart, seriesId_EnergyProduction_Excess)?.update(
  //   {
  //     type: 'columnrange',
  //     dataLabels: {
  //       enabled: data.integrationPeriod === IntegrationPeriod.Hours,
  //     },
  //   },
  //   false
  // );
}
