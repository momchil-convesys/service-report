import { PredefinedAggregationPeriod } from '../../../data/definitions';

export interface DataSeriesConfiguration {
  seriesConfigurationId: string;

  seriesDisplayName: string; // May default to parameter displayName + instance display name

  // Corresponding plottable parameter reference
  parameterDefinitionId: string;

  pointOfMeasurement: {
    instanceDisplayName: string; // E.g: TS 5, Inverter 16, PM 2
  };

  type: 'bar' | 'line';

  unit: string | null;

  aggregationPeriodInSeconds: number;
  predefinedAggregationPeriod: PredefinedAggregationPeriod;
}

export interface CustomDataViewConfig {
  id: string;

  name: string;
  description: string;

  dataSeriesConfigurations: DataSeriesConfiguration[];

  chartOptions: Highcharts.Options | undefined;
}
