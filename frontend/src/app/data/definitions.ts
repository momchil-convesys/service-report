/**
 * A time range (from / to) refers to a span of time between two points,
 * emphasizing the start and end times.
 * E.g: in a time picker to get or filter data.
 *
 * An interval (start / end) is a specific duration or gap between two time points,
 * emphasizing the precise measurement of that duration.
 * An interval is usually aligned with an integration period.
 * E.g: production data with integration period of 15 min will be represented
 * as an array of 15 min intervals.
 *
 * A time range can be divided into intervals (usually regular intervals).
 *
 * An integration period refers to the time span
 * over which data is collected, accumulated, or averaged.
 * E.g: day, hour, 15 min.
 *
 * Intervals can be defined in two ways depending on whether the end timestamp
 * is included in the interval or not.
 *
 * Inclusive End Time:
 * [
 *   { "start": "2024-10-23T08:00:00.000", "end": "2024-10-23T08:59:59.999" },
 *   { "start": "2024-10-23T09:00:00.000", "end": "2024-10-23T09:59:59.999" }
 * ]
 *
 * Exclusive End Time: (the preferred way)
 * [
 *   { "start": "2024-10-23T08:00:00", "end": "2024-10-23T09:00:00" },
 *   { "start": "2024-10-23T09:00:00", "end": "2024-10-23T10:00:00" }
 * ]
 */

export type ISO_Timestamp = string;

export interface TimeRange_DTO {
  from: ISO_Timestamp;
  to: ISO_Timestamp; // TBD: inclusive or not?
}

export interface Interval_DTO {
  start: ISO_Timestamp;
  end: ISO_Timestamp;
}

export interface BaseDataPoint_DTO {
  timestamp: ISO_Timestamp;
  // or
  interval: Interval_DTO;
}

interface HistoricalTimelineData_DTO {
  // TBD: When data is appended/replaced
  // Should this time range be the originally requested
  // or the time range of the last update?
  timeRange: TimeRange_DTO;

  dataPoints: BaseDataPoint_DTO[];
}

/**
 * These should probably be in groups according to their point of measurement.
 */
interface PlottableParameterDefinition_DTO {
  parameterDefinitionId: string;

  displayName: string;
  unit: string | null;

  dataType: 'momentary' | 'cumulative';

  description: string; // E.g: sum of all inverter powers in the selected scope
  // type: 'raw-parameter' | 'aggregated' | 'calculated';

  acceptableSeriesType: 'bar' | 'line';
  pointOfMeasurement: {
    type:
      | 'plant'
      | 'inverter'
      | 'transformer-station'
      | 'power-meter'
      | 'weather-station'
      | 'high-voltage'; // TBD
  };

  // will be used to calculate the number of points for a given period
  // without aggregation and restrict or show warning
  // in milliseconds
  // null if not applicable
  rawDataPointsFrequencyMs: number | null;
}

/**
 * Describe series of data. Will be configured by users in the future.
 */
export interface DataSeriesConfiguration_DTO {
  seriesConfigurationId: string;

  seriesDisplayName: string; // May default to parameter displayName + instance display name

  // Corresponding plottable parameter reference
  parameterDefinitionId: string;

  pointOfMeasurement: {
    instanceDisplayName: string; // E.g: TS 5, Inverter 16, PM 2
  };

  // Usually depending on parameter dataType
  // TODO: consider adding 'range' type. E.g: for temperature min/max
  type: 'bar' | 'line' | 'column';

  unit: string | null;

  integrationPeriodInSeconds: number;

  // TODO: maybe this should be the same for all series in a chart?
  dataAggregation: null | {
    // TBD: Granularity vs. integration period vs aggregation period
    integrationPeriod: {
      value: number;
      unit: 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year';
    };

    // Probably applicable for momentary data type
    aggregationOptions: {
      approximation: 'sum' | 'average' | 'min' | 'max' | 'open' | 'close';
      nullValuesTresholdPercentage: number;
    };
  };

  visibleByDefault: boolean;
}

interface DataViewConfiguration_DTO {
  // or DataRequestConfiguration_DTO
  type: 'historical-timeline' | 'historical-snapshot'; // TODO: add other types

  timeRangeSelectorDefaults: {
    preselectedRangeType: 'day' | 'week' | 'month' | 'year' | 'custom-range'; // TBD: custom range?

    // This could be a property of the widget that will contain a specific data view
    preselectedRelativeDate: 'currentDay' | 'currentWeek' | 'previousDay' | 'previousWeek';

    // TBD: maybe add multiple granularityPredefined values
    // which will be shown as available options
    // and can be switched later in the rendered view;
    // this would correspond to multiple data view in the backend?
    granularityPredefined: PredefinedAggregationPeriod | null; // null for raw data, not aggregated

    // Using only predefined granularities will allow reusing data views at backend.
    // granularity: {
    //   value: number;
    //   unit: 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year';
    // };
  };

  dataSeriesConfigurations: DataSeriesConfiguration_DTO[];

  // Maybe should depend on series;
  // Auto scale depending on key series vs. fixed unit (E.g: MWh independent of data)
  yAxesConfigurations: [
    {
      min: number;
      max: number;
      unit: string;
      position: 'left' | 'right';
    },
  ];
}

export type PredefinedAggregationPeriod =
  | '1sec'
  | '5sec'
  | '15sec'
  | '30sec'
  | '1min'
  | '5min'
  | '15min'
  | '30min'
  | '1h'
  | '3h'
  | '1d'
  | '1w' // Calendar week
  | '1m' // Calendar month
  | '1y'; // Calendar year
