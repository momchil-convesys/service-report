// GET /pv-power-for-device?plantId=1&from=2023-07-05T00:00:00.000Z&to=....
//
// Query params:
// plantId
// from - ISO timestamp in plant time zone
// to - ISO timestamp in plant time zone
//
// Optional SSE
//
// Response:
// Object of type PVPowerDataForPlantDTO_NEW

import {
  MasterGwScheduledPowerLimitDataPoint_ForDevice,
  MasterGwScheduledPowerLimitDataPoint_ForPlant,
} from '../../../power-limit-schedule/_data/dto';

export interface PVPowerDataForPlantDTO_NEW {
  plantId: string;

  interval: {
    from: string; // ISO timestamp
    to: string; // ISO timestamp
  };

  calculatedProduction: number; // kWh
  calculatedProductionPM?: number; // kWh

  extraSeriesLabels: string[]; // Inverter labels ([ Inverter 1, Inverter 2...])

  dataPoints: {
    timestamp: string;

    activePower: number | null;
    activePowerPM?: number | null;

    extraSeriesValues: (number | null)[]; // Corresponding to extraSeriesLabels in the same order
  }[];

  scheduledPowerLimitDataPoints?: MasterGwScheduledPowerLimitDataPoint_ForPlant[];

  irradianceDataPoints?: {
    timestamp: string;

    irradiance: number | null; // W/m2 For plant only
  }[];
}

// GET /pv-power-for-device?deviceId=1&from=2023-07-05T00:00:00.000Z&to=....
//
// Query params:
// deviceId
//
// from - ISO timestamp in plant time zone
// to - ISO timestamp in plant time zone
//
// Optional SSE
//
// Response:
// Object of type PVPowerDataForDeviceDTO_NEW

export interface PVPowerDataForDeviceDTO_NEW {
  deviceId: string;

  interval: {
    from: string; // ISO timestamp
    to: string; // ISO timestamp
  };

  calculatedProduction: number; // kWh

  extraSeriesLabels: string[] | null | undefined; // [ Total PV (DC), PV Input 1, 2, 3... ]

  dataPoints: {
    timestamp: string;

    activePower: number;

    extraSeriesValues: (number | null)[]; // Corresponding to extraSeriesLabels in the same order
  }[];

  scheduledPowerLimitDataPoints?: MasterGwScheduledPowerLimitDataPoint_ForDevice[];

  irradianceDataPoints?: {
    timestamp: string;
    irradiance: number | null; // W/m2
  }[];
}
