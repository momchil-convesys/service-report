import {
  seriesColor_ScheduleTargetFillGridExport,
  seriesColor_ScheduleTargetFillGridImport,
} from '../../../constants/_chart-series-colors';
import { seriesById } from '../../../helpers';
import { excludeSeriesFromCrossHairClassName } from '../../../highcharts-global-config';
import { PowerSchedule } from '../_data/models';
import { seriesId_TargetGridPowerSetpoint } from './chart-common-definitions';

export const seriesId_ScheduleTargetFillGrid = 'seriesId_ScheduleTargetFillGrid';

export const seriesOptions_ScheduleTargetFillGrid: Highcharts.SeriesOptionsType[] = [
  {
    id: seriesId_ScheduleTargetFillGrid,
    type: 'column',
    name: '',
    className: excludeSeriesFromCrossHairClassName,
    enableMouseTracking: false,
    linkedTo: seriesId_TargetGridPowerSetpoint,
    color: seriesColor_ScheduleTargetFillGridExport, // Default color, will be overridden per point
    dataLabels: {
      enabled: false,
    },
  },
];

export function updateSeriesData_ScheduleTargetFillGrid(
  chart: Highcharts.Chart,
  data: PowerSchedule | undefined,
) {
  const seriesData: Highcharts.PointOptionsType[] =
    data?.parsedScheduleTable.map((row) => {
      const value = row.gridPowerSetpoint;

      if (value === null) {
        return {
          x: row.interval.start.getTime(),
          y: null,
        };
      }

      // Grid power setpoint > 0 => export (red)
      // Grid power setpoint < 0 => import (blue)
      const color =
        value === 0
          ? seriesColor_ScheduleTargetFillGridExport
          : value > 0
            ? seriesColor_ScheduleTargetFillGridExport
            : seriesColor_ScheduleTargetFillGridImport;

      return {
        x: row.interval.start.getTime(),
        y: value,
        color: color,
      };
    }) || [];

  seriesById(chart, seriesId_ScheduleTargetFillGrid)?.setData(seriesData, false, false);
}
