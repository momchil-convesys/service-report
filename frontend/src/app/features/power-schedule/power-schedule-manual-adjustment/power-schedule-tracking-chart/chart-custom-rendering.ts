import { chartColors } from 'src/app/constants';

export function renderNulls(chart: Highcharts.Chart, targetSeries: Highcharts.Series[]) {
  let nullTexts: Highcharts.SVGElement[] = [];

  (chart as any).nullTexts?.forEach((x: Highcharts.SVGElement) => x.destroy());

  const now = Date.now();

  targetSeries.forEach((series: Highcharts.Series) => {
    if (series.visible && series.options.opacity !== 0) {
      series.points.forEach((point: any) => {
        if (point.y === null) {
          // Only render nulls for past points
          const customData = point.custom;
          const isPast = customData?.interval?.end?.getTime
            ? customData.interval.end.getTime() < now
            : false;

          if (!isPast) {
            return;
          }

          const text: Highcharts.SVGElement = chart.renderer
            .text(point.pointWidth < 40 ? '!' : 'N/A', -999, -999)
            .add();

          const x = chart.plotLeft + point.barX + point.pointWidth / 2 - text.getBBox().width / 2;

          // Render text only on plot area
          if (x > chart.plotLeft && x < chart.plotLeft + chart.plotWidth) {
            text.attr({
              x,
              y: chart.plotTop + chart.plotHeight - 8,
              zIndex: 3, // appear above plotband
              style:
                'color: rgb(0, 0, 0); font-size: 0.7em; font-weight: bold; fill: rgb(0, 0, 0);',
            });

            nullTexts.push(text);
          } else {
            text.destroy();
          }
        }
      });
    }
  });

  (chart as any).nullTexts = nullTexts;
}

export function renderInvalid(chart: Highcharts.Chart, targetSeries: Highcharts.Series[]) {
  let invalidMarkers: Highcharts.SVGElement[] = [];

  (chart as any).invalidMarkers?.forEach((marker: Highcharts.SVGElement) => marker.destroy());

  targetSeries.forEach((series: Highcharts.Series) => {
    if (series.visible) {
      series.points.forEach((point: any) => {
        if (point && point.y && point.y < 0) {
          const x = chart.plotLeft + point.barX + 1;
          const y = point.isNull ? 0 : chart.plotTop;
          const width = point.isNull ? 0 : point.pointWidth - 2;
          const height = point.isNull ? 0 : chart.plotHeight;

          const invalidMarker: Highcharts.SVGElement = chart.renderer
            .rect(x, y, width, height)
            .attr({
              fill: chartColors[5] + '22',
              zIndex: 2,
              opacity: 1,
            })
            .add();
          invalidMarkers.push(invalidMarker);
        }
      });
    }
  });

  (chart as any).invalidMarkers = invalidMarkers;
}
