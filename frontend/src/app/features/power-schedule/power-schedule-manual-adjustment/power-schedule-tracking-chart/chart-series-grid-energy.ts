import { formatNumber } from '@angular/common';
import { APP_LOCALE_ID } from 'src/app/app-locale';
import {
  semanticColor_GridIn,
  semanticColor_GridOut,
} from 'src/app/constants/_chart-series-colors';
import {
  seriesName_ExportedToGridMV,
  seriesName_ImportedFromGridMV,
} from 'src/app/constants/_chart-series-titles';
import { multiplierForValue, seriesById } from 'src/app/helpers';
import { excludeSeriesFromCrossHairClassName } from 'src/app/highcharts-global-config';
import { PowerScheduleTracking } from '../_data/power-schedule-tracking.model';

export const seriesColor_GridExported = semanticColor_GridIn; // GridIn = export (positive) = red-6
export const seriesColor_GridImported = semanticColor_GridOut + 'CC'; // GridOut = import (negative) = blue-8
export const seriesId_GridExported = 'seriesId_GridExported';
export const seriesId_GridImported = 'seriesId_GridImported';

const sharedColumnSeriesOptions: Highcharts.SeriesOptionsType = {
  type: 'column',
  className: excludeSeriesFromCrossHairClassName,
  enableMouseTracking: true,
  dataLabels: {
    enabled: true,
    style: {
      pointerEvents: 'none',
    },
    formatter: function () {
      // Show labels only if there is enough space
      if ((this as any).pointWidth < 40 || !this.y) {
        return null;
      }

      const dataMax = this.series.dataMax;
      const multiplier = dataMax ? multiplierForValue(dataMax) : 1;
      // Use absolute value for display since imported energy is negated for visualization
      const scaledValue = Math.abs(Number(this.y)) * multiplier;

      return formatNumber(scaledValue, APP_LOCALE_ID, scaledValue === 0 ? '1.0-0' : '1.0-0');
    },
  },
};

export const seriesOptions_GridEnergy: Highcharts.SeriesOptionsType[] = [
  {
    id: seriesId_GridExported,
    name: seriesName_ExportedToGridMV,
    color: seriesColor_GridExported,
    ...sharedColumnSeriesOptions,
  },
  {
    id: seriesId_GridImported,
    name: seriesName_ImportedFromGridMV,
    color: seriesColor_GridImported,
    ...sharedColumnSeriesOptions,
  },
];

export function updateSeriesData_GridEnergy(chart: Highcharts.Chart, data: PowerScheduleTracking) {
  const exportedData: Highcharts.PointOptionsType[] = data.intervals.map((dataPoint) => ({
    x: dataPoint.interval.start.getTime(),
    y: dataPoint.exportedEnergy,
    custom: dataPoint,
    labelrank: 1,
  }));

  const importedData: Highcharts.PointOptionsType[] = data.intervals.map((dataPoint) => ({
    x: dataPoint.interval.start.getTime(),
    // Negate imported energy to show below zero line
    y: dataPoint.importedEnergy !== null ? -1 * dataPoint.importedEnergy : null,
    custom: dataPoint,
    labelrank: 1,
  }));

  seriesById(chart, seriesId_GridExported)?.setData(exportedData, false, false);
  seriesById(chart, seriesId_GridImported)?.setData(importedData, false, false);
}
