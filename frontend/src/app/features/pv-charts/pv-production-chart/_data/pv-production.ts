import { IntegrationPeriod, PowerLimitScheduleStatus } from '../../../../constants';
import { DatetimeRangeModel } from '../../../../shared/datetime-range-select/models';

export interface ScheduleStatusHistory_DataPoint {
  timestamp: Date;
  timestampEnd: Date;

  statusChangedTo: PowerLimitScheduleStatus;
  by: string;

  fileRefId: string;
}

export interface ControlledByExternalSystemHistory_DataPoint {
  timestamp: Date;
  timestampEnd: Date;

  controlledByExternalSystem: boolean;
}

export interface ControlledManuallyHistory_DataPoint {
  timestamp: Date;
  timestampEnd: Date;

  controlledManually: boolean;
  byUserDisplayName: string | null;
}

export interface EnergyProduction_DataPoint {
  value: null | number;
  value_Mega: null | number;

  applicableRange: {
    from: Date;
    to: Date;
  };
}

// Precalculated values
// (conversion kWh -> MWh / kW -> MW and adjustment based on coefficient)
export interface TargetLimit_PreCalc {
  value: null | number;
  valueAdjusted: null | number;

  value_Mega: null | number;
  valueAdjusted_Mega: null | number;
}

export interface TargetLimit_DataPoint {
  targetLimit: TargetLimit_PreCalc;
  targetLimitOriginal: TargetLimit_PreCalc;

  applicableRange: {
    from: Date;
    to: Date;
  };

  fileRefId: string;

  scheduleStatus: PowerLimitScheduleStatus | undefined;

  // Null if not applicable (when limit type is 'energy').
  // Precalculated value in MWh when limit type is 'power'.
  energyLimitEquivalent: null | {
    targetLimit: TargetLimit_PreCalc;
    targetLimitOriginal: TargetLimit_PreCalc;
  };
}

export interface PVProductionData {
  from: Date;
  to: Date;

  deviceIds: string[];
  integrationPeriod: IntegrationPeriod;

  totalProduction: null | number; // Total production for selected period
  totalProductionPM: null | number; // Total production from Power Meter

  productionDataPoints: Array<EnergyProduction_DataPoint>;

  targetPowerLimitData?: null | Array<TargetLimit_DataPoint>;

  scheduleStatusHistory?: null | Array<ScheduleStatusHistory_DataPoint>;

  controlledByExternalSystemHistory?: null | Array<ControlledByExternalSystemHistory_DataPoint>;

  controlledManuallyHistory?: null | Array<ControlledManuallyHistory_DataPoint>;

  // Populated at front end
  exportFileName?: string;
  timeZone?: string;
  targetRange?: DatetimeRangeModel;
  powerLimitTargetCoefficient: number;
  powerLimitType: 'power' | 'energy';
}

// GET /pv-production?&deviceId=1&deviceId=2&from=2023-01-05T00:00:00.000Z&to=2023-07-05T00:00:00.000Z&integrationPeriod=days
// Query params:
// deviceId - one or multiple
// from - ISO timestamp string
// to - ISO timestamp string
// integrationPeriod - 'days' | 'months'

// Response:
// Object of type PVProductionData
