import { PowerScheduleStatus } from '../../../../constants';
import { PriorityModeType } from './manual-adjustments.dto';

/**
 * GET /power-schedule-tracking
 *        ? plantId=${plant?.id}
 *        & from=${from}
 *        & to=${to}
 *        & sse=true (optional)
 *
 * Returns object of type PowerScheduleTracking_DTO
 */

export interface PowerScheduleTracking_DTO {
  plantId: string;

  from: string;
  to: string;

  intervals: PowerScheduleTrackingInterval_DTO[];
}

export interface PowerScheduleTrackingInterval_DTO {
  interval: {
    start: string;
    end: string;
  };

  // All values are in kW or kWh

  // ------------------------------
  // PV

  pvPowerSetpointOriginal: number | null;
  // null if not set at all
  pvPowerSetpointCustom: null | {
    // null if no limit
    value: number | null;
  };
  pvProduction: number | null;

  // ------------------------------
  // BESS

  bessPowerSetpointOriginal: number | null;
  // null if not set at all
  bessPowerSetpointCustom: null | {
    // null if no limit
    value: number | null;
  };
  bessChargedEnergy: number | null;
  bessDischargedEnergy: number | null;

  // ------------------------------
  // Priority mode

  // null if not set manually
  priorityModeCustom: PriorityModeType | null;

  // ------------------------------
  // Schedule status

  scheduleStatus?: null | PowerScheduleStatus;

  // ------------------------------
  // Grid exported/imported energy

  exportedEnergy?: number | null; // in kWh
  importedEnergy?: number | null; // in kWh

  // ------------------------------
  // User who made the adjustment

  responsibleUserDisplayName?: string | null;
}
