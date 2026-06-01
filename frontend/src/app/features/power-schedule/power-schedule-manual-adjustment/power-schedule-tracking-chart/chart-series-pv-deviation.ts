import {
  seriesName_PVProductionExcess,
  seriesName_PVProductionShortage,
} from 'src/app/constants/_chart-series-titles';
import { seriesById } from 'src/app/helpers';
import { excludeSeriesFromCrossHairClassName } from 'src/app/highcharts-global-config';
import { seriesColor_ScheduleTargetFill } from '../../../../constants/_chart-series-colors';
import { PowerScheduleTracking } from '../_data/power-schedule-tracking.model';
import { calculatePVDeviationPoints, formatDataLabel } from './chart-series-deviation-common';
import { seriesId_PVSetpointAdjusted } from './chart-series-pv-setpoints';

export const seriesId_PVProduction_Excess = 'seriesId_PVProduction_Excess';
export const seriesId_PVProduction_Shortage = 'seriesId_PVProduction_Shortage';

export const seriesOptions_PVDeviation: Highcharts.SeriesOptionsType[] = [
  {
    id: seriesId_PVProduction_Excess,
    type: 'columnrange',
    name: seriesName_PVProductionExcess,
    className: excludeSeriesFromCrossHairClassName,
    enableMouseTracking: false,
    linkedTo: seriesId_PVSetpointAdjusted,
    color: '#d9343a' + '77',
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '0.6em',
        pointerEvents: 'none',
      },
      formatter: function (options: Highcharts.DataLabelsOptions) {
        return formatDataLabel(this, options, 'excess');
      },
    },
  },
  {
    id: seriesId_PVProduction_Shortage,
    type: 'columnrange',
    name: seriesName_PVProductionShortage,
    className: excludeSeriesFromCrossHairClassName,
    enableMouseTracking: false,
    linkedTo: seriesId_PVSetpointAdjusted,
    // color: '#ff4b4b' + '44',
    color: seriesColor_ScheduleTargetFill,
    dataLabels: {
      enabled: true,
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

export function updateSeriesData_PVDeviation(chart: Highcharts.Chart, data: PowerScheduleTracking) {
  const excessData: Highcharts.PointOptionsType[] = calculatePVDeviationPoints(
    data.intervals,
    'excess',
  );
  const shortageData: Highcharts.PointOptionsType[] = calculatePVDeviationPoints(
    data.intervals,
    'shortage',
  );

  seriesById(chart, seriesId_PVProduction_Excess)?.setData(excessData, false, false);
  seriesById(chart, seriesId_PVProduction_Shortage)?.setData(shortageData, false, false);
}
