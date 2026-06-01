import { PriorityMode } from '../../_data/priority-modes.dto';

export type PriorityModeType = keyof typeof PriorityMode;

export type PowerScheduleAdjustment_RequestBody_DTO =
  | PowerScheduleAdjustment_PVPowerSetpoint_RequestBody_DTO
  | PowerScheduleAdjustment_BESSPowerSetpoint_RequestBody_DTO
  | PowerScheduleAdjustment_PriorityMode_RequestBody_DTO;

/**
 * /manual-power-schedule-adjustments/pv-power-setpoint?plantId=${plant?.id}
 */
export interface PowerScheduleAdjustment_PVPowerSetpoint_RequestBody_DTO {
  interval: {
    start: string; // ISO UTC
    end: string; // ISO UTC
  };

  // null means no limit
  // value in kW
  pvPowerSetpoint: number | null;

  // if null, do not change priorityMode
  priorityMode: null | {
    // null to reset to default behaviour
    value: PriorityModeType | null;
  };

  passcode: string;
}

/**
 * /manual-power-schedule-adjustments/bess-power-setpoint?plantId=${plant?.id}
 */
export interface PowerScheduleAdjustment_BESSPowerSetpoint_RequestBody_DTO {
  interval: {
    start: string; // ISO UTC
    end: string; // ISO UTC
  };

  // null means no limit, but is not expected
  // value in kW (positive/negative = discharge/charge or vice versa)
  bessPowerSetpoint: number | null;

  // if null, do not change priorityMode
  priorityMode: null | {
    // null to reset to default behaviour
    value: PriorityModeType | null;
  };

  passcode: string;
}

/**
 * /manual-power-schedule-adjustments/priority-mode?plantId=${plant?.id}
 */
export interface PowerScheduleAdjustment_PriorityMode_RequestBody_DTO {
  interval: {
    start: string; // ISO UTC
    end: string; // ISO UTC
  };

  priorityMode: {
    // null to reset to default behaviour
    value: PriorityModeType | null;
  };

  passcode: string;
}
