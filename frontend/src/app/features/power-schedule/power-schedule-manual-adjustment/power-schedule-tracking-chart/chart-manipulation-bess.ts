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
import { renderNulls } from './chart-custom-rendering';

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
import { isBESSEnergyNull, updatePlotBandsForMissingData } from './chart-plotbands-missing-data';
import {
  seriesOptions_BESSDeviation,
  updateSeriesData_BESSDeviation,
} from './chart-series-bess-deviation';
import {
  seriesId_BESSCharged,
  seriesId_BESSDischarged,
  seriesOptions_BESSEnergy,
  updateSeriesData_BESSEnergy,
} from './chart-series-bess-energy';
import {
  seriesOptions_BESSSetpoints,
  updateSeriesData_BESSSetpoints,
} from './chart-series-bess-setpoints';
import {
  seriesOptions_SharedColumnHover,
  updateSeriesData_SharedColumnHover,
} from './chart-series-shared-column-hover';
import { tooltip } from './chart-tooltip';

export const chartOptions_BESS: Highcharts.Options = {
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
        const chargedSeries = seriesById(this, seriesId_BESSCharged);
        const dischargedSeries = seriesById(this, seriesId_BESSDischarged);

        const energySeries: Highcharts.Series[] = [];
        if (chargedSeries) energySeries.push(chargedSeries);
        if (dischargedSeries) energySeries.push(dischargedSeries);

        if (energySeries.length > 0) {
          renderNulls(this, energySeries);
        }
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
      tickPositions: [-15000, 0, 15000],
      min: -15000,
      max: 15000,
    },
    {
      // Y axis for hover overlay
      min: 0,
      max: fakeYAxisMaximum,
      tickAmount: 2,
      visible: false,
    },
  ],
  legend: {
    ...legendOptions,
    // align: 'right',
    // verticalAlign: 'top',
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

export function updateChartData_BESS(
  chart: Highcharts.Chart,
  data: PowerScheduleTracking | undefined,
  context: BaseChartContext | null,
  clock: ClockService,
) {
  if (!data || data.intervals.length === 0) {
    chart.series.forEach((s) => s.setData([], false, false));
    chart.zoomOut();

    return;
  }

  updateTimeZoneSettings(chart, data.timeZone, false);

  if (chart.series.length === 0) {
    addAllSeries_BESS(chart);
  }

  //----------------------------------------------------------------------------
  // Update data

  updateSeriesData_BESSEnergy(chart, data);
  updateSeriesData_BESSSetpoints(chart, data);
  updateSeriesData_BESSDeviation(chart, data);
  updateSeriesData_SharedColumnHover(chart, data);

  //----------------------------------------------------------------------------
  // Update plotbands for missing data in past periods

  updatePlotBandsForMissingData(chart, data, isBESSEnergyNull);

  //----------------------------------------------------------------------------

  // updateDatetimeAxisRange(chart, data.integrationPeriod, context, 0, false);

  if (chart.hoverPoints) {
    syncTooltipsOnDataUpdate(chart);
  }
}

function addAllSeries_BESS(chart: Highcharts.Chart) {
  // NOTE: series order is important for shared tooltip

  seriesOptions_SharedColumnHover.forEach((s) => chart.addSeries(s, false));
  seriesOptions_BESSEnergy.forEach((s) => chart.addSeries(s, false));
  seriesOptions_BESSDeviation.forEach((s) => chart.addSeries(s, false));
  seriesOptions_BESSSetpoints.forEach((s) => chart.addSeries(s, false));
}
