import { plotBandId, plotLineId } from './chart-constants';

export function updatePlotLinesAndBands(
  chart: Highcharts.Chart,
  deviceColumnsCount: number,
  extraColumnsCount: number,
) {
  chart.xAxis[0].removePlotLine(plotLineId);
  chart.xAxis[0].removePlotBand(plotBandId);

  if (deviceColumnsCount !== 0) {
    chart.xAxis[0].addPlotLine({
      id: plotLineId,
      color: '#EDF0F3',
      value: deviceColumnsCount - 0.1,
      width: 1,
      zIndex: 3,
    });
  }

  if (deviceColumnsCount !== 0 && extraColumnsCount !== 0) {
    chart.xAxis[0].addPlotBand({
      id: plotBandId,
      color: '#ffffff',
      from: deviceColumnsCount - 0.1,
      to: deviceColumnsCount + extraColumnsCount + 0.1,
      zIndex: 2,
    });
  }
}
