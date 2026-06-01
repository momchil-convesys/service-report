import {
  MasterGwScheduledPowerLimitDataPoint_ForDevice,
  MasterGwScheduledPowerLimitDataPoint_ForPlant,
} from '../../_data/dto';

export interface MasterGwScheduledPowerLimitHistoricalData {
  plantId: string;

  interval: {
    from: string; // ISO timestamp
    to: string; // ISO timestamp
  };

  dataPoints: {
    plantPoint: MasterGwScheduledPowerLimitDataPoint_ForPlant;
    devicesPoints: MasterGwScheduledPowerLimitDataPoint_ForDevice[];
  }[];
}
