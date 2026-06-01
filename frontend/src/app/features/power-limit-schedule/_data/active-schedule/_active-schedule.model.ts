import {
  ActivePowerLimitScheduleDTO,
  ActivePowerLimitScheduleRecordDTO,
} from './_active-schedule.dto';

export interface ActivePowerLimitScheduleRecord extends ActivePowerLimitScheduleRecordDTO {
  coefficient: number | undefined; // E.g. 1.02
  calculatedTarget: number | undefined | null;
}

// Also included in plant model
export interface ActivePowerLimitSchedule extends ActivePowerLimitScheduleDTO {
  plantTimeZone: string | undefined;

  // TODO: not used
  records: null | ActivePowerLimitScheduleRecord[];

  // Current record is null when all records are with timestamps in the future
  currentRecord: null | ActivePowerLimitScheduleRecord;
}
