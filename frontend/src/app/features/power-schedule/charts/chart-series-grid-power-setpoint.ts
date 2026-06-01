import {
  seriesColor_GridPowerSetpointExport,
  seriesColor_GridPowerSetpointImport,
} from '../../../constants/_chart-series-colors';
import { seriesName_GridPowerSetpoint } from '../../../constants/_chart-series-titles';
import { seriesById } from '../../../helpers';
import { excludeSeriesFromCrossHairClassName } from '../../../highcharts-global-config';
import { PowerSchedule } from '../_data/models';
import { seriesId_TargetGridPowerSetpoint } from './chart-common-definitions';

const baseNameGrid = seriesName_GridPowerSetpoint;

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

export const seriesOptions_GridPowerSetpoint: Highcharts.SeriesOptionsType[] = [
  {
    ...sharedSeriesOptions,
    id: seriesId_TargetGridPowerSetpoint,
    color: seriesColor_GridPowerSetpointExport,
    name: baseNameGrid,
    visible: true,
  },
];

export function updateSeriesData_GridPowerSetpoint(
  chart: Highcharts.Chart,
  data: PowerSchedule | undefined,
) {
  const gridPowerSetpointData: Highcharts.PointOptionsType[] =
    data?.parsedScheduleTable.map((row) => {
      const value = row.gridPowerSetpoint;

      if (value === null) {
        return {
          x: row.interval.start.getTime(),
          x2: row.interval.end.getTime(),
          y: null,
          color: seriesColor_GridPowerSetpointExport + '00',
        };
      }

      // Determine color based on export/import
      const pointColor =
        value === 0
          ? seriesColor_GridPowerSetpointExport + 'ff'
          : value > 0
            ? seriesColor_GridPowerSetpointExport + 'ff' // Export = red
            : seriesColor_GridPowerSetpointImport + 'ff'; // Import = blue

      return {
        x: row.interval.start.getTime(),
        x2: row.interval.end.getTime(),
        y: value,
        color: pointColor,
      };
    }) || [];

  seriesById(chart, seriesId_TargetGridPowerSetpoint)?.setData(gridPowerSetpointData, false, false);
}
