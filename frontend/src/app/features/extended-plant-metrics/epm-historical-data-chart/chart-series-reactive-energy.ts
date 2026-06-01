import { seriesById } from '../../../helpers';
import { PowerMetersCumulativeData } from '../../extended-plant-metrics/_data/models';

export const seriesColor_ReactiveEnergyConsumed = '#FF7773';
export const seriesId_ReactiveEnergyConsumed = 'seriesId_ReactiveEnergyConsumed';

export const seriesColor_ReactiveEnergyGenerated = '#FFC963';
export const seriesId_ReactiveEnergyGenerated = 'seriesId_ReactiveEnergyGenerated';

const seriesOptions: Highcharts.SeriesOptionsType = {
  type: 'column',
  stack: 'reactive-energy',
  stacking: 'normal',
  tooltip: {
    valueSuffix: ' kVARh',
    valueDecimals: 0,
  },
};

export const seriesOptions_ReactiveEnergy: Highcharts.SeriesOptionsType[] = [
  {
    ...seriesOptions,
    id: seriesId_ReactiveEnergyConsumed,
    name: $localize`Reactive energy (Consumed)`,
    color: seriesColor_ReactiveEnergyConsumed,
    dataLabels: {
      inside: false,
    },
    custom: {
      legendLabel: $localize`Consumed`,
    },
  },
  {
    ...seriesOptions,
    id: seriesId_ReactiveEnergyGenerated,
    name: $localize`Reactive energy (Generated)`,
    color: seriesColor_ReactiveEnergyGenerated,
    dataLabels: {
      verticalAlign: 'bottom',
    },
    custom: {
      legendLabel: $localize`Generated`,
    },
  },
];

export function updateSeriesData_ReactiveEnergy(
  chart: Highcharts.Chart,
  data: PowerMetersCumulativeData,
) {
  const seriesData_ReactiveEnergyConsumed: Highcharts.PointOptionsType[] =
    data.dataPoints.map((dataPoint) => ({
      x: dataPoint.interval.from.getTime(),
      y: dataPoint.reactiveEnergy_Consumed,
      custom: dataPoint,
    })) || [];

  seriesById(chart, seriesId_ReactiveEnergyConsumed)?.setData(
    seriesData_ReactiveEnergyConsumed,
    false,
    false,
  );

  const seriesData_ReactiveEnergyGenerated: Highcharts.PointOptionsType[] =
    data.dataPoints.map((dataPoint) => ({
      x: dataPoint.interval.from.getTime(),
      y: dataPoint.reactiveEnergy_Generated,
      custom: dataPoint,
    })) || [];

  seriesById(chart, seriesId_ReactiveEnergyGenerated)?.setData(
    seriesData_ReactiveEnergyGenerated,
    false,
    false,
  );
}
