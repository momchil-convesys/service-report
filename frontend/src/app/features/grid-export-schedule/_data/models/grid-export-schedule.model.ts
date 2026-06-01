import { GridExportSchedule_ForDay_DTO } from './grid-export-schedule.dto';

export interface GridExportSchedule_ForDay extends GridExportSchedule_ForDay_DTO {
  plantTimeZone: string | undefined;

  title: string;
  subtitle: string;
}
