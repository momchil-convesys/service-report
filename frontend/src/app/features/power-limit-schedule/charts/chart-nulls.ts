export function renderNulls(chart: Highcharts.Chart) {
  let nullTexts: Highcharts.SVGElement[] = [];

  (chart as any).nullTexts?.forEach((x: Highcharts.SVGElement) => x.destroy());

  chart.series.forEach((series: Highcharts.Series) => {
    if (series.visible) {
      series.points.forEach((point: any) => {
        if (point.y === null) {
          const text: Highcharts.SVGElement = chart.renderer
            .text($localize`:@@noLimitShort:NL`, -999, -999)
            .add();

          text.attr({
            x: chart.plotLeft + point.plotX - text.getBBox().width / 2,
            y: chart.plotTop + chart.plotHeight - 8,
            zIndex: 3, // appear above plotband
            style: 'color: rgb(0, 0, 0); font-size: 0.7em; fill: rgb(0, 0, 0);',
          });

          nullTexts.push(text);
        }
      });
    }
  });

  (chart as any).nullTexts = nullTexts;
}
