import {
  seriesColor_ScheduleTargetFillBessCharging,
  seriesColor_ScheduleTargetFillBessDischarging,
} from '../../../constants/_chart-series-colors';
import { seriesById } from '../../../helpers';
import { excludeSeriesFromCrossHairClassName } from '../../../highcharts-global-config';
import { PowerSchedule } from '../_data/models';
import { seriesId_TargetBessPowerSetpoint } from './chart-common-definitions';

export const seriesId_ScheduleTargetFillBess = 'seriesId_ScheduleTargetFillBess';

export const seriesOptions_ScheduleTargetFillBess: Highcharts.SeriesOptionsType[] = [
  {
    id: seriesId_ScheduleTargetFillBess,
    type: 'column',
    name: '',
    className: excludeSeriesFromCrossHairClassName,
    enableMouseTracking: false,
    linkedTo: seriesId_TargetBessPowerSetpoint,
    color: seriesColor_ScheduleTargetFillBessDischarging, // Default color, will be overridden per point
    dataLabels: {
      enabled: false,
    },
  },
];

export function updateSeriesData_ScheduleTargetFillBess(
  chart: Highcharts.Chart,
  data: PowerSchedule | undefined,
) {
  const seriesData: Highcharts.PointOptionsType[] =
    data?.parsedScheduleTable.map((row) => {
      const value = row.bessPowerSetpointAdjusted ?? row.bessPowerSetpoint;

      // BESS power setpoint > 0 => discharging (blue)
      // BESS power setpoint < 0 => charging (green)
      const color =
        value === null || value === 0
          ? seriesColor_ScheduleTargetFillBessDischarging
          : value > 0
            ? seriesColor_ScheduleTargetFillBessDischarging
            : seriesColor_ScheduleTargetFillBessCharging;

      return {
        x: row.interval.start.getTime(),
        y: value,
        color: color,
      };
    }) || [];
  seriesById(chart, seriesId_ScheduleTargetFillBess)?.setData(seriesData, false, false);
}
