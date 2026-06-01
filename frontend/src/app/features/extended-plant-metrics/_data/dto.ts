/**
 * -----------------------------------------------------------------------------
 * Momentary data - current values.
 * Will be served over SSE with DATA_REPLACE.
 */

import { IntegrationPeriod } from '../../../constants';

/**
 * Level of measurement:
 *    Power meters
 *    High Voltage (Switchgears ???)
 *    Medium Voltage (Switchgears ???)
 *    Transformer Stations
 */

/**
 * Used in request as query parameter
 */
export enum LevelOfMeasurement {
  PowerMeters = 'powerMeters',
  HighVoltage = 'highVoltage',
  MediumVoltage = 'mediumVoltage',
  TransformerStations = 'transformerStations',
}

export const routeSegmentForLevelOfMeasurement: Record<LevelOfMeasurement, string> = {
  [LevelOfMeasurement.PowerMeters]: 'power-meters',
  [LevelOfMeasurement.HighVoltage]: 'high-voltage',
  [LevelOfMeasurement.MediumVoltage]: 'medium-voltage',
  [LevelOfMeasurement.TransformerStations]: 'transformer-stations',
};

export const levelOfMeasurementForRouteSegment: Record<string, LevelOfMeasurement> = {
  'power-meters': LevelOfMeasurement.PowerMeters,
  'high-voltage': LevelOfMeasurement.HighVoltage,
  'medium-voltage': LevelOfMeasurement.MediumVoltage,
  'transformer-stations': LevelOfMeasurement.TransformerStations,
};

/**
 * Generic:
 *
 * Main level
 *    Sub level 1
 *    Sub level 2
 *    Sub level N
 *
 *
 * CASE 1 (Tab Reactive Power):
 *
 * Main level   -> Plant
 * Sub levels   -> Power meters
 *
 *
 * CASE 2 (Tab High Voltage):
 *
 * Main level   -> High Voltage (total of all switchgears)
 * Sub levels   -> Switchgears
 *
 *
 * CASE 3 (Tab Medium Voltage):
 *
 * Main level   -> Medium Voltage (total of all switchgears)
 * Sub levels   -> Switchgears
 *
 *
 * CASE 4 (Tab Transformer Stations):
 *
 * Main level   -> Plant ???
 * Sub levels   -> Transformer Stations (TS1, TS2, ...)
 *
 */

export interface PlantMetricsLiveData_DTO {
  subLevelId: string; // ID of either power meter or switchgear or transformer station

  activePower_Generated: number | null; // kW
  activePower_Consumed: number | null; // kW

  reactivePower_Generated: number | null; // kVAR
  reactivePower_Consumed: number | null; // kVAR

  powerFactor: number | null; // E.g: -0.9959
}

export interface PlantMetricsCounters_DTO {
  subLevelId: string; // ID of either power meter or switchgear or transformer station

  activeEnergy_Generated: number | null; // kWh
  activeEnergy_Consumed: number | null; // kWh

  reactiveEnergy_Generated: number | null; // kVARh
  reactiveEnergy_Consumed: number | null; // kVARh
}

export interface PlantMetricsCurrentValuesData_DTO {
  plantId: string;

  /**
   * Time of measure.
   */
  timestamp: string;

  /**
   * Null if there is a communication problem.
   * Summed values from all power meters otherwise.
   */
  totalForPlant: PlantMetricsLiveData_DTO | null;

  /**
   * Empty array if the plant has only one power meter.
   * Array of objects otherwise.
   */
  valuesPerSubLevel?: PlantMetricsLiveData_DTO[];

  /**
   * Counters (accumulate energy)
   *
   *    allTime_... since the very beginning (the big bang!)
   *    daily_... since midnight
   */

  allTime_totalForPlant: PlantMetricsCounters_DTO | null;
  allTime_valuesPerSubLevel?: PlantMetricsCounters_DTO[];

  daily_totalForPlant: PlantMetricsCounters_DTO | null;
  daily_valuesPerSubLevel?: PlantMetricsCounters_DTO[];
}

/**
 * GET /extended-plant-metrics-current-values ? plantId=1234 & sse=true & levelOfMeasurement = LevelOfMeasurement
 *
 * Response: Object of type PlantMetricsCurrentValuesData_DTO
 *
 * Data is replaced via DATA_REPLACE as frequent as possible (every second or so).
 */

/**
 * -----------------------------------------------------------------------------
 * Cumulative data with integration period
 */

export interface PowerMetersCumulativeData_DTO {
  plantId: string;

  timeRange: {
    from: string;
    to: string;
  };

  integrationPeriod: IntegrationPeriod;

  dataPoints: {
    interval: {
      from: string;
      to: string;
    };

    energy_Generated: number | null; // kWh (represents energy production from PV)
    energy_Consumed: number | null; // kWh

    reactiveEnergy_Generated: number | null;
    reactiveEnergy_Consumed: number | null;

    calculated_reactiveEnergy_Generated: number | null;
    calculated_reactiveEnergy_Consumed: number | null;
  }[];
}

/**
 * GET /extended-plant-metrics-historical-data
 *      ? plantId=1234
 *      & sse=true
 *      & from
 *      & to
 *      & integradionPeriod
 *      & levelOfMeasurement
 *      & subLevelId (optional)
 */

//==============================================================================

/**
 * Plant metrics metadata (hierarhical structure, levels of measurement)
 *
 * GET /extended-plant-metrics-metadata ? plantId=1234
 */

export interface PlantMetricsMetadata_DTO {
  plantId: string;

  /**
   * null if level of measurement is not available
   */

  powerMetersLevel: LevelOfMeasurementMetadata_DTO | null;
  highVoltageLevel: LevelOfMeasurementMetadata_DTO | null;
  mediumVoltageLevel: LevelOfMeasurementMetadata_DTO | null;
  transformerStationsLevel: LevelOfMeasurementMetadata_DTO | null;
}

export interface LevelOfMeasurementMetadata_DTO {
  levelOfMeasurement: LevelOfMeasurement;

  /**
   * Sub levels will be shown in the UI according to the order in this array.
   * If the array is empty or null, sub levels will not be shown.
   */
  subLevels?: Array<{
    subLevelId: string;
    name: string;
  }> | null;
}
