export function seriesById(
  chart: Highcharts.Chart,
  seriesId: string,
): Highcharts.Series | undefined {
  return chart.series.find((s) => s.options.id === seriesId);
}

export function seriesData(chart: Highcharts.Chart, seriesId: string): any[] {
  return (seriesById(chart, seriesId) as any)?.options?.data || [];
}

export function updateTimeZoneSettings(
  chart: Highcharts.Chart,
  timeZone: string | undefined,
  redraw: boolean,
) {
  chart.update(
    {
      time: {
        timezone: timeZone,
      },
    },
    redraw,
  );
}

// interface ExtendedAxis extends Highcharts.Axis {
//   dataMin: number;
//   dataMax: number;
// }

// const yAxisTickPositioner = function (this: Highcharts.Axis) {
//   const tsAxis: ExtendedAxis = this as ExtendedAxis;
//   var maxDeviation = Math.max(Math.abs(tsAxis.dataMax), Math.abs(tsAxis.dataMin)) * 1.2;
//   var halfMaxDeviation = maxDeviation / 2;

//   return [-maxDeviation, -halfMaxDeviation, 0, halfMaxDeviation, maxDeviation];
// };

export const yAxisZeroPlotLine: Highcharts.YAxisPlotLinesOptions = {
  color: '#d4dce3', // @gray-4
  width: 1,
  value: 0,
  zIndex: 2,
};

export const yAxisZeroPlotLineThick: Highcharts.YAxisPlotLinesOptions = {
  color: '#d4dce3', // @gray-4
  width: 2,
  value: 0,
  zIndex: 2,
};
