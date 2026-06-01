import { ActivePowerLimitScheduleDTO } from '../../../features/power-limit-schedule/_data/active-schedule';
import {
  MasterGwScheduledPowerLimitDataPoint_ForDevice,
  MasterGwScheduledPowerLimitDataPoint_ForPlant,
} from '../../../features/power-limit-schedule/_data/dto';

export const mockSchedule1: ActivePowerLimitScheduleDTO = {
  id: '1',

  timestamp: new Date().toISOString(),

  complianceStatus: 'compliant',
  nonComplianceReason: null,

  currentRecord: null,

  fileRefId: '64166',
};

export const mockSchedule2: ActivePowerLimitScheduleDTO = {
  id: '2',

  timestamp: new Date().toISOString(),

  complianceStatus: 'non-compliant',
  nonComplianceReason: 'Example reason: GW is not responding to commands.',

  currentRecord: null,

  fileRefId: '42487',
};

export const mockSchedule3: ActivePowerLimitScheduleDTO = {
  id: '3',

  timestamp: new Date().toISOString(),

  complianceStatus: 'non-compliant',
  nonComplianceReason: 'Doeant matter! It will in the future!',

  currentRecord: null,

  fileRefId: '42487',
};

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
