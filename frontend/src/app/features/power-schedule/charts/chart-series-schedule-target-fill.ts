import { seriesColor_ScheduleTargetFill } from '../../../constants/_chart-series-colors';
import { seriesById } from '../../../helpers';
import { excludeSeriesFromCrossHairClassName } from '../../../highcharts-global-config';
import { PowerSchedule } from '../_data/models';
import { seriesId_TargetPvPowerSetpoint } from './chart-common-definitions';

export const seriesId_ScheduleTargetFill = 'seriesId_ScheduleTargetFill';

export const seriesOptions_ScheduleTargetFill: Highcharts.SeriesOptionsType[] = [
  {
    id: seriesId_ScheduleTargetFill,
    type: 'column',
    name: '',
    className: excludeSeriesFromCrossHairClassName,
    enableMouseTracking: false,
    linkedTo: seriesId_TargetPvPowerSetpoint,
    color: seriesColor_ScheduleTargetFill,
    dataLabels: {
      enabled: false,
    },
  },
];

export function updateSeriesData_ScheduleTargetFill(
  chart: Highcharts.Chart,
  data: PowerSchedule | undefined,
) {
  const seriesData: Highcharts.PointOptionsType[] =
    data?.parsedScheduleTable.map((row) => {
      const value = row.pvPowerSetpointAdjusted ?? row.pvPowerSetpoint;

      return {
        x: row.interval.start.getTime(),
        y: value,
      };
    }) || [];
  seriesById(chart, seriesId_ScheduleTargetFill)?.setData(seriesData, false, false);
}
