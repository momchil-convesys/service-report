import { formatNumber } from '@angular/common';
import { APP_LOCALE_ID } from 'src/app/app-locale';
import {
  semanticColor_BatteryCharging,
  semanticColor_BatteryDischarging,
} from 'src/app/constants/_chart-series-colors';
import {
  seriesName_BESSChargedEnergy,
  seriesName_BESSDischargedEnergy,
} from 'src/app/constants/_chart-series-titles';
import { multiplierForValue, seriesById } from 'src/app/helpers';
import { excludeSeriesFromCrossHairClassName } from 'src/app/highcharts-global-config';
import { PowerScheduleTracking } from '../_data/power-schedule-tracking.model';

export const seriesColor_BESSCharged = semanticColor_BatteryCharging; // @cyan-6
export const seriesColor_BESSDischarged = semanticColor_BatteryDischarging; // @green-fresh-6
export const seriesId_BESSCharged = 'seriesId_BESSCharged';
export const seriesId_BESSDischarged = 'seriesId_BESSDischarged';

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
      // Use absolute value for display since charged energy is negated for visualization
      const scaledValue = Math.abs(Number(this.y)) * multiplier;

      return formatNumber(scaledValue, APP_LOCALE_ID, scaledValue === 0 ? '1.0-0' : '1.0-0');
    },
  },
};

export const seriesOptions_BESSEnergy: Highcharts.SeriesOptionsType[] = [
  {
    id: seriesId_BESSCharged,
    name: seriesName_BESSChargedEnergy,
    color: seriesColor_BESSCharged,
    ...sharedColumnSeriesOptions,
  },
  {
    id: seriesId_BESSDischarged,
    name: seriesName_BESSDischargedEnergy,
    color: seriesColor_BESSDischarged,
    ...sharedColumnSeriesOptions,
  },
];

export function updateSeriesData_BESSEnergy(chart: Highcharts.Chart, data: PowerScheduleTracking) {
  const chargedData: Highcharts.PointOptionsType[] = data.intervals.map((dataPoint) => ({
    x: dataPoint.interval.start.getTime(),
    // Negate charged energy to show below zero line
    y: dataPoint.bessChargedEnergy !== null ? -1 * dataPoint.bessChargedEnergy : null,
    custom: dataPoint,
    labelrank: 1,
  }));

  const dischargedData: Highcharts.PointOptionsType[] = data.intervals.map((dataPoint) => ({
    x: dataPoint.interval.start.getTime(),
    y: dataPoint.bessDischargedEnergy,
    custom: dataPoint,
    labelrank: 1,
  }));

  seriesById(chart, seriesId_BESSCharged)?.setData(chargedData, false, false);
  seriesById(chart, seriesId_BESSDischarged)?.setData(dischargedData, false, false);
}
