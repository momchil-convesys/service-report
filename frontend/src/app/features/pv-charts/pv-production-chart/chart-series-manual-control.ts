import { seriesById } from '../../../helpers';
import { excludeSeriesFromCrossHairClassName } from '../../../highcharts-global-config';
import { ControlledManuallyHistory_DataPoint, PVProductionData } from './_data/pv-production';
import { fakeYAxisMaximum } from './chart-common';

export const seriesId_ManualControl_Prefix = 'seriesId_ManualControl';

export const seriesId_ManualControl_Enabled = seriesId_ManualControl_Prefix + '_Enabled';

export const seriesColor_ManualControl_Enabled = '#0063A6'; // @blue-8

interface CustomPoint extends Highcharts.PointOptionsObject {
  custom: ControlledManuallyHistory_DataPoint;
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
  pointWidth: 20,
  showInLegend: false,
  className: excludeSeriesFromCrossHairClassName,
  zIndex: 4, // Higher than schedule status (zIndex: 3) to ensure hoverability
  borderRadius: 0,
  borderWidth: 1,
  borderColor: '#ffffff',
  tooltip: {
    followPointer: true,
  },
};

export const seriesOptions_ManualControl: Highcharts.SeriesOptionsType[] = [
  {
    id: seriesId_ManualControl_Enabled,
    ...sharedSeriesOptions,
    name: $localize`Manual limit control`,
    borderColor: seriesColor_ManualControl_Enabled,
    color: '#0081cc' + '55',
    states: states(seriesColor_ManualControl_Enabled),
  },
];

function createPoint(
  dataPoint: ControlledManuallyHistory_DataPoint,
  y: number | undefined,
  targetRangeStart: Date | undefined,
): CustomPoint {
  // First record is usually from previous day,
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

export function updateSeriesData_ManualControl(chart: Highcharts.Chart, data: PVProductionData) {
  const maxY = fakeYAxisMaximum;

  const manualControlData_Enabled: any[] =
    data.controlledManuallyHistory
      ?.filter((dataPoint) => dataPoint.controlledManually === true)
      .map((dataPoint: ControlledManuallyHistory_DataPoint) =>
        createPoint(dataPoint, maxY, data.targetRange?.from),
      ) || [];

  seriesById(chart, seriesId_ManualControl_Enabled)?.setData(
    manualControlData_Enabled,
    false,
    false,
  );
}
