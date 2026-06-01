import { yAxisFormatter_ScaleValue_v2, yAxisZeroPlotLineThick } from '../../../../helpers';

export const defaultYAxisId = 'defaultYAxisId';

export const yAxisOptions: Highcharts.YAxisOptions[] = [];

export function initializeYAxis(chart: Highcharts.Chart) {
  if (chart.yAxis.length > 0) {
    return;
  }

  // All series use kWh unit
  const yAxis: Highcharts.YAxisOptions = {
    id: defaultYAxisId,
    title: {
      text: undefined,
    },
    labels: {
      formatter: function (context) {
        const value = this.value as number;
        const incluedeUnit = value === 0;

        let maxFromAllSeries = 0;
        chart.series.forEach((series) => {
          maxFromAllSeries = Math.max(maxFromAllSeries, series.dataMax ?? 0, Math.abs(series.dataMin ?? 0));
        });
        
        return yAxisFormatter_ScaleValue_v2(context, 'Wh', maxFromAllSeries, incluedeUnit);
      },
    },
    opposite: true,
    plotLines: [yAxisZeroPlotLineThick],
    tickAmount: 4,
  };

  chart.addAxis(yAxis, false, false);
}
