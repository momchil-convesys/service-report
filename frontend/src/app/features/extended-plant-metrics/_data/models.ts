import { IntegrationPeriod } from '../../../constants';

export interface PowerMeterLiveData {
  subLevelId: string;

  activePower_Generated: number | null; // kW
  activePower_Consumed: number | null; // kW

  reactivePower_Generated: number | null; // kVAR
  reactivePower_Consumed: number | null; // kVAR

  powerFactor: number | null; // E.g: -0.9959
}

export interface PowerMeterCounters {
  subLevelId: string;

  activeEnergy_Generated: number | null; // kWh
  activeEnergy_Consumed: number | null; // kWh

  reactiveEnergy_Generated: number | null; // kVARh
  reactiveEnergy_Consumed: number | null; // kVARh
}

export interface PlantMetricsCurrentValuesData {
  plantId: string;

  timestamp: Date;
  timestamp_Zoned: Date; // timestamp converted to plant time zone

  totalForPlant: PowerMeterLiveData | null;
  valuesPerSubLevel: PowerMeterLiveData[];

  allTime_totalForPlant: PowerMeterCounters | null;
  allTime_valuesPerSubLevel: PowerMeterCounters[];

  daily_totalForPlant: PowerMeterCounters | null;
  daily_valuesPerSubLevel: PowerMeterCounters[];
}

/**
 * -----------------------------------------------------------------------------
 * Cumulative data with integration period
 */
export interface PowerMetersCumulativeDataPoint {
  interval: {
    from: Date;
    to: Date;
  };

  energy_Generated: number | null; // kWh
  energy_Consumed: number | null; // kWh

  reactiveEnergy_Generated: number | null;
  reactiveEnergy_Consumed: number | null;

  calculated_reactiveEnergy_Generated: number | null;
  calculated_reactiveEnergy_Consumed: number | null;
}

export interface PowerMetersCumulativeData {
  plantId: string;

  timeRange: {
    from: Date;
    to: Date;
  };

  integrationPeriod: IntegrationPeriod;

  dataPoints: PowerMetersCumulativeDataPoint[];

  sum: PowerMetersCumulativeDataPointsSum;

  exportFileName: string;
  plantTimeZone: string | undefined;
}

/**
 * Calculated at front end to show totals/sum for selected period.
 */
export interface PowerMetersCumulativeDataPointsSum {
  energy_Generated: number | null; // kWh
  energy_Consumed: number | null; // kWh

  reactiveEnergy_Generated: number | null;
  reactiveEnergy_Consumed: number | null;

  calculated_reactiveEnergy_Generated: number | null;
  calculated_reactiveEnergy_Consumed: number | null;
}
