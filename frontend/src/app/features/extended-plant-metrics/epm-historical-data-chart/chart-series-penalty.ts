import { seriesById } from '../../../helpers';
import { PowerMetersCumulativeData } from '../../extended-plant-metrics/_data/models';

export const seriesColor_Calculated_ReactiveEnergy_Consumed = '#FF4B4B';
export const seriesId_Calculated_ReactiveEnergy_Consumed =
  'seriesId_Calculated_ReactiveEnergy_Consumed';

export const seriesColor_Calculated_ReactiveEnergy_Generated = '#FF9E13';
export const seriesId_Calculated_ReactiveEnergy_Generated =
  'seriesId_Calculated_ReactiveEnergy_Generated';

const seriesOptions: Highcharts.SeriesOptionsType = {
  type: 'column',
  stack: 'penalty',
  stacking: 'normal',
  tooltip: {
    valueSuffix: ' kVARh',
    valueDecimals: 0,
  },
};

export const seriesOptions_Calculated_ReactiveEnergy: Highcharts.SeriesOptionsType[] = [
  {
    ...seriesOptions,
    id: seriesId_Calculated_ReactiveEnergy_Consumed,
    name: $localize`Calculated reactive energy (Consumed)`,
    color: seriesColor_Calculated_ReactiveEnergy_Consumed,
    dataLabels: {
      inside: false,
    },
    custom: {
      legendLabel: $localize`Consumed`,
    },
  },
  {
    ...seriesOptions,
    id: seriesId_Calculated_ReactiveEnergy_Generated,
    name: $localize`Calculated reactive energy (Generated)`,
    color: seriesColor_Calculated_ReactiveEnergy_Generated,
    dataLabels: {
      verticalAlign: 'bottom',
    },
    custom: {
      legendLabel: $localize`Generated`,
    },
  },
];

export function updateSeriesData_Calculated_ReactiveEnergy(
  chart: Highcharts.Chart,
  data: PowerMetersCumulativeData,
) {
  const seriesData_Calculated_ReactiveEnergy_Consumed: Highcharts.PointOptionsType[] =
    data.dataPoints.map((dataPoint) => ({
      x: dataPoint.interval.from.getTime(),
      y: dataPoint.calculated_reactiveEnergy_Consumed,
      custom: dataPoint,
    })) || [];

  seriesById(chart, seriesId_Calculated_ReactiveEnergy_Consumed)?.setData(
    seriesData_Calculated_ReactiveEnergy_Consumed,
    false,
    false,
  );

  const seriesData_Calculated_ReactiveEnergy_Generated: Highcharts.PointOptionsType[] =
    data.dataPoints.map((dataPoint) => ({
      x: dataPoint.interval.from.getTime(),
      y: dataPoint.calculated_reactiveEnergy_Generated,
      custom: dataPoint,
    })) || [];

  seriesById(chart, seriesId_Calculated_ReactiveEnergy_Generated)?.setData(
    seriesData_Calculated_ReactiveEnergy_Generated,
    false,
    false,
  );
}
