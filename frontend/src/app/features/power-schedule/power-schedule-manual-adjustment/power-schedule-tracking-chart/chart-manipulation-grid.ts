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
  legendOptions,
  responsiveOptions,
  useCrispPoints,
  yAxisLabelsWidth,
  yAxisOptions_Shared,
} from './chart-common';
import { updateExportingOptions } from './chart-exporting';
import { isGridEnergyNull, updatePlotBandsForMissingData } from './chart-plotbands-missing-data';
import {
  seriesOptions_GridDeviation,
  updateSeriesData_GridDeviation,
} from './chart-series-grid-deviation';
import {
  seriesId_GridExported,
  seriesId_GridImported,
  seriesOptions_GridEnergy,
  updateSeriesData_GridEnergy,
} from './chart-series-grid-energy';
import {
  seriesOptions_GridSetpoints,
  updateSeriesData_GridSetpoints,
} from './chart-series-grid-setpoints';
import {
  seriesOptions_SharedColumnHover,
  updateSeriesData_SharedColumnHover,
} from './chart-series-shared-column-hover';
import { tooltip } from './chart-tooltip';

export const chartOptions_Grid: Highcharts.Options = {
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
        const exportedSeries = seriesById(this, seriesId_GridExported);
        const importedSeries = seriesById(this, seriesId_GridImported);

        const energySeries: Highcharts.Series[] = [];
        if (exportedSeries) energySeries.push(exportedSeries);
        if (importedSeries) energySeries.push(importedSeries);

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
      scrollbar: {
        enabled: true,
        margin: 5,
        buttonsEnabled: true,
      },
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
      tickPositions: [-15000, 0, 15000, 30000],
      max: 30000,
      min: -15000,
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

export function updateChartData_Grid(
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
    addAllSeries_Grid(chart);
  }

  //----------------------------------------------------------------------------
  // Update data

  updateSeriesData_GridEnergy(chart, data);
  updateSeriesData_GridSetpoints(chart, data);
  updateSeriesData_GridDeviation(chart, data);
  updateSeriesData_SharedColumnHover(chart, data);

  //----------------------------------------------------------------------------
  // Update plotbands for missing data in past periods

  // Without the timeout, the plotbands are being animated in an undesirable way.
  // This happens only to this chart and not to the other two (pv and bess).
  setTimeout(() => {
    updatePlotBandsForMissingData(chart, data, isGridEnergyNull);
  }, 0);

  //----------------------------------------------------------------------------

  // updateDatetimeAxisRange(chart, data.integrationPeriod, context, 0, false);

  if (chart.hoverPoints) {
    syncTooltipsOnDataUpdate(chart);
  }
}

function addAllSeries_Grid(chart: Highcharts.Chart) {
  // NOTE: series order is important for shared tooltip

  seriesOptions_SharedColumnHover.forEach((s) => chart.addSeries(s, false));
  seriesOptions_GridEnergy.forEach((s) => chart.addSeries(s, false));
  seriesOptions_GridDeviation.forEach((s) => chart.addSeries(s, false));
  seriesOptions_GridSetpoints.forEach((s) => chart.addSeries(s, false));
}
