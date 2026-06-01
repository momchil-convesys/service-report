import { PowerLimitScheduleStatus } from '../../../constants';
import { BaseUnit } from '../../../helpers';

export const plsUnitsMap: { [key in 'energy' | 'power']: string } = {
  ['energy']: 'MWh',
  ['power']: 'MW',
};

export const plsBaseUnitsMap: { [key in 'energy' | 'power']: BaseUnit } = {
  ['energy']: 'Wh',
  ['power']: 'W',
};

interface Interval {
  start: Date;
  end: Date;
}

export interface PowerLimitScheduleParsedTableRow {
  targetLimit_Mega: null | number; // null if No limit or value in MW/MWh
  targetLimitAdjusted_Mega: null | number;

  interval: Interval;
  zonedInterval: Interval;

  // Null if not applicable (when limit type is 'energy').
  // Precalculated value in MWh when limit type is 'power'.
  energyLimitEquivalent: null | {
    targetLimit_Mega: null | number; // null if No limit or value in MW/MWh
    targetLimitAdjusted_Mega: null | number;
  };
}

export interface PowerLimitScheduleHistoryItem {
  statusChangedTo: PowerLimitScheduleStatus;
  byUserDisplayName: string | null | undefined;
  timestamp: string;
}

export interface PowerLimitSchedule {
  id: string; // Unique accross all schedules (one-to-one relation with the uploaded file)

  plantId: string;

  applicableInterval: {
    timestampWithTimezoneStart: string;
    timestampWithTimezoneEnd: string;
  };

  file: {
    name: string; // E.g: Forecast_SDN_09.06.2023.xlsx
    url: string; // URL to download the uploaded file // Or ID
    uploadedTimestamp: string;
    uploadedByUserDisplayName: string | null | undefined;
  };

  parsedScheduleTable: PowerLimitScheduleParsedTableRow[];

  status: PowerLimitScheduleStatus;

  statusHistory: PowerLimitScheduleHistoryItem[];

  limitType: 'power' | 'energy'; // Whether values are provided in MW or MWh
  integrationPeriodMinutes: number; // 60 or 15

  plantTimeZone: string | undefined;
  powerLimitTargetCoefficient: number;
}
