import { PredefinedTimeRange } from '../../../constants';
import {
  EnergyTrendDataDTO,
  HybridInverterCurrentDataDTO,
  HybridInverterDataPointDTO,
  HybridInverterHistoricalDataDTO,
} from './dtos';

export interface MonbatBattery {
  id: string; // E.g: "0"
  displayName: string; // E.g: "B1"

  temperature: number | null;
  voltage: number | null;
  soc: number | null;
}

export interface MonbatBatteryString {
  id: string; // E.g: "1"
  displayName: string; // "String 1"

  timestamp: string;
  electricCurrent: number | null;

  batteries: MonbatBattery[];

  index: string; // for internal use
}

export interface MonbatBatteryHistoricalDataPoint {
  timestamp: string; // time of measument

  temperature: number | null;
  voltage: number | null;
  soc: number | null;

  electricCurrent: number | null;
}

export interface MonbatBatteryHistoricalData {
  deviceId: string; // Front end model
  batteryId: string;
  batteryDisplayName: string;

  from: string; // timestamp
  to: string; // timestamp

  /**
   * Minimum time span duration for a drill down.
   * Should be set to zero if all data points are present and no data points are available for futher drill down.
   *
   * E.g: detailedDataTresholdSeconds = 86400 seconds (1 day)
   * would mean that more data points are present and can be obtained with a new request,
   * where the requested time span duration in seconds is less than 86400 (timestamp "to" minus "from" in seconds)
   */
  detailedDataTresholdSeconds?: number;

  dataPoints: MonbatBatteryHistoricalDataPoint[];

  requestedTimerange?: PredefinedTimeRange | Date[];
  exportFileName?: string;
  timeZone?: string;
}

export interface MinMax {
  minTemperatureBatt: MonbatBattery | null;
  maxTemperatureBatt: MonbatBattery | null;

  minVoltageBatt: MonbatBattery | null;
  maxVoltageBatt: MonbatBattery | null;
}

/**
 * ----------------------------------------------------------------------------
 * Charts data
 */

export type HybridInverterDataPoint = Omit<HybridInverterDataPointDTO, 'timestamp'> & {
  timestamp: Date;
};

export interface EnergyTrendDataPoint {
  timestamp: Date; // parsed
  pvOutput: number | null;
  mainsPower: number | null;
  consumptionPower: number | null;
  feedInPower: number | null;
  batteryPower: number | null;
}

export type HybridInverterHistoricalData = Omit<HybridInverterHistoricalDataDTO, 'dataPoints'> & {
  dataPoints: Array<HybridInverterDataPoint>;

  // Populated at front end
  exportFileName?: string;
};

export type HybridInverterCurrentData = Omit<
  HybridInverterCurrentDataDTO,
  'timestamp' | 'dataPoint'
> & {
  timestamp: Date;
  dataPoint: HybridInverterDataPoint;
};

export type EnergyTrendData = Omit<EnergyTrendDataDTO, 'dataPoints'> & {
  dataPoints: EnergyTrendDataPoint[];
  exportFileName?: string;
};
