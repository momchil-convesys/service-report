import { seriesById } from 'src/app/helpers';
import { syncedChartsSeriesPointEvents } from 'src/app/helpers/_charts-sync';
import {
  PowerScheduleTracking,
  PowerScheduleTrackingInterval,
} from '../_data/power-schedule-tracking.model';
import { fakeYAxisMaximum, useCrispPoints } from './chart-common';
import { seriesId_BESSCharged, seriesId_BESSDischarged } from './chart-series-bess-energy';
import { seriesId_GridExported, seriesId_GridImported } from './chart-series-grid-energy';
import { seriesId_PVProduction } from './chart-series-pv-production';

export interface HoverablePointCustomData {
  intervalData: PowerScheduleTrackingInterval;
  pvSetpointTargetCoefficient: number;
  bessSetpointTargetCoefficient: number;
}

export interface HoverablePoint extends Highcharts.PointOptionsObject {
  custom: HoverablePointCustomData;
}

export const seriesId_SharedColumnHover = 'seriesId_SharedColumnHover';

export const seriesOptions_SharedColumnHover: Highcharts.SeriesOptionsType[] = [
  {
    id: seriesId_SharedColumnHover,
    type: 'column',
    name: $localize`Background For Hover and Tooltip`,
    states: {
      inactive: {
        opacity: 1,
      },
      hover: {
        opacity: 1,
      },
    },
    borderWidth: 1,
    borderColor: '#ffffff',
    color: '#ffffff00',
    opacity: 1,
    zIndex: 2,

    yAxis: 1,

    showInLegend: false,
    includeInDataExport: false,

    crisp: useCrispPoints,

    point: {
      events: {
        mouseOver: function (event: Event) {
          // Call sync events first - they handle cross-chart synchronization
          if (syncedChartsSeriesPointEvents.mouseOver) {
            (syncedChartsSeriesPointEvents.mouseOver as any).call(this, event);
          }

          const point = this;
          const chart = this.series.chart;

          // Update PV series if present
          const productionSeries = seriesById(chart, seriesId_PVProduction);
          (productionSeries?.data || []).forEach(function (p: Highcharts.Point | undefined) {
            if (p && p.x === point.x) {
              p.setState('hover');
            }
          });

          // Update BESS series if present
          const chargedSeries = seriesById(chart, seriesId_BESSCharged);
          const dischargedSeries = seriesById(chart, seriesId_BESSDischarged);
          [...(chargedSeries?.data || []), ...(dischargedSeries?.data || [])].forEach(function (
            p: Highcharts.Point | undefined,
          ) {
            if (p && p.x === point.x) {
              p.setState('hover');
            }
          });

          // Update Grid series if present
          const exportedSeries = seriesById(chart, seriesId_GridExported);
          const importedSeries = seriesById(chart, seriesId_GridImported);
          [...(exportedSeries?.data || []), ...(importedSeries?.data || [])].forEach(function (
            p: Highcharts.Point | undefined,
          ) {
            if (p && p.x === point.x) {
              p.setState('hover');
            }
          });
        },
        mouseOut: function (event: PointerEvent) {
          // Call sync events first - they handle cross-chart synchronization
          if (syncedChartsSeriesPointEvents.mouseOut) {
            (syncedChartsSeriesPointEvents.mouseOut as any).call(this, event);
          }

          const point = this;
          const chart = this.series.chart;

          // Update PV series if present
          const productionSeries = seriesById(chart, seriesId_PVProduction);
          (productionSeries?.data || []).forEach(function (p: Highcharts.Point | undefined) {
            if (p && p.x === point.x) {
              p.setState('');
            }
          });

          // Update BESS series if present
          const chargedSeries = seriesById(chart, seriesId_BESSCharged);
          const dischargedSeries = seriesById(chart, seriesId_BESSDischarged);
          [...(chargedSeries?.data || []), ...(dischargedSeries?.data || [])].forEach(function (
            p: Highcharts.Point | undefined,
          ) {
            if (p && p.x === point.x) {
              p.setState('');
            }
          });

          // Update Grid series if present
          const exportedSeries = seriesById(chart, seriesId_GridExported);
          const importedSeries = seriesById(chart, seriesId_GridImported);
          [...(exportedSeries?.data || []), ...(importedSeries?.data || [])].forEach(function (
            p: Highcharts.Point | undefined,
          ) {
            if (p && p.x === point.x) {
              p.setState('');
            }
          });
        },
      },
    },
  },
];

export function updateSeriesData_SharedColumnHover(
  chart: Highcharts.Chart,
  data: PowerScheduleTracking,
) {
  // +1 avoids border overlaping the top y axis tick
  const yMax = fakeYAxisMaximum + 1;

  const seriesData: HoverablePoint[] =
    data.intervals.map((interval) => ({
      x: interval.interval.start.getTime(),
      y: yMax,
      custom: {
        intervalData: interval,
        pvSetpointTargetCoefficient: data.pvSetpointTargetCoefficient,
        bessSetpointTargetCoefficient: data.bessSetpointTargetCoefficient,
      },
    })) || [];

  seriesById(chart, seriesId_SharedColumnHover)?.setData(seriesData, false, false);
}
