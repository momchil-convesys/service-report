export interface MomentaryDataChartRequest {
  bessId: string;
  parameterKeys: string[];
  assetIds: string[];
  chartConfiguration: Highcharts.Options;
  columnClickHandler?: (assetId: string) => void;
}
