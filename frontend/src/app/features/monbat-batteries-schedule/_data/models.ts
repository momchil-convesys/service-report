import { MonbatPowerLimitScheduleStatus } from './constants';
import { MonbatPowerLimitScheduleDTO } from './dto';

export interface MonbatScheduleParsedTableRow {
  cells: string[];
}

export interface MonbatScheduleHistoryItem {
  statusChangedTo: MonbatPowerLimitScheduleStatus;
  byUserDisplayName: string | null | undefined;
  timestamp: string;
}

export interface MonbatSchedule extends MonbatPowerLimitScheduleDTO {}
