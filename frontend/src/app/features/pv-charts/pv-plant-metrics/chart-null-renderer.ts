export function renderNulls(chart: Highcharts.Chart) {
  //Destroy previously added nulls
  let nullLabels: Highcharts.SVGElement[] = (chart as any).nullLabels || [];
  nullLabels.forEach((element) => element.destroy());

  nullLabels = [];

  const categoryWidth = chart.plotWidth / chart.xAxis[0].categories.length;

  chart.series.forEach((series) => {
    series.points.forEach((point) => {
      // Check for timestamp as we have empty series as separators
      if (point.y === null && (point as any).custom?.timestamp) {
        const offset = point.x * categoryWidth + categoryWidth / 2;
        const text = chart.renderer.text('N/A', -999, -999).add();

        text.attr({
          x: chart.plotLeft + offset - text.getBBox().width / 2,
          y: chart.plotTop + chart.plotHeight - 8,
          zIndex: 3, // appear above plotband
          style: 'color: rgb(0, 0, 0); font-size: 0.7em; font-weight: bold; fill: rgb(0, 0, 0);',
        });

        nullLabels.push(text);
      }
    });
  });

  (chart as any).nullLabels = nullLabels;
}
