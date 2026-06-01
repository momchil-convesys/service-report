export function getMaxValueFromAllSeries(chart: Highcharts.Chart): number | undefined {
  return (
    chart.series.reduce((max, series) => {
      return Math.max(max, series.dataMax === undefined ? 0 : series.dataMax);
    }, 0) || undefined
  );
}
