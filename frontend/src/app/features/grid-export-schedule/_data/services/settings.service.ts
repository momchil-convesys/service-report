import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { DataRequest } from '../../../../constants';
import {
  GridExportScheduleSettings,
  GridExportSchedule_CurrentSettings_DTO,
  GridExportSchedule_SettingsHistory_DTO,
  GridExportSchedule_UpdateSettings_DTO,
} from '../models/grid-export-schedule-settings.dto';
import { GridExportScheduleApiService } from './api.service';

@Injectable()
export class GridExportScheduleSettingsService {
  private api = inject(GridExportScheduleApiService);

  getSettings(plantId: string): Observable<DataRequest<GridExportSchedule_CurrentSettings_DTO>> {
    return this.api.fetchCurrentSettings(plantId).pipe(
      map((req) => ({
        ...req,
        data: this.adaptDtoToModel(req.data),
      })),
      shareReplay(1),
    );
  }

  updateSettings(
    plantId: string,
    settings: Partial<GridExportScheduleSettings>,
  ): Observable<DataRequest<GridExportSchedule_CurrentSettings_DTO>> {
    const dataPatch: GridExportSchedule_UpdateSettings_DTO = {
      plantId,
      settings: {
        ...settings,
      },
    };

    return this.api.patchCurrentSettings(plantId, dataPatch).pipe(
      map((req) => ({
        ...req,
        data: this.adaptDtoToModel(req.data),
      })),
    );
  }

  getSettingsHistory(
    plantId: string,
  ): Observable<DataRequest<GridExportSchedule_SettingsHistory_DTO>> {
    return this.api.fetchSettingsHistory(plantId);
  }

  private adaptDtoToModel(
    dto: GridExportSchedule_CurrentSettings_DTO | undefined,
  ): GridExportSchedule_CurrentSettings_DTO | undefined {
    return dto;
  }
}
