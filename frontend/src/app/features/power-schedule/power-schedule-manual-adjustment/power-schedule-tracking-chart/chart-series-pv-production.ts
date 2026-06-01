import { formatNumber } from '@angular/common';
import { APP_LOCALE_ID } from 'src/app/app-locale';
import { seriesName_PVProduction } from 'src/app/constants/_chart-series-titles';
import { multiplierForValue, seriesById } from 'src/app/helpers';
import { excludeSeriesFromCrossHairClassName } from 'src/app/highcharts-global-config';
import { PowerScheduleTracking } from '../_data/power-schedule-tracking.model';

export const seriesColor_PVProduction = '#9d80bf'; // @purple-5
export const seriesId_PVProduction = 'seriesId_PVProduction';

export const seriesOptions_PVProduction: Highcharts.SeriesOptionsType[] = [
  {
    id: seriesId_PVProduction,
    type: 'column',
    name: seriesName_PVProduction,
    className: excludeSeriesFromCrossHairClassName,
    color: seriesColor_PVProduction,
    enableMouseTracking: false,
    dataLabels: {
      enabled: true,
      style: {
        pointerEvents: 'none',
      },
      formatter: function () {
        // Show labels only if there is enough space or if value is null
        if ((this as any).pointWidth < 40 || !this.y) {
          return null;
        }

        const dataMax = this.series.dataMax;
        const multiplier = dataMax ? multiplierForValue(dataMax) : 1;
        const scaledValue = Number(this.y) * multiplier;

        return formatNumber(scaledValue, APP_LOCALE_ID, scaledValue === 0 ? '1.0-0' : '1.0-0');
      },
    },
    events: {
      // Disable hide
      legendItemClick: function (e: Highcharts.SeriesLegendItemClickEventObject) {
        e.preventDefault();
        return false;
      },
    },
  },
];

export function updateSeriesData_PVProduction(
  chart: Highcharts.Chart,
  data: PowerScheduleTracking,
) {
  const seriesData: Highcharts.PointOptionsType[] = data.intervals.map((dataPoint) => ({
    x: dataPoint.interval.start.getTime(),
    y: dataPoint.pvProduction,
    custom: dataPoint,
    labelrank: 1,
  }));

  seriesById(chart, seriesId_PVProduction)?.setData(seriesData, false, false);
}
