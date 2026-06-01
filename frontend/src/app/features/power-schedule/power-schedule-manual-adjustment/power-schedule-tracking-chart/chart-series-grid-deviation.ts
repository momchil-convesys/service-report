import {
  seriesName_GridExportedExcess,
  seriesName_GridExportedShortage,
  seriesName_GridImportedExcess,
  seriesName_GridImportedShortage,
} from 'src/app/constants/_chart-series-titles';
import { seriesById } from 'src/app/helpers';
import { excludeSeriesFromCrossHairClassName } from 'src/app/highcharts-global-config';
import { seriesColor_ScheduleTargetFillGridExport } from '../../../../constants/_chart-series-colors';
import {
  PowerScheduleTracking,
  PowerScheduleTrackingInterval,
} from '../_data/power-schedule-tracking.model';
import { formatDataLabel } from './chart-series-deviation-common';
import { seriesId_GridSetpoint } from './chart-series-grid-setpoints';

export const seriesId_GridExported_Excess = 'seriesId_GridExported_Excess';
export const seriesId_GridExported_Shortage = 'seriesId_GridExported_Shortage';
export const seriesId_GridImported_Excess = 'seriesId_GridImported_Excess';
export const seriesId_GridImported_Shortage = 'seriesId_GridImported_Shortage';

export const seriesOptions_GridDeviation: Highcharts.SeriesOptionsType[] = [
  {
    id: seriesId_GridExported_Excess,
    type: 'columnrange',
    name: seriesName_GridExportedExcess,
    className: excludeSeriesFromCrossHairClassName,
    enableMouseTracking: false,
    linkedTo: seriesId_GridSetpoint,
    color: '#b3222c' + 'CC', // GridIn (export) excess - red with transparency
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '0.6em',
        pointerEvents: 'none',
      },
      formatter: function (options: Highcharts.DataLabelsOptions) {
        return formatDataLabel(this, options, 'excess');
      },
    },
  },
  {
    id: seriesId_GridExported_Shortage,
    type: 'columnrange',
    name: seriesName_GridExportedShortage,
    className: excludeSeriesFromCrossHairClassName,
    enableMouseTracking: false,
    linkedTo: seriesId_GridSetpoint,
    // color: '#ff7773' + '55', // GridIn (export) shortage - red with more transparency
    color: seriesColor_ScheduleTargetFillGridExport,
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '0.6em',
        pointerEvents: 'none',
      },
      formatter: function (options: Highcharts.DataLabelsOptions) {
        return formatDataLabel(this, options, 'shortage');
      },
    },
  },
  {
    id: seriesId_GridImported_Excess,
    type: 'columnrange',
    name: seriesName_GridImportedExcess,
    className: excludeSeriesFromCrossHairClassName,
    enableMouseTracking: false,
    linkedTo: seriesId_GridSetpoint,
    color: '#003059' + '99', // GridOut (import) excess - blue with transparency
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '0.6em',
        pointerEvents: 'none',
      },
      formatter: function (options: Highcharts.DataLabelsOptions) {
        return formatDataLabel(this, options, 'excess');
      },
    },
  },
  {
    id: seriesId_GridImported_Shortage,
    type: 'columnrange',
    name: seriesName_GridImportedShortage,
    className: excludeSeriesFromCrossHairClassName,
    enableMouseTracking: false,
    linkedTo: seriesId_GridSetpoint,
    color: '#0063A6' + '55', // GridOut (import) shortage - blue with more transparency
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '0.6em',
        pointerEvents: 'none',
      },
      formatter: function (options: Highcharts.DataLabelsOptions) {
        return formatDataLabel(this, options, 'shortage');
      },
    },
  },
];

export function updateSeriesData_GridDeviation(
  chart: Highcharts.Chart,
  data: PowerScheduleTracking,
) {
  const exportedExcessData: Highcharts.PointOptionsType[] = calculateGridExportedDeviationPoints(
    data.intervals,
    'excess',
  );
  const exportedShortageData: Highcharts.PointOptionsType[] = calculateGridExportedDeviationPoints(
    data.intervals,
    'shortage',
  );
  const importedExcessData: Highcharts.PointOptionsType[] = calculateGridImportedDeviationPoints(
    data.intervals,
    'excess',
  );
  const importedShortageData: Highcharts.PointOptionsType[] = calculateGridImportedDeviationPoints(
    data.intervals,
    'shortage',
  );

  seriesById(chart, seriesId_GridExported_Excess)?.setData(exportedExcessData, false, false);
  seriesById(chart, seriesId_GridExported_Shortage)?.setData(exportedShortageData, false, false);
  seriesById(chart, seriesId_GridImported_Excess)?.setData(importedExcessData, false, false);
  seriesById(chart, seriesId_GridImported_Shortage)?.setData(importedShortageData, false, false);
}

function calculateGridExportedDeviationPoints(
  intervals: PowerScheduleTrackingInterval[],
  deviationType: 'excess' | 'shortage',
): Highcharts.PointOptionsType[] {
  const seriesData: Highcharts.PointOptionsType[] = intervals
    .map((dataPoint) => {
      // Only process if exporting (positive setpoint)
      if (
        dataPoint.gridPowerSetpoint === null ||
        dataPoint.gridPowerSetpoint <= 0 ||
        dataPoint.exportedEnergy === null
      ) {
        return null;
      }

      const setpointEquivalent = dataPoint.gridExportEnergyEquivalent;

      if (setpointEquivalent === null) {
        return null;
      }

      if (deviationType === 'excess') {
        // Excess: actual exported > setpoint equivalent
        if (setpointEquivalent >= dataPoint.exportedEnergy) {
          return null;
        }

        return {
          x: dataPoint.interval.start.getTime(),
          low: setpointEquivalent,
          high: dataPoint.exportedEnergy,
          custom: {
            start: dataPoint.interval.start,
            end: dataPoint.interval.end,
            dataPoint,
          },
          labelrank: 2,
        };
      }

      if (deviationType === 'shortage') {
        // Shortage: actual exported < setpoint equivalent
        if (setpointEquivalent <= dataPoint.exportedEnergy) {
          return null;
        }

        return {
          x: dataPoint.interval.start.getTime(),
          low: dataPoint.exportedEnergy,
          high: setpointEquivalent,
          custom: {
            start: dataPoint.interval.start,
            end: dataPoint.interval.end,
            dataPoint,
          },
          labelrank: 2,
        };
      }

      return null;
    })
    .filter((p) => p !== null) as Highcharts.PointOptionsType[];

  return seriesData;
}

function calculateGridImportedDeviationPoints(
  intervals: PowerScheduleTrackingInterval[],
  deviationType: 'excess' | 'shortage',
): Highcharts.PointOptionsType[] {
  const seriesData: Highcharts.PointOptionsType[] = intervals
    .map((dataPoint) => {
      // Only process if importing (negative setpoint)
      if (
        dataPoint.gridPowerSetpoint === null ||
        dataPoint.gridPowerSetpoint >= 0 ||
        dataPoint.importedEnergy === null
      ) {
        return null;
      }

      const setpointEquivalent = dataPoint.gridImportEnergyEquivalent;

      if (setpointEquivalent === null) {
        return null;
      }

      if (deviationType === 'excess') {
        // Excess: actual imported > setpoint equivalent
        if (setpointEquivalent >= dataPoint.importedEnergy) {
          return null;
        }

        return {
          x: dataPoint.interval.start.getTime(),
          // Negate both values to show below zero line
          low: -1 * dataPoint.importedEnergy,
          high: -1 * setpointEquivalent,
          custom: {
            start: dataPoint.interval.start,
            end: dataPoint.interval.end,
            dataPoint,
          },
          labelrank: 2,
        };
      }

      if (deviationType === 'shortage') {
        // Shortage: actual imported < setpoint equivalent
        if (setpointEquivalent <= dataPoint.importedEnergy) {
          return null;
        }

        return {
          x: dataPoint.interval.start.getTime(),
          // Negate both values to show below zero line
          low: -1 * setpointEquivalent,
          high: -1 * dataPoint.importedEnergy,
          custom: {
            start: dataPoint.interval.start,
            end: dataPoint.interval.end,
            dataPoint,
          },
          labelrank: 2,
        };
      }

      return null;
    })
    .filter((p) => p !== null) as Highcharts.PointOptionsType[];

  return seriesData;
}
