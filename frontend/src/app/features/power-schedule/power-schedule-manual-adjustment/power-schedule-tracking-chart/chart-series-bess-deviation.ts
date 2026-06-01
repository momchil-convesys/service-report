import {
  seriesName_BESSChargedExcess,
  seriesName_BESSChargedShortage,
  seriesName_BESSDischargedExcess,
  seriesName_BESSDischargedShortage,
} from 'src/app/constants/_chart-series-titles';
import { seriesById } from 'src/app/helpers';
import { excludeSeriesFromCrossHairClassName } from 'src/app/highcharts-global-config';
import {
  seriesColor_ScheduleTargetFillBessCharging,
  seriesColor_ScheduleTargetFillBessDischarging,
} from '../../../../constants/_chart-series-colors';
import { PowerScheduleTracking } from '../_data/power-schedule-tracking.model';
import { seriesId_BESSSetpointAdjusted } from './chart-series-bess-setpoints';
import {
  calculateBESSChargedDeviationPoints,
  calculateBESSDischargedDeviationPoints,
  formatDataLabel,
} from './chart-series-deviation-common';

export const seriesId_BESSCharged_Excess = 'seriesId_BESSCharged_Excess';
export const seriesId_BESSCharged_Shortage = 'seriesId_BESSCharged_Shortage';
export const seriesId_BESSDischarged_Excess = 'seriesId_BESSDischarged_Excess';
export const seriesId_BESSDischarged_Shortage = 'seriesId_BESSDischarged_Shortage';

export const seriesOptions_BESSDeviation: Highcharts.SeriesOptionsType[] = [
  {
    id: seriesId_BESSCharged_Excess,
    type: 'columnrange',
    name: seriesName_BESSChargedExcess,
    className: excludeSeriesFromCrossHairClassName,
    enableMouseTracking: false,
    linkedTo: seriesId_BESSSetpointAdjusted,
    color: '#006e8a' + '77',
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
    id: seriesId_BESSCharged_Shortage,
    type: 'columnrange',
    name: seriesName_BESSChargedShortage,
    className: excludeSeriesFromCrossHairClassName,
    enableMouseTracking: false,
    linkedTo: seriesId_BESSSetpointAdjusted,
    color: seriesColor_ScheduleTargetFillBessCharging,
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
  {
    id: seriesId_BESSDischarged_Excess,
    type: 'columnrange',
    name: seriesName_BESSDischargedExcess,
    className: excludeSeriesFromCrossHairClassName,
    enableMouseTracking: false,
    linkedTo: seriesId_BESSSetpointAdjusted,
    color: '#6e851c' + '77',
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
    id: seriesId_BESSDischarged_Shortage,
    type: 'columnrange',
    name: seriesName_BESSDischargedShortage,
    className: excludeSeriesFromCrossHairClassName,
    enableMouseTracking: false,
    linkedTo: seriesId_BESSSetpointAdjusted,
    color: seriesColor_ScheduleTargetFillBessDischarging,
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

export function updateSeriesData_BESSDeviation(
  chart: Highcharts.Chart,
  data: PowerScheduleTracking,
) {
  const chargedExcessData: Highcharts.PointOptionsType[] = calculateBESSChargedDeviationPoints(
    data.intervals,
    'excess',
  );
  const chargedShortageData: Highcharts.PointOptionsType[] = calculateBESSChargedDeviationPoints(
    data.intervals,
    'shortage',
  );
  const dischargedExcessData: Highcharts.PointOptionsType[] =
    calculateBESSDischargedDeviationPoints(data.intervals, 'excess');
  const dischargedShortageData: Highcharts.PointOptionsType[] =
    calculateBESSDischargedDeviationPoints(data.intervals, 'shortage');

  seriesById(chart, seriesId_BESSCharged_Excess)?.setData(chargedExcessData, false, false);
  seriesById(chart, seriesId_BESSCharged_Shortage)?.setData(chargedShortageData, false, false);
  seriesById(chart, seriesId_BESSDischarged_Excess)?.setData(dischargedExcessData, false, false);
  seriesById(chart, seriesId_BESSDischarged_Shortage)?.setData(
    dischargedShortageData,
    false,
    false,
  );
}
