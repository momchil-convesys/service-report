import { ONE_HOUR } from '../../../../constants';
import { ClockService } from '../../../../data/services/clock.service';
import { yAxisFormatter_ScaleValue_v2, yAxisZeroPlotLine } from '../../../../helpers';
import { syncedChartsClassName, xAxisEvents } from '../../../../helpers/_charts-sync';
import Highcharts, { fullPointWidthCrosshairClassName } from '../../../../highcharts-global-config';
import {
  columnLikeSeries_SharedOptions,
  fakeYAxisMaximum,
} from '../../../pv-charts/pv-production-chart/chart-common';
import { PowerSchedule } from '../../_data/models';
import {
  seriesOptions_GridPowerSetpoint,
  updateSeriesData_GridPowerSetpoint,
} from '../chart-series-grid-power-setpoint';
import {
  seriesOptions_ScheduleTargetFillGrid,
  updateSeriesData_ScheduleTargetFillGrid,
} from '../chart-series-grid-power-setpoint-fill';
import {
  seriesOptions_SharedColumnHover,
  updateSeriesData_SharedColumnHover,
} from '../chart-series-shared-column-hover';
import { tooltip } from '../chart-tooltip';

export const chartOptions: Highcharts.Options = {
  syncGroupName: 'power-schedule-preview',
  chart: {
    className: syncedChartsClassName,
    // spacing: [24, 24, 12, 24],
    zooming: {
      type: 'x',
      mouseWheel: false,
    },
  },
  title: {
    text: $localize`Calculated grid export / import power`,
    margin: 5,
  },
  xAxis: {
    type: 'datetime',
    crosshair: {
      className: fullPointWidthCrosshairClassName,
    },
    showLastLabel: false,
    gridLineWidth: 1,
    gridLineColor: '#EDF0F3', // @border-color-base,
    gridZIndex: 4,
    minorGridLineWidth: 1,
    minorGridLineColor: '#EDF0F3', // @border-color-base,
    minorTickInterval: ONE_HOUR,
    events: xAxisEvents,
  },
  yAxis: [
    {
      opposite: true,
      labels: {
        enabled: true,
        formatter: function (context) {
          const value = this.value as number;
          const incluedeUnit = value === 0;

          let maxFromAllSeries = 0;
          context.chart.series.forEach((series) => {
            maxFromAllSeries = Math.max(
              maxFromAllSeries,
              series.dataMax ?? 0,
              Math.abs(series.dataMin ?? 0),
            );
          });

          maxFromAllSeries = Math.max(
            maxFromAllSeries,
            Math.abs(context.axis.options.softMin ?? 0),
            Math.abs(context.axis.options.softMax ?? 0),
          );

          return yAxisFormatter_ScaleValue_v2(context, 'W', maxFromAllSeries, incluedeUnit);
        },
      },
      title: {
        text: undefined,
      },
      // gridLineWidth: 0,
      plotLines: [yAxisZeroPlotLine],
      tickPositions: [-60000, 0, 60000, 120000],
      min: -60000,
      max: 120000,
    },
    {
      // Y axis for fake column hover
      min: 0,
      max: fakeYAxisMaximum,
      tickAmount: 2,
      visible: false,
    },
  ],
  legend: {
    enabled: true,
    margin: 5,
  },
  tooltip: tooltip,
  plotOptions: {
    column: {
      ...columnLikeSeries_SharedOptions,
      pointPlacement: 0.5,
    },
    columnrange: columnLikeSeries_SharedOptions,
  },
  series: [
    ...seriesOptions_SharedColumnHover,
    ...seriesOptions_ScheduleTargetFillGrid,
    ...seriesOptions_GridPowerSetpoint,
  ],
};

export function updateData(chart: Highcharts.Chart, data: PowerSchedule | undefined) {
  updateSeriesData_GridPowerSetpoint(chart, data);
  updateSeriesData_ScheduleTargetFillGrid(chart, data);
  updateSeriesData_SharedColumnHover(chart, data);
}

const plotBandId_PastTime = 'plotBandId_PastTime_PowerScheduleGrid';
const plotBandId_CurrentInterval = 'plotBandId_CurrentInterval_PowerScheduleGrid';

const pastIntervalColor = '#edf0f377';
const currentIntervalColor = '#fff9e6'; // gold-1

export function updatePlotBands(
  chart: Highcharts.Chart,
  data: PowerSchedule | undefined,
  clock: ClockService,
) {
  // Remove existing plot bands
  chart.xAxis[0].removePlotBand(plotBandId_PastTime);
  chart.xAxis[0].removePlotBand(plotBandId_CurrentInterval);

  if (!data || data.parsedScheduleTable.length === 0) {
    return;
  }

  const intervals = data.parsedScheduleTable;
  let pastIntervalsStart: Date | null = null;
  let pastIntervalsEnd: Date | null = null;
  let currentIntervalStart: Date | null = null;
  let currentIntervalEnd: Date | null = null;

  // Find the boundary between past and current intervals
  for (const row of intervals) {
    const position = clock.getZonedPositionInTimeForInterval(row.zonedInterval, data.plantTimeZone);

    if (position === 'past') {
      // Track the start of the first past interval and end of the last past interval
      if (!pastIntervalsStart) {
        pastIntervalsStart = new Date(row.zonedInterval.start);
      }
      pastIntervalsEnd = new Date(row.zonedInterval.end);
    } else if (position === 'present') {
      // Track the current interval
      currentIntervalStart = new Date(row.zonedInterval.start);
      currentIntervalEnd = new Date(row.zonedInterval.end);
      // Once we find the current interval, we can stop (intervals are sorted)
      break;
    } else if (position === 'future') {
      // We've reached future intervals, stop processing
      break;
    }
  }

  // Add plot band for past intervals
  if (pastIntervalsStart && pastIntervalsEnd) {
    chart.xAxis[0].addPlotBand({
      id: plotBandId_PastTime,
      color: pastIntervalColor,
      zIndex: 3,
      from: pastIntervalsStart.getTime(),
      to: pastIntervalsEnd.getTime(),
    });
  }

  // Add plot band for current interval
  if (currentIntervalStart && currentIntervalEnd) {
    chart.xAxis[0].addPlotBand({
      id: plotBandId_CurrentInterval,
      color: currentIntervalColor,
      zIndex: 2,
      from: currentIntervalStart.getTime(),
      to: currentIntervalEnd.getTime(),
    });
  }
}
