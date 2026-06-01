import {
  semanticColor_GridIn,
  semanticColor_GridOut,
} from 'src/app/constants/_chart-series-colors';
import { seriesName_GridSetpointEnergyEquivalent } from 'src/app/constants/_chart-series-titles';
import { seriesById } from 'src/app/helpers';
import { excludeSeriesFromCrossHairClassName } from 'src/app/highcharts-global-config';
import {
  PowerScheduleTracking,
  PowerScheduleTrackingInterval,
} from '../_data/power-schedule-tracking.model';

export interface ExtendedGridSetpointPoint {
  x: number;
  x2: number;
  y: number; // Energy equivalent in kWh
  color: string;
  custom: {
    dataPoint: PowerScheduleTrackingInterval;
    powerValue: number | null; // Grid power setpoint value in kW (for tooltip)
  };
}

const seriesColor_GridSetpointExport = semanticColor_GridIn; // GridIn = export (positive) = red-6
const seriesColor_GridSetpointImport = semanticColor_GridOut; // GridOut = import (negative) = blue-8

export const seriesId_GridSetpoint = 'seriesId_GridSetpoint';

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

export const seriesOptions_GridSetpoints: Highcharts.SeriesOptionsType[] = [
  {
    ...sharedSeriesOptions,
    id: seriesId_GridSetpoint,
    color: seriesColor_GridSetpointExport,
    visible: true,
    name: seriesName_GridSetpointEnergyEquivalent,
  },
];

export function updateSeriesData_GridSetpoints(
  chart: Highcharts.Chart,
  data: PowerScheduleTracking,
) {
  // Grid Setpoint - use pre-calculated energy equivalent
  const gridSetpointData: ExtendedGridSetpointPoint[] = data.intervals
    .filter((dataPoint) => {
      return dataPoint.gridPowerSetpoint !== null;
    })
    .map((dataPoint) => {
      const powerValue = dataPoint.gridPowerSetpoint!;

      // Determine energy equivalent based on export/import
      let energyKWh: number;
      let pointColor: string;
      let isExporting: boolean;

      if (powerValue > 0) {
        // Exporting: use export energy equivalent
        energyKWh = dataPoint.gridExportEnergyEquivalent ?? 0;
        pointColor = seriesColor_GridSetpointExport + 'ff'; // GridIn = export = red
        isExporting = true;
      } else if (powerValue < 0) {
        // Importing: use import energy equivalent, negate for visualization
        energyKWh = dataPoint.gridImportEnergyEquivalent ?? 0;
        pointColor = seriesColor_GridSetpointImport + 'ff'; // GridOut = import = blue
        isExporting = false;
      } else {
        // Zero setpoint
        energyKWh = 0;
        pointColor = seriesColor_GridSetpointExport + 'ff';
        isExporting = true;
      }

      return {
        x: dataPoint.interval.start.getTime(),
        x2: dataPoint.interval.end.getTime(),
        y: isExporting ? (energyKWh > 0 ? energyKWh : 0) : energyKWh > 0 ? -1 * energyKWh : 0,
        color: pointColor,
        custom: {
          dataPoint,
          powerValue,
        },
      };
    });

  seriesById(chart, seriesId_GridSetpoint)?.setData(gridSetpointData, false, false);
}
