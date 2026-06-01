import { yAxisFormatter_ScaleValue_v2, yAxisZeroPlotLineThick } from '../../../../helpers';

export const yAxisOptions: Highcharts.YAxisOptions[] = [
  {
    title: {
      text: undefined,
    },
    labels: {
      formatter: function (context) {
        const value = this.value as number;
        const incluedeUnit = value === 0;

        let maxFromAllSeries = 0;
        this.chart.series.forEach((series) => {
          maxFromAllSeries = Math.max(
            maxFromAllSeries,
            series.dataMax ?? 0,
            Math.abs(series.dataMin ?? 0),
          );
        });

        return yAxisFormatter_ScaleValue_v2(context, 'W', maxFromAllSeries, incluedeUnit);
      },
    },
    opposite: true,
    plotLines: [yAxisZeroPlotLineThick],
  },
  {
    title: {
      text: undefined,
    },
    labels: {
      formatter: function (context) {
        const value = this.value as number;
        const incluedeUnit = value === 0;

        let maxFromAllSeries = 0;
        this.chart.series.forEach((series) => {
          maxFromAllSeries = Math.max(
            maxFromAllSeries,
            series.dataMax ?? 0,
            Math.abs(series.dataMin ?? 0),
          );
        });

        return yAxisFormatter_ScaleValue_v2(context, 'Wh', maxFromAllSeries, incluedeUnit);
      },
    },
    opposite: false,
    visible: false,
  },
];
