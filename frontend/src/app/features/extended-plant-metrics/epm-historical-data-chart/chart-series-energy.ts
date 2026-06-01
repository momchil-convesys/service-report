import { seriesById } from '../../../helpers';
import { PowerMetersCumulativeData } from '../../extended-plant-metrics/_data/models';
import { seriesColor_EnergyProduction } from '../../pv-charts/pv-production-chart/chart-series-energy-production';

export const seriesColor_EnergyConsumed = '#00A1F1';
export const seriesId_EnergyConsumed = 'seriesId_EnergyConsumed';

export const seriesColor_EnergyGenerated = seriesColor_EnergyProduction;
export const seriesId_EnergyGenerated = 'seriesId_EnergyGenerated';

const seriesOptions: Highcharts.SeriesOptionsType = {
  type: 'column',
  stack: 'energy',
  stacking: 'normal',
  tooltip: {
    valueSuffix: ' kWh',
    valueDecimals: 0,
  },
};

export const seriesOptions_Energy: Highcharts.SeriesOptionsType[] = [
  {
    ...seriesOptions,
    id: seriesId_EnergyConsumed,
    name: $localize`Energy (Consumed)`,
    color: seriesColor_EnergyConsumed,
    dataLabels: {
      verticalAlign: 'bottom',
    },
    custom: {
      legendLabel: $localize`Consumed`,
    },
  },
  {
    ...seriesOptions,
    id: seriesId_EnergyGenerated,
    name: $localize`Energy (Generated)`,
    color: seriesColor_EnergyGenerated,
    dataLabels: {
      inside: false,
    },
    custom: {
      legendLabel: $localize`Generated`,
    },
  },
];

export function updateSeriesData_Energy(chart: Highcharts.Chart, data: PowerMetersCumulativeData) {
  const seriesData_EnergyConsumed: Highcharts.PointOptionsType[] =
    data.dataPoints.map((dataPoint) => ({
      x: dataPoint.interval.from.getTime(),
      y: dataPoint.energy_Consumed,
      custom: dataPoint,
    })) || [];

  seriesById(chart, seriesId_EnergyConsumed)?.setData(seriesData_EnergyConsumed, false, false);

  const seriesData_EnergyGenerated: Highcharts.PointOptionsType[] =
    data.dataPoints.map((dataPoint) => ({
      x: dataPoint.interval.from.getTime(),
      y: dataPoint.energy_Generated,
      custom: dataPoint,
    })) || [];

  seriesById(chart, seriesId_EnergyGenerated)?.setData(seriesData_EnergyGenerated, false, false);
}
