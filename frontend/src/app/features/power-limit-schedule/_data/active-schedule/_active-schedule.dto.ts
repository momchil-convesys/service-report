/**
 * ActivePowerLimitScheduleDTO defines a property in the Plant model
 * and is also transferred over generic web socket to notify for changes
 * related to a particular plant.
 *
 * E.g: plantX: Plant = {
 *    ...
 *    activePowerLimitSchedule: null |  ActivePowerLimitScheduleDTO
 * }
 *
 * CASE 1: No active schedule
 *
 *    Active schedule is null if no upcoming schedule records are present in GW memory.
 *    In this case there should also be no file with upcoming records and status 'enabled'.
 *
 * CASE 2: Active schedule
 *
 *    A list of upcoming schedule records present in GW memory is considered as "active schedule".
 *
 *    The active schedule could either be followed by GW
 *         complianceStatus = "compliant"
 *    or there might be an error
 *         complianceStatus = "non-compliant"
 *         nonComplianceReason = "human readable error"
 *
 *    The active schedule could be either current or upcoming (records with timestamp in the future).
 */

export interface ActivePowerLimitScheduleRecordDTO {
  powerLimitMw: number | null;

  interval: {
    from: string; // E.g: 10:15
    to: string; // E.g: 10:30 (NOTE: NOT 10:29.999)
  };

  powerLimitType: 'power' | 'energy';
}

export interface ActivePowerLimitScheduleDTO {
  id: string;

  timestamp: string | null; // time of last compliance information

  complianceStatus: null | 'compliant' | 'non-compliant';
  nonComplianceReason: string | null; // human readable error

  // not used
  // records: null | ActivePowerLimitScheduleRecordDTO[];

  // Current record is null when all records are with timestamps in the future
  currentRecord: null | ActivePowerLimitScheduleRecordDTO;

  fileRefId: null | string;

  /**
   * If this object is provided,
   * the other fields are ignored,
   * except for the timestamp.
   */
  controlledByExternalSystem?: null | {
    powerLimitMw: number | null;
  };

  /**
   * TODO: Add option for manually controlled power limit.
   */
}

export interface WsTopicMessage_PowerLimitScheduleDTO {
  plantId: string;
  activePowerLimitSchedule: null | ActivePowerLimitScheduleDTO;

  // Used to determine if activePowerLimitSchedule value is for PV schedule (default) or for BESS.
  isBESS?: boolean;
}
