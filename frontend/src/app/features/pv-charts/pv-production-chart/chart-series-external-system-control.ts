import { seriesById } from '../../../helpers';
import { excludeSeriesFromCrossHairClassName } from '../../../highcharts-global-config';
import {
  ControlledByExternalSystemHistory_DataPoint,
  PVProductionData,
} from './_data/pv-production';
import { fakeYAxisMaximum } from './chart-common';

export const seriesId_ExternalSystemControl_Prefix = 'seriesId_ExternalSystemControl';

export const seriesId_ExternalSystemControl_Enabled =
  seriesId_ExternalSystemControl_Prefix + '_Enabled';

export const seriesColor_ExternalSystemControl_Enabled = '#66839b'; // @gray-7

interface CustomPoint extends Highcharts.PointOptionsObject {
  custom: ControlledByExternalSystemHistory_DataPoint;
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

export const seriesOptions_ExternalSystemControl: Highcharts.SeriesOptionsType[] = [
  {
    id: seriesId_ExternalSystemControl_Enabled,
    ...sharedSeriesOptions,
    name: $localize`External system control`,
    borderColor: seriesColor_ExternalSystemControl_Enabled,
    color: seriesColor_ExternalSystemControl_Enabled + '55',
    states: states(seriesColor_ExternalSystemControl_Enabled),
  },
];

function createPoint(
  dataPoint: ControlledByExternalSystemHistory_DataPoint,
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

export function updateSeriesData_ExternalSystemControl(
  chart: Highcharts.Chart,
  data: PVProductionData,
) {
  const maxY = fakeYAxisMaximum;

  const externalSystemControlData_Enabled: any[] =
    data.controlledByExternalSystemHistory
      ?.filter((dataPoint) => dataPoint.controlledByExternalSystem === true)
      .map((dataPoint: ControlledByExternalSystemHistory_DataPoint) =>
        createPoint(dataPoint, maxY, data.targetRange?.from),
      ) || [];

  seriesById(chart, seriesId_ExternalSystemControl_Enabled)?.setData(
    externalSystemControlData_Enabled,
    false,
    false,
  );
}
