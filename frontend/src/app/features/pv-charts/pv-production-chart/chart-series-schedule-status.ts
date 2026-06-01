import { seriesById } from '../../../helpers';
import { excludeSeriesFromCrossHairClassName } from '../../../highcharts-global-config';
import { PVProductionData, ScheduleStatusHistory_DataPoint } from './_data/pv-production';
import { fakeYAxisMaximum } from './chart-common';

export const seriesId_ScheduleStatus_Prefix = 'seriesId_ScheduleStatus';

export const seriesId_ScheduleStatus_Enabled = seriesId_ScheduleStatus_Prefix + '_Enabled';
export const seriesId_ScheduleStatus_Disabled = seriesId_ScheduleStatus_Prefix + '_Disabled';

export const seriesColor_ScheduleStatus_Enabled = '#23be73'; // @green-6
export const seriesColor_ScheduleStatus_Enabled_Text = '#14995d'; // @green-7

export const seriesColor_ScheduleStatus_Disabled = '#ff4b4b'; // @red-6
export const seriesColor_ScheduleStatus_Disabled_Text = '#d9343a'; // @red-7

interface CustomPoint extends Highcharts.PointOptionsObject {
  custom: ScheduleStatusHistory_DataPoint;
}

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
  // className: seriesXRangeClassName,
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
    name: $localize`Schedule status ENABLED`,
    borderColor: seriesColor_ScheduleStatus_Enabled,
    color: seriesColor_ScheduleStatus_Enabled + '22',
    states: states(seriesColor_ScheduleStatus_Enabled),
  },
  {
    id: seriesId_ScheduleStatus_Disabled,
    ...sharedSeriesOptions,
    name: $localize`Schedule status DISABLED`,
    borderColor: seriesColor_ScheduleStatus_Disabled,
    color: seriesColor_ScheduleStatus_Disabled + '22',
    states: states(seriesColor_ScheduleStatus_Disabled),
  },
];

function createPoint(
  dataPoint: ScheduleStatusHistory_DataPoint,
  y: number | undefined,
  targetRangeStart: Date | undefined,
): CustomPoint {
  // First record is usually from previus day,
  // so we cut the point to start from target range start.
  // (The full range is still displayed in the tooltip.)
  // This is a workaround as min/max on xAxis are not respected for some reason.

  const minTimestamp = targetRangeStart?.getTime();
  return {
    x: Math.max(dataPoint.timestamp.getTime(), minTimestamp || 0),
    x2: dataPoint.timestampEnd?.getTime(),
    y,
    custom: dataPoint,
  };
}

export function updateSeriesData_ScheduleStatus(chart: Highcharts.Chart, data: PVProductionData) {
  const maxY = fakeYAxisMaximum;

  const schedulestatusData_Enabled: any[] =
    data.scheduleStatusHistory
      ?.filter((dataPoint) => dataPoint.statusChangedTo === 'enabled')
      .map((dataPoint: ScheduleStatusHistory_DataPoint) =>
        createPoint(dataPoint, maxY, data.targetRange?.from),
      ) || [];

  seriesById(chart, seriesId_ScheduleStatus_Enabled)?.setData(
    schedulestatusData_Enabled,
    false,
    false,
  );

  const schedulestatusData_Disabled: any[] =
    data.scheduleStatusHistory
      ?.filter((point) => point.statusChangedTo === 'disabled')
      .map((dataPoint: ScheduleStatusHistory_DataPoint) =>
        createPoint(dataPoint, maxY, data.targetRange?.from),
      ) || [];

  seriesById(chart, seriesId_ScheduleStatus_Disabled)?.setData(
    schedulestatusData_Disabled,
    false,
    false,
  );
}
