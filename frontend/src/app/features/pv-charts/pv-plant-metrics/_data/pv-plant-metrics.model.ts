/**
 * Models defined in this file are relevant for Solar plants only.
 *
 * Essential Metrics as a concept is an extention of Device Metrics,
 * where concrete parameters are explicitly defined and additional plant related data is included,
 * in order to be visualized in the Web App in a specific manner.
 */

import { PowerLimitDetails } from '../../../../data/models';
import {
  MasterGwScheduledPowerLimitDataPoint_ForDevice,
  MasterGwScheduledPowerLimitDataPoint_ForPlant,
} from '../../../power-limit-schedule/_data/dto';

export interface PlantPowerMetersData {
  timestamp: string;

  totalActivePower: number | null;
  totalDailyProduction: number | null;

  powerMetersData: Array<{
    id: string;
    activePower: number | null;
    dailyProduction: number | null;
  }>;
}

/**
 * PVEssentialMetricsPointBase is used for both Device and Plant essential metrics,
 * and is further extended with specific properties.
 */
export interface PVEssentialMetricsPointBase {
  timestamp: string; // ISO timestamp - time of measurement! TODO: TBD: in plant timezone?

  dailyProduction: number; // kWh - amount of energy produced for the current day
  activePower: number | null; // kW - current PV power indicator (Active/Actual/Real power)
  powerLimit?: PowerLimitDetails | null | undefined;

  /**
   * TODO: Check if this is needed.
   */
  controlledByExternalSystem?: boolean;

  /**
   * TODO: Add option for manually controlled power limit.
   */
}

export interface PVDeviceEssentialMetricsPoint extends PVEssentialMetricsPointBase {
  deviceId: string;
}

export interface PVPlantEssentialMetricsPoint extends PVEssentialMetricsPointBase {
  plantId: string;

  performanceRatio: number | null; // %
  performanceRatioAverage: number | null; // % average performanceRatio for the day

  radiation: number | null; // W/m2
  accumulatedRadiation: number | null; // kWh/m2
}

export interface PVPlantEssentialMetrics {
  /**
   * Contains sum of dailyProduction and activePower for all devices
   * plus plant related data (if defined in the model).
   *
   * PVPlantEssentialMetricsPoint should always be present,
   * as it is affected by any device essential metrics change.
   */
  plantEssentialMetrics: PVPlantEssentialMetricsPoint;

  /**
   * Should contain data for all devices on initial GET request!
   * Otherwise (on a WebSocket message) the array should contain
   * only devices with new data for any parameter of interest.
   */
  deviceEssentialMetrics: PVDeviceEssentialMetricsPoint[];

  plantScheduledLimitData: null | MasterGwScheduledPowerLimitDataPoint_ForPlant;

  deviceScheduledLimitDataPoints: null | MasterGwScheduledPowerLimitDataPoint_ForDevice[];

  powerMetersData: null | PlantPowerMetersData;

  // Populated at front end

  hasPermissionToSeeAllDetails: boolean;
}

/**
 * GET /pv-plant-metrics?plantId=${plantId}
 *
 * Returns object of type PVPlantMetrics with data for all devices
 *
 * Web Socket: /pv-plant-metrics/ws?plantId={plantId}
 *
 * Message is the same type (PVPlantMetrics),
 * but deviceEssentialMetrics optionally contains only devices
 * which have new values for the parameters of interest.
 */
