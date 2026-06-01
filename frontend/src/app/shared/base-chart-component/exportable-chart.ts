export abstract class ExportableChart {
  abstract getChartInstance(): Highcharts.Chart | undefined;
}
