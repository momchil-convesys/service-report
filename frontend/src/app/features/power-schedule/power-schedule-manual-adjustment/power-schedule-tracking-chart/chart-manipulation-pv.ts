import { ClockService } from 'src/app/data/services/clock.service';
import { selectionEventHandler } from 'src/app/features/pv-charts/_shared/pv-charts-column-datetime-axis';
import { seriesById, updateTimeZoneSettings } from 'src/app/helpers';
import {
  syncedChartsClassName,
  syncTooltipsOnDataUpdate,
  xAxisEvents,
} from 'src/app/helpers/_charts-sync';
import { BaseChartContext } from 'src/app/shared/base-chart-component/base-chart-component.component';
import { PowerScheduleTracking } from '../_data/power-schedule-tracking.model';
import { renderInvalid, renderNulls } from './chart-custom-rendering';

import Highcharts, { fullPointWidthCrosshairClassName } from 'src/app/highcharts-global-config';

import { ONE_HOUR } from '../../../../constants';
import {
  columnLikeSeries_SharedOptions,
  fakeYAxisMaximum,
  hiddenScrollbarOptions,
  legendOptions,
  responsiveOptions,
  useCrispPoints,
  yAxisLabelsWidth,
  yAxisOptions_Shared,
} from './chart-common';
import { updateExportingOptions } from './chart-exporting';
import { isPVProductionNull, updatePlotBandsForMissingData } from './chart-plotbands-missing-data';
import {
  seriesOptions_PVDeviation,
  updateSeriesData_PVDeviation,
} from './chart-series-pv-deviation';
import {
  seriesId_PVProduction,
  seriesOptions_PVProduction,
  updateSeriesData_PVProduction,
} from './chart-series-pv-production';
import {
  seriesOptions_PVSetpoints,
  updateSeriesData_PVSetpoints,
} from './chart-series-pv-setpoints';
import {
  seriesOptions_ScheduleStatus,
  updateSeriesData_ScheduleStatus,
} from './chart-series-schedule-status';
import {
  seriesOptions_SharedColumnHover,
  updateSeriesData_SharedColumnHover,
} from './chart-series-shared-column-hover';
import { tooltip } from './chart-tooltip';

export const chartOptions_PV: Highcharts.Options = {
  chart: {
    className: syncedChartsClassName,
    zooming: {
      type: 'x',
      mouseWheel: false,
    },

    // One pixel left spacing, otherwise the scrollbar button border is clipped
    spacing: [8, 0, 8, 1],
    marginRight: yAxisLabelsWidth,
    alignTicks: false,

    events: {
      render: function () {
        const productionSeries = seriesById(this, seriesId_PVProduction);
        if (!productionSeries) {
          return;
        }

        renderNulls(this, [productionSeries]);
        renderInvalid(this, [productionSeries]);
      },
      selection: function (event: Highcharts.SelectEventObject) {
        return selectionEventHandler(this, event);
      },
    },
  },

  xAxis: [
    {
      type: 'datetime',
      crosshair: {
        className: fullPointWidthCrosshairClassName,
      },
      scrollbar: hiddenScrollbarOptions,
      minRange: ONE_HOUR,

      showFirstLabel: true,
      showLastLabel: false,
      startOnTick: true,
      endOnTick: true,
      minPadding: 0,
      maxPadding: 0,

      dateTimeLabelFormats: {
        month: '%b', // default: '%b \'%y'
      },

      events: xAxisEvents,

      gridLineWidth: 1,
      gridLineColor: '#EDF0F3', // @border-color-base,
      gridZIndex: 3,

      minorGridLineWidth: 1,
      minorGridLineColor: '#EDF0F3', // @border-color-base,

      minorTickInterval: ONE_HOUR,
    },
  ],
  yAxis: [
    {
      ...yAxisOptions_Shared,
      tickPositions: [0, 15000, 30000],
      max: 30000,
      min: 0,
    },
    {
      // Y axis for schedule status and hover overlay
      min: 0,
      max: fakeYAxisMaximum,
      tickAmount: 2,
      visible: false,
    },
  ],
  legend: {
    ...legendOptions,
  },
  tooltip: tooltip,
  plotOptions: {
    column: columnLikeSeries_SharedOptions,
    columnrange: columnLikeSeries_SharedOptions,
    series: {
      getExtremesFromAll: true,
      crisp: useCrispPoints,
    },
  },
  responsive: responsiveOptions,
};

export function updateChartData_PV(
  chart: Highcharts.Chart,
  data: PowerScheduleTracking | undefined,
  context: BaseChartContext | null,
  clock: ClockService,
) {
  updateExportingOptions(chart, data, context);

  if (!data || data.intervals.length === 0) {
    chart.series.forEach((s) => s.setData([], false, false));
    chart.zoomOut();

    return;
  }

  updateTimeZoneSettings(chart, data.timeZone, false);

  if (chart.series.length === 0) {
    addAllSeries_PV(chart);
  }

  //----------------------------------------------------------------------------
  // Update data

  updateSeriesData_PVProduction(chart, data);
  updateSeriesData_PVSetpoints(chart, data);
  updateSeriesData_PVDeviation(chart, data);
  updateSeriesData_SharedColumnHover(chart, data);
  updateSeriesData_ScheduleStatus(chart, data);

  //----------------------------------------------------------------------------
  // Update plotbands for missing data in past periods

  updatePlotBandsForMissingData(chart, data, isPVProductionNull);

  //----------------------------------------------------------------------------

  // updateDatetimeAxisRange(chart, data.integrationPeriod, context, 0, false);

  if (chart.hoverPoints) {
    syncTooltipsOnDataUpdate(chart);
  }
}

function addAllSeries_PV(chart: Highcharts.Chart) {
  // NOTE: series order is important for shared tooltip

  seriesOptions_SharedColumnHover.forEach((s) => chart.addSeries(s, false));
  seriesOptions_PVProduction.forEach((s) => chart.addSeries(s, false));
  seriesOptions_PVDeviation.forEach((s) => chart.addSeries(s, false));
  seriesOptions_PVSetpoints.forEach((s) => chart.addSeries(s, false));
  seriesOptions_ScheduleStatus.forEach((s) => chart.addSeries(s, false));
}
