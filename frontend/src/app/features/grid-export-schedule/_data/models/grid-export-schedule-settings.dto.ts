import { User_DTO } from '../../../../data/dtos';

export interface GridExportScheduleSettings {
  minPriceToEnableExport: number;
  autoEnableNewSchedules: boolean;
}

export interface GridExportSchedule_CurrentSettings_DTO {
  plantId: string;
  settings: GridExportScheduleSettings;
}

export interface GridExportSchedule_UpdateSettings_DTO {
  plantId: string;
  settings: Partial<GridExportScheduleSettings>;
}

export interface GridExportSchedule_SettingsHistoryRecord_DTO {
  timestamp: string;
  user: User_DTO;

  settings: Partial<GridExportScheduleSettings>;
}

export interface GridExportSchedule_SettingsHistory_DTO {
  plantId: string;

  records: Array<GridExportSchedule_SettingsHistoryRecord_DTO>;
}
