import Highcharts from '../../highcharts-global-config';

export function extendedOptions(options: Highcharts.Options) {
  return {
    ...options,
    plotOptions: {
      ...options.plotOptions,
      series: {
        ...options.plotOptions?.series,
        enableMouseTracking: true,
        stickyTracking: true,
        // point: {
        //   events: {
        //     mouseOver: function (e: any) {
        //       console.log('over       Point ', e);
        //     },
        //     mouseOut: function (e: any) {
        //       console.log('OUT        Point ');
        //     },
        //   },
        // },
        // events: {
        //   mouseOver: function (e: any) {
        //     console.log('overSeries ', e, e.point);
        //     onChartMouseEvent(e);
        //   },
        //   mouseOut: function (e: any) {
        //     console.log('outSeries');
        //     onChartMouseEvent(e);
        //   },
        // },
      },
    },
    xAxis: {
      ...options.xAxis,
      events: {
        setExtremes: onSyncExtremes,
      },
    },
  };
}

/**
 * Synchronize zooming through the setExtremes event handler.
 */
export const onSyncExtremes = (e: any) => {
  const thisChart: Highcharts.Chart = e.target;

  if (e.trigger !== 'syncExtremes') {
    // Prevent feedback loop
    const charts: Highcharts.Chart[] = Highcharts.charts.filter(
      (chart): chart is Highcharts.Chart =>
        chart !== undefined && chart?.options.chart?.className === 'wt-synced-chart',
    );
    charts.map((chart) => {
      if (chart !== thisChart && chart !== undefined) {
        if (chart.xAxis[0].setExtremes !== null) {
          // It is null while updating
          chart.xAxis[0].setExtremes(e.min, e.max, undefined, false, {
            trigger: 'syncExtremes',
          });
        }
      }
    });
  }
};

export const onMouseEvent = (e: any) => {
  const charts: Highcharts.Chart[] = Highcharts.charts.filter(
    (chart): chart is Highcharts.Chart =>
      chart !== undefined && chart?.options.chart?.className === 'wt-synced-chart',
  );

  if (e.type === 'mouseout') {
    charts.map((chart) => handleSyncedCursor(chart, undefined));
  } else {
    charts.map((chart) => {
      handleSyncedCursor(chart, chart.pointer.normalize(<PointerEvent>e));
    });
  }
};

export const onChartMouseEvent = (e: Highcharts.PointerEventObject) => {
  // const targetSeries = e.target as unknown as Highcharts.Series;
  // const thisChart: Highcharts.Chart = targetSeries.chart;
  // const charts: Highcharts.Chart[] = Highcharts.charts.filter(
  //   (chart): chart is Highcharts.Chart =>
  //     chart !== thisChart &&
  //     chart !== undefined &&
  //     chart?.options.chart?.className === 'wt-synced-chart'
  // );
  // console.log(charts.map((chart) => chart.container));
  // if (e.type === 'mouseOut') {
  //   charts.map((chart) => handleSyncedCursor(chart, undefined));
  // } else {
  //   charts.map((chart) => {
  //     console.log('HERE: ', e, chart.pointer.normalize(<PointerEvent>e));
  //     handleSyncedCursor(chart, chart.pointer.normalize(<PointerEvent>e));
  //   });
  // }
};

function handleSyncedCursor(
  chart: Highcharts.Chart,
  event: Highcharts.PointerEventObject | undefined,
) {
  const xAxis = chart.xAxis[0];

  chart.series.forEach((series) => {
    // series.points may be undefined if series are hidden
    series.points?.forEach((point) => {
      point.setState(undefined);
    });
  });

  if (event === undefined) {
    chart.tooltip.hide(0);
    xAxis.hideCrosshair();
    return;
  }

  // Fixes synchronisation between side by side positioned charts
  // event.chartX = event.offsetX;

  const points: Highcharts.Point[] = [];

  chart.series.forEach((series) => {
    if (series.visible && series.options.className !== 'navigator-series') {
      const point = series.searchPoint(event, true);
      if (point) {
        points.push(point);
        point.setState('hover');
        // point.highlight(event);
      }
    }
  });

  points.forEach((point) => xAxis.drawCrosshair(undefined, point));

  // This check is required. Otherwise and error is thrown when no data.
  if (points.length > 0) {
    // TODO: check if this is the target chart and do not update
    // if (chart !== thisChart && chart !== null) {
    chart.tooltip.refresh(points, undefined);
    // }
  }
}
