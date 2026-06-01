/**
 * Shared column hover series for power schedule preview charts.
 * Includes sync events for cross-chart synchronization.
 */

import { seriesById } from '../../../helpers';
import { syncedChartsSeriesPointEvents } from '../../../helpers/_charts-sync';
import { fakeYAxisMaximum } from '../../pv-charts/pv-production-chart/chart-common';
import { PowerSchedule } from '../_data/models';
import {
  seriesId_TargetBessPowerSetpoint,
  seriesId_TargetGridPowerSetpoint,
  seriesId_TargetPvPowerSetpoint,
} from './chart-common-definitions';

export const seriesId_SharedColumnHover = 'seriesId_SharedColumnHover_PowerSchedulePreview';

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
    crisp: false,
    point: {
      events: {
        mouseOver: function (event: Event) {
          // Call sync events first - they handle cross-chart synchronization
          if (syncedChartsSeriesPointEvents.mouseOver) {
            (syncedChartsSeriesPointEvents.mouseOver as any).call(this, event);
          }

          const point = this;
          const chart = this.series.chart;

          // Update PV setpoint series if present
          const pvSeries = seriesById(chart, seriesId_TargetPvPowerSetpoint);
          (pvSeries?.data || []).forEach(function (p: Highcharts.Point | undefined) {
            if (p && p.x === point.x) {
              p.setState('hover');
            }
          });

          // Update BESS setpoint series if present
          const bessSeries = seriesById(chart, seriesId_TargetBessPowerSetpoint);
          (bessSeries?.data || []).forEach(function (p: Highcharts.Point | undefined) {
            if (p && p.x === point.x) {
              p.setState('hover');
            }
          });

          // Update Grid setpoint series if present
          const gridSeries = seriesById(chart, seriesId_TargetGridPowerSetpoint);
          (gridSeries?.data || []).forEach(function (p: Highcharts.Point | undefined) {
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

          // Update PV setpoint series if present
          const pvSeries = seriesById(chart, seriesId_TargetPvPowerSetpoint);
          (pvSeries?.data || []).forEach(function (p: Highcharts.Point | undefined) {
            if (p && p.x === point.x) {
              p.setState('');
            }
          });

          // Update BESS setpoint series if present
          const bessSeries = seriesById(chart, seriesId_TargetBessPowerSetpoint);
          (bessSeries?.data || []).forEach(function (p: Highcharts.Point | undefined) {
            if (p && p.x === point.x) {
              p.setState('');
            }
          });

          // Update Grid setpoint series if present
          const gridSeries = seriesById(chart, seriesId_TargetGridPowerSetpoint);
          (gridSeries?.data || []).forEach(function (p: Highcharts.Point | undefined) {
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
  data: PowerSchedule | undefined,
) {
  if (!data) {
    seriesById(chart, seriesId_SharedColumnHover)?.setData([], false, false);
    return;
  }

  // +1 avoids border overlaping the top y axis tick
  const yMax = fakeYAxisMaximum + 1;

  const seriesData: Highcharts.PointOptionsType[] =
    data.parsedScheduleTable.map((row) => ({
      x: row.interval.start.getTime(),
      y: yMax,
      custom: row,
    })) || [];

  seriesById(chart, seriesId_SharedColumnHover)?.setData(seriesData, false, false);
}
