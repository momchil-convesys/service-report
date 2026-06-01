/**
 * This is an extention for the series in PV production chart
 * in order to reuse the series options (and style).
 */

import { seriesById } from '../../../helpers';
import { PowerLimitSchedule } from '../_data/models';
import {
  seriesId_TargetPowerLimit,
  seriesId_TargetPowerLimitAdjusted,
} from './chart-common-definitions';

export function updateSeriesData_ScheduleTarget(
  chart: Highcharts.Chart,
  data: PowerLimitSchedule | undefined,
) {
  const targetPowerLimitData: Highcharts.PointOptionsType[] =
    data?.parsedScheduleTable.map((row) => {
      const value = row.targetLimit_Mega;

      return {
        x: row.interval.start.getTime(),
        x2: row.interval.end.getTime(),
        y: value,
        color: '#ffffff00', //seriesColor_TargetPowerLimit + (value === null ? '00' : 'ff'),
      };
    }) || [];
  seriesById(chart, seriesId_TargetPowerLimit)?.setData(targetPowerLimitData, false, false);

  const targetPowerLimitDataAdjusted: Highcharts.PointOptionsType[] =
    data?.parsedScheduleTable.map((row) => {
      const value = row.targetLimitAdjusted_Mega;
      return {
        x: row.interval.start.getTime(),
        x2: row.interval.end.getTime(),
        y: value,
        color: '#d9343a' + (value === null ? '00' : 'ff'),
      };
    }) || [];
  seriesById(chart, seriesId_TargetPowerLimitAdjusted)?.setData(
    targetPowerLimitDataAdjusted,
    false,
    false,
  );
}
