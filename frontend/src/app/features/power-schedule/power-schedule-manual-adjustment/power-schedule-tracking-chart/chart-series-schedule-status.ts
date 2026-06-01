import { seriesById } from 'src/app/helpers';
import { excludeSeriesFromCrossHairClassName } from 'src/app/highcharts-global-config';
import {
  PowerScheduleTracking,
  ScheduleStatusInterval,
} from '../_data/power-schedule-tracking.model';
import { fakeYAxisMaximum } from './chart-common';

export const seriesId_ScheduleStatus_Prefix = 'seriesId_ScheduleStatus';

export const seriesId_ScheduleStatus_Enabled = seriesId_ScheduleStatus_Prefix + '_Enabled';
export const seriesId_ScheduleStatus_Disabled = seriesId_ScheduleStatus_Prefix + '_Disabled';

export const seriesColor_ScheduleStatus_Enabled = '#23be73'; // @green-6
export const seriesColor_ScheduleStatus_Enabled_Text = '#14995d'; // @green-7

export const seriesColor_ScheduleStatus_Disabled = '#ff4b4b'; // @red-6
export const seriesColor_ScheduleStatus_Disabled_Text = '#d9343a'; // @red-7

const states = (color: string): Highcharts.SeriesStatesOptionsObject => {
  return {
    inactive: {
      opacity: 1,
    },
    hover: {
      color: color,
    },
  };
};

const sharedSeriesOptions: Highcharts.SeriesOptionsType = {
  type: 'xrange',
  colorByPoint: false,
  grouping: false,
  yAxis: 1,
  xAxis: 0,
  pointWidth: 10,
  showInLegend: false,
  className: excludeSeriesFromCrossHairClassName,
  zIndex: 3,
  borderRadius: 0,
  borderWidth: 1,
  borderColor: '#ffffff',
  tooltip: {
    followPointer: true,
  },
};

export const seriesOptions_ScheduleStatus: Highcharts.SeriesOptionsType[] = [
  {
    id: seriesId_ScheduleStatus_Enabled,
    ...sharedSeriesOptions,
    name: $localize`Schedule Status ENABLED`,
    borderColor: seriesColor_ScheduleStatus_Enabled,
    color: seriesColor_ScheduleStatus_Enabled + '22',
    states: states(seriesColor_ScheduleStatus_Enabled),
  },
  {
    id: seriesId_ScheduleStatus_Disabled,
    ...sharedSeriesOptions,
    name: $localize`Schedule Status DISABLED`,
    borderColor: seriesColor_ScheduleStatus_Disabled,
    color: seriesColor_ScheduleStatus_Disabled + '22',
    states: states(seriesColor_ScheduleStatus_Disabled),
  },
];

function createPoint(
  dataPoint: ScheduleStatusInterval,
  y: number | undefined,
  targetRangeStart: Date | undefined,
): Highcharts.PointOptionsObject {
  // First record is usually from previous day,
  // so we cut the point to start from target range start.
  // (The full range is still displayed in the tooltip.)
  // This is a workaround as min/max on xAxis are not respected for some reason.

  const minTimestamp = targetRangeStart?.getTime();
  return {
    x: Math.max(dataPoint.interval.start.getTime(), minTimestamp || 0),
    x2: dataPoint.interval.end.getTime(),
    y,
    custom: dataPoint,
  };
}

export function updateSeriesData_ScheduleStatus(
  chart: Highcharts.Chart,
  data: PowerScheduleTracking,
) {
  const maxY = fakeYAxisMaximum;

  // Use pre-computed schedule status history from adapter
  const scheduleStatusHistory: Array<ScheduleStatusInterval> = data.scheduleStatusHistory;

  const schedulestatusData_Enabled: Highcharts.PointOptionsObject[] = scheduleStatusHistory
    .filter((dataPoint) => dataPoint.status === 'enabled')
    .map((dataPoint: ScheduleStatusInterval) =>
      createPoint(dataPoint, maxY, data.targetRange?.from),
    );

  seriesById(chart, seriesId_ScheduleStatus_Enabled)?.setData(
    schedulestatusData_Enabled,
    false,
    false,
  );

  const schedulestatusData_Disabled: Highcharts.PointOptionsObject[] = scheduleStatusHistory
    .filter((point) => point.status === 'disabled')
    .map((dataPoint: ScheduleStatusInterval) =>
      createPoint(dataPoint, maxY, data.targetRange?.from),
    );

  seriesById(chart, seriesId_ScheduleStatus_Disabled)?.setData(
    schedulestatusData_Disabled,
    false,
    false,
  );
}
