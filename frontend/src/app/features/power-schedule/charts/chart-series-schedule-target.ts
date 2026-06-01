/**
 * This is an extention for the series in PV production chart
 * in order to reuse the series options (and style).
 */

import {
  semanticColor_BESSSetpointCharging,
  semanticColor_BESSSetpointDischarging,
  seriesColor_PvPowerSetpoint,
} from '../../../constants/_chart-series-colors';
import {
  seriesName_BESSPowerSetpoint,
  seriesName_PVPowerSetpoint,
} from '../../../constants/_chart-series-titles';
import { seriesById } from '../../../helpers';
import { calcScheduleAdjustmentPercentageFormatted } from '../../../helpers/_schedule-adjustment-coefficient';
import { excludeSeriesFromCrossHairClassName } from '../../../highcharts-global-config';
import { PowerSchedule } from '../_data/models';
import {
  seriesId_TargetBessPowerSetpoint,
  seriesId_TargetPvPowerSetpoint,
} from './chart-common-definitions';

const baseNamePv = seriesName_PVPowerSetpoint;
const baseNameBess = seriesName_BESSPowerSetpoint;

const sharedSeriesOptions: Highcharts.SeriesOptionsType = {
  type: 'xrange',
  colorByPoint: false,
  grouping: false,
  pointWidth: 1,
  className: excludeSeriesFromCrossHairClassName,
  borderWidth: 0,
  borderColor: '#ffffff00',
  borderRadius: 0,
  stickyTracking: false,
  states: {
    inactive: {
      opacity: 0.9,
    },
  },
  legendSymbol: 'lineMarker',
};

export const seriesOptions_ScheduleTarget: Highcharts.SeriesOptionsType[] = [
  {
    ...sharedSeriesOptions,
    id: seriesId_TargetPvPowerSetpoint,
    color: seriesColor_PvPowerSetpoint,
    name: baseNamePv,
    visible: true,
  },
  {
    ...sharedSeriesOptions,
    id: seriesId_TargetBessPowerSetpoint,
    color: semanticColor_BESSSetpointCharging,
    name: baseNameBess,
    visible: true,
  },
];

export function updateSeriesData_ScheduleTarget(
  chart: Highcharts.Chart,
  data: PowerSchedule | undefined,
) {
  // Update series names with percentage if coefficient is not 1
  const pvPercentage = data
    ? calcScheduleAdjustmentPercentageFormatted(data.coefficientForPvPowerSetpoint ?? 1)
    : '';
  const bessPercentage = data
    ? calcScheduleAdjustmentPercentageFormatted(data.coefficientForBessPowerSetpoint ?? 1)
    : '';

  const pvSeries = seriesById(chart, seriesId_TargetPvPowerSetpoint);
  if (pvSeries) {
    pvSeries.update(
      {
        type: 'xrange',
        name: baseNamePv + pvPercentage,
      },
      false,
    );
  }

  const bessSeries = seriesById(chart, seriesId_TargetBessPowerSetpoint);
  if (bessSeries) {
    bessSeries.update(
      {
        type: 'xrange',
        name: baseNameBess + bessPercentage,
      },
      false,
    );
  }

  const targetPvPowerSetpointData: Highcharts.PointOptionsType[] =
    data?.parsedScheduleTable.map((row) => {
      const value = row.pvPowerSetpointAdjusted ?? row.pvPowerSetpoint;

      return {
        x: row.interval.start.getTime(),
        x2: row.interval.end.getTime(),
        y: value,
        color: seriesColor_PvPowerSetpoint + (value === null ? '00' : 'ff'),
      };
    }) || [];
  seriesById(chart, seriesId_TargetPvPowerSetpoint)?.setData(
    targetPvPowerSetpointData,
    false,
    false,
  );

  const targetBessPowerSetpointData: Highcharts.PointOptionsType[] =
    data?.parsedScheduleTable.map((row) => {
      const value = row.bessPowerSetpointAdjusted ?? row.bessPowerSetpoint;
      return {
        x: row.interval.start.getTime(),
        x2: row.interval.end.getTime(),
        y: value,
        color:
          value === null || value === 0
            ? '#ffffff00'
            : value > 0
              ? semanticColor_BESSSetpointDischarging
              : semanticColor_BESSSetpointCharging,
      };
    }) || [];
  seriesById(chart, seriesId_TargetBessPowerSetpoint)?.setData(
    targetBessPowerSetpointData,
    false,
    false,
  );
}
