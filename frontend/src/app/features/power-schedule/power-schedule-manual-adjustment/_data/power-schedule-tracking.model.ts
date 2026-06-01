import { IntegrationPeriod, PowerScheduleStatus } from 'src/app/constants';
import { DatetimeRangeModel } from 'src/app/shared/datetime-range-select/models';
import { PriorityModeType } from './manual-adjustments.dto';

export interface SetpointValue {
  value: number | null;
  valueAdjusted: number | null;
}

export interface ScheduleStatusInterval {
  interval: {
    start: Date;
    end: Date;
  };
  status: PowerScheduleStatus;
}

export interface PowerScheduleTrackingInterval {
  interval: {
    start: Date;
    end: Date;
  };
  zonedInterval: {
    start: Date;
    end: Date;
  };

  // PV setpoint (adjusted with percentage)
  pvPowerSetpoint: SetpointValue;
  pvPowerSetpointCustom: SetpointValue | null;

  pvEffectiveSetpointValue: number | null;

  // PV setpoint energy equivalent (calculated from setpoint power)
  pvEffectiveSetpointEnergyEquivalent: number | null;

  // PV production (energy in kWh)
  pvProduction: number | null;

  // PV deviation from setpoint equivalent (actual production - expected from setpoint)
  pvProductionDeviation: number | null;

  // BESS setpoint (adjusted with percentage)
  bessPowerSetpoint: SetpointValue;
  bessPowerSetpointCustom: SetpointValue | null;

  bessEffectiveSetpointValue: number | null;

  // BESS setpoint energy equivalent
  bessEffectiveSetpointEnergyEquivalent: number | null;

  // BESS energy (in kWh)
  bessChargedEnergy: number | null;
  bessDischargedEnergy: number | null;

  // BESS energy deviation from setpoint equivalent
  bessEnergyDeviation: number | null;

  // Priority mode (for tooltip later)
  priorityModeCustom: PriorityModeType | null;

  // Original interval splits that were aggregated into this interval
  historyIntervals?: PowerScheduleTrackingInterval[];

  scheduleStatus?: PowerScheduleStatus | null;

  // Grid power calculations based on PV and BESS setpoints
  gridPowerSetpoint: number | null; // Sum of original PV + BESS setpoints (null if either is null)
  gridExportEnergyEquivalent: number | null;
  gridImportEnergyEquivalent: number | null;

  // Grid energy deviation from setpoint equivalent
  gridEnergyDeviation: number | null;

  // From backend
  exportedEnergy: number | null;
  importedEnergy: number | null;

  responsibleUserDisplayName?: string | null;
}

export interface PowerScheduleTracking {
  from: Date;
  to: Date;

  plantId: string;

  integrationPeriod: IntegrationPeriod;

  intervals: Array<PowerScheduleTrackingInterval>;

  // Coefficients for adjustment
  pvSetpointTargetCoefficient: number;
  bessSetpointTargetCoefficient: number;

  // Populated at front end
  exportFileName?: string;
  timeZone?: string;
  targetRange?: DatetimeRangeModel;

  // Schedule status history derived from intervals
  scheduleStatusHistory: Array<ScheduleStatusInterval>;
}
