import Highcharts from '../highcharts-global-config';

export const syncedChartsClassName = 'cms-onscreen-synced-chart';

// Augment types so TS knows about our custom option.
declare module 'highcharts' {
  interface Options {
    syncGroupName?: string;
  }
}

const getSyncGroup = (chart: Highcharts.Chart): string | undefined => chart.options?.syncGroupName;

const syncedCharts = (sourceChart: Highcharts.Chart) => {
  const group = getSyncGroup(sourceChart);

  return Highcharts.charts.filter(
    (chart): chart is Highcharts.Chart =>
      !!chart &&
      chart.options?.chart?.className === syncedChartsClassName &&
      getSyncGroup(chart) === group,
  );
};

/**
 * Synchronize zooming through the setExtremes event handler.
 */
export const xAxisEvents: Highcharts.XAxisEventsOptions = {
  setExtremes: function syncExtremes(e: Highcharts.AxisSetExtremesEventObject) {
    const thisChart = this.chart;

    if ((e as any).customTrigger !== 'syncExtremes') {
      syncedCharts(thisChart).forEach((chart) => {
        /**
         * Animation behaviour was inconsisten across target and synced charts,
         * so we take full control over setExtremes including for the target chart.
         */

        e.preventDefault();

        // Prevent feedback loop (or prevent event defaut action for this chart)
        // if (chart !== thisChart) {
        const xAxis = chart.xAxis[0];
        // It is null while updating
        if (xAxis.setExtremes !== null) {
          xAxis.setExtremes(e.min, e.max, undefined, false, {
            customTrigger: 'syncExtremes',
            trigger: e.trigger,
          });
        }
        // }

        if (e.min !== undefined || e.max !== undefined) {
          /**
           * showResetZoom() adds a new button on each call
           */
          if (!(chart as any).resetZoomButton) {
            chart.showResetZoom();
          }
          (chart as any).resetZoomButton?.show();
        } else {
          (chart as any).resetZoomButton?.hide();
        }
      });
    }
  },
};

/**
 * Synchronize tooltip and crosshair.
 */
export const syncedChartsSeriesPointEvents: Highcharts.PointEventsOptionsObject = {
  mouseOver: function () {
    const thisChart = this.series.chart;

    syncedCharts(thisChart).forEach((chart) => {
      if (chart !== thisChart) {
        const points: Highcharts.Point[] = [];

        chart.series.forEach((series) => {
          const point = series.points?.find((point) => point.x === this.x);
          // const isNavigatorPoint = point?.series?.name?.toLowerCase().includes('navigator');
          const isNavigatorPoint = (point?.series as any)?.baseSeries;
          if (point && point.series && point.series.visible && !isNavigatorPoint) {
            point.setState('hover');
            points.push(point);
          }
        });

        if (points.length) {
          chart.hoverPoints = points;
          chart.tooltip.refresh(points); // Show the tooltip
          chart.xAxis[0].drawCrosshair(undefined, points[0]); // Show the crosshair
        }
      }
    });
  },

  mouseOut: function () {
    const thisChart = this.series.chart;

    syncedCharts(thisChart).forEach((chart) => {
      if (chart !== thisChart) {
        chart.hoverPoints = [];
        chart.tooltip.hide();
        chart.xAxis[0].drawCrosshair(undefined, undefined); // Hide the crosshair

        chart.series.forEach((series) => {
          const point = series.points?.find((point) => point.x === this.x);
          if (point && point.series && point.series.visible) {
            point.setState('');
          }
        });
      }
    });
  },
};

/**
 * Synchronize tooltip and crosshair.
 */
export const syncedChartsSeriesPointEvents_NoHover: Highcharts.PointEventsOptionsObject = {
  mouseOver: function () {
    const thisChart = this.series.chart;

    syncedCharts(thisChart).forEach((chart) => {
      if (chart !== thisChart) {
        const points: Highcharts.Point[] = [];

        chart.series.forEach((series) => {
          const point = series.points?.find((point) => point.x === this.x);
          // const isNavigatorPoint = point?.series?.name?.toLowerCase().includes('navigator');
          const isNavigatorPoint = (point?.series as any)?.baseSeries;
          if (point && point.series && point.series.visible && !isNavigatorPoint) {
            point.setState('');
            points.push(point);
          }
        });

        if (points.length) {
          chart.hoverPoints = points;
          chart.tooltip.refresh(points); // Show the tooltip
          chart.xAxis[0].drawCrosshair(undefined, points[0]); // Show the crosshair
        }
      } else {
        chart.series.forEach((series) => {
          if (series !== this.series) {
            series.setState('');
          }
        });
      }
    });
  },

  mouseOut: function () {
    const thisChart = this.series.chart;

    syncedCharts(thisChart).forEach((chart) => {
      if (chart !== thisChart) {
        chart.hoverPoints = [];
        chart.tooltip.hide();
        chart.xAxis[0].drawCrosshair(undefined, undefined); // Hide the crosshair

        chart.series.forEach((series) => {
          const point = series.points?.find((point) => point.x === this.x);
          if (point && point.series && point.series.visible) {
            point.setState('');
          }
        });
      }
    });
  },
};

/**
 * Select only the point with equal series name.
 * Synchronize tooltip, crosshair ans series hover.
 */
export const syncedChartsSeriesPointEvents_SinglePoints: Highcharts.PointEventsOptionsObject = {
  mouseOver: function () {
    const thisChart = this.series.chart;
    const hoveredPoint: Highcharts.Point = this;

    syncedCharts(thisChart).forEach((chart) => {
      if (chart !== thisChart) {
        const points: Highcharts.Point[] = [];

        const sharedTooltip = chart.tooltip.options.shared;

        chart.series.forEach((series) => {
          if (!sharedTooltip) {
            series.setState('inactive');
          }

          if (series.name === hoveredPoint.series.name) {
            series.setState('hover');
          }

          if (series.name === hoveredPoint.series.name || sharedTooltip) {
            const point = series.points?.find((point) => point.x === hoveredPoint.x);
            // const isNavigatorPoint = point?.series?.name?.toLowerCase().includes('navigator');
            const isNavigatorPoint = (point?.series as any)?.baseSeries;
            if (point && point.series && point.series.visible && !isNavigatorPoint) {
              point.setState('hover');
              points.push(point);
            }
          }
        });

        if (points.length) {
          chart.hoverPoints = points;
          chart.tooltip.refresh(points); // Show the tooltip
          chart.xAxis[0].drawCrosshair(undefined, points[0]); // Show the crosshair
        }
      }
    });
  },

  mouseOut: function () {
    const thisChart = this.series.chart;
    const hoveredPoint: Highcharts.Point = this;

    syncedCharts(thisChart).forEach((chart) => {
      if (chart !== thisChart) {
        chart.tooltip.hide();
        chart.xAxis[0].drawCrosshair(undefined, undefined); // Hide the crosshair
        chart.hoverPoints = null;

        const sharedTooltip = chart.tooltip.options.shared;

        chart.series.forEach((series) => {
          series.setState('');

          if (series.name === hoveredPoint.series.name || sharedTooltip) {
            series.setState('');

            const point = series.points?.find((point) => point.x === hoveredPoint.x);
            if (point && point.series && point.series.visible) {
              point.setState('');
            }
          }
        });
      }
    });
  },
};

/**
 * Sync legend item click
 */
export const syncedChartsLegendItemClick: Highcharts.LegendItemClickCallbackFunction = function (
  event: Highcharts.LegendItemClickEventObject,
) {
  const thisChart = this.chart;

  syncedCharts(thisChart).forEach((chart) => {
    if (chart !== thisChart) {
      const wasVisible = (event.legendItem as any).visible;

      chart.series.forEach((series) => {
        if (series.name === (event.legendItem as any).name) {
          if (wasVisible) {
            series.hide();
          } else {
            series.show();
          }
        }
      });
    }
  });

  return;
};

export const syncTooltipsOnDataUpdate = (chart: Highcharts.Chart) => {
  const thisChart = chart;

  syncedCharts(thisChart).forEach((chart) => {
    if (chart !== thisChart && chart.hoverPoints && chart.hoverPoints.length > 0) {
      chart.tooltip.refresh(chart.hoverPoints);
    }
  });
};
