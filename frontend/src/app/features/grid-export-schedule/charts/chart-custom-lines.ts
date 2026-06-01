//----------------------------------------------------------------------------
// Render full width line for each point

import { seriesById } from '../../../helpers';

export function renderCustomLines(chart: Highcharts.Chart, color: string, seriesId: string) {
  const series = seriesById(chart, seriesId);

  const points = series?.points || [];
  const pointWidth = points.length > 1 ? (points[1].plotX || 0) - (points[0].plotX || 0) : 0;

  let pointLines: Highcharts.SVGElement[] = [];

  (chart as any).pointLines?.forEach((x: Highcharts.SVGElement) => x.destroy());

  series?.points?.forEach(function (point: any) {
    const isVisible = !point.isNull;
    const topBarLine: Highcharts.SVGElement = constructLineElement(
      chart,
      point,
      1,
      pointWidth,
      isVisible,
      color,
    );

    pointLines.push(topBarLine);
  });

  (chart as any).pointLines = pointLines;
}

function constructLineElement(
  chart: Highcharts.Chart,
  point: any,
  lineThinkness: number,
  pointWidth: number,
  visible: boolean,
  color: string,
): Highcharts.SVGElement {
  const x = chart.plotLeft + point.plotX - pointWidth / 2;
  const y = point.isNull ? 0 : chart.plotTop + point.plotY - lineThinkness / 2;
  const width = point.isNull ? 0 : pointWidth;
  const height = point.isNull ? 0 : lineThinkness;

  const pointLine: Highcharts.SVGElement = chart.renderer
    .rect(x, y, width, height)
    .attr({
      fill: color,
      zIndex: 2,
    })
    .add();

  if (visible) {
    pointLine.attr({ x, y, width, height });
  } else {
    pointLine.attr({ width: 0 });
  }

  return pointLine;
}
