import { seriesById } from '../../../helpers';
import { excludeSeriesFromCrossHairClassName } from '../../../highcharts-global-config';
import { seriesId_TargetPowerLimitAdjusted } from '../../power-limit-schedule/charts/chart-common-definitions';
import { PowerLimitSchedule } from '../_data/models';

export const seriesId_ScheduleTargetFill = 'seriesId_ScheduleTargetFill';

export const seriesOptions_ScheduleTargetFill: Highcharts.SeriesOptionsType[] = [
  {
    id: seriesId_ScheduleTargetFill,
    type: 'column',
    name: '',
    className: excludeSeriesFromCrossHairClassName,
    enableMouseTracking: false,
    linkedTo: seriesId_TargetPowerLimitAdjusted,
    color: '#ffdb8c33',
    dataLabels: {
      enabled: false,
    },
  },
];

export function updateSeriesData_ScheduleTargetFill(
  chart: Highcharts.Chart,
  data: PowerLimitSchedule | undefined,
) {
  const seriesData: Highcharts.PointOptionsType[] =
    data?.parsedScheduleTable.map((row) => {
      const value = row.targetLimit_Mega;

      return {
        x: row.interval.start.getTime(),
        y: value,
      };
    }) || [];
  seriesById(chart, seriesId_ScheduleTargetFill)?.setData(seriesData, false, false);
}
