import {
  MasterGwScheduledPowerLimitDataPoint_ForDevice,
  MasterGwScheduledPowerLimitDataPoint_ForPlant,
} from '../../../power-limit-schedule/_data/dto';

export interface PVPowerDataForPlant_NEW {
  plantId: string;

  interval: {
    from: Date;
    to: Date;
  };

  calculatedProduction: number; // kWh

  extraSeriesLabels: string[]; // Inverter labels ([ Inverter 1, Inverter 2...])

  dataPoints: {
    timestamp: Date;

    activePower: number | null;
    activePowerPM?: number | null;

    extraSeriesValues: (number | null)[]; // Corresponding to extraSeriesLabels in the same order
  }[];

  scheduledPowerLimitDataPoints: MasterGwScheduledPowerLimitDataPoint_ForPlant[];
  scheduledPowerLimitDataPoints_Adjusted: MasterGwScheduledPowerLimitDataPoint_ForPlant[];

  irradianceDataPoints: {
    timestamp: Date;

    irradiance: number | null; // W/m2 For plant only
  }[];

  // Populated at front end

  exportFileName: string;
  showOriginalLimitData: boolean;
}

export interface PVPowerDataForDevice_NEW {
  deviceId: string;

  interval: {
    from: Date;
    to: Date;
  };

  calculatedProduction: number; // kWh

  extraSeriesLabels: string[]; // [ Total PV (DC), PV Input 1, 2, 3... ]

  dataPoints: {
    timestamp: Date;

    activePower: number | null;

    extraSeriesValues: (number | null)[]; // Corresponding to extraSeriesLabels in the same order
  }[];

  scheduledPowerLimitDataPoints: MasterGwScheduledPowerLimitDataPoint_ForDevice[];

  irradianceDataPoints: {
    timestamp: Date;
    irradiance: number | null; // W/m2
  }[];

  // Populated at front end

  maxPowerValue: number | undefined | null;
  exportFileName: string;
  plantId: string;
}
