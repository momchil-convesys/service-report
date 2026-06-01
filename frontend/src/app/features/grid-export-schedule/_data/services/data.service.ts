import { formatDate } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { isBefore, isSameDay } from 'date-fns';
import { Observable, map } from 'rxjs';
import { APP_LOCALE_ID } from '../../../../app-locale';
import { DataRequest } from '../../../../constants';
import { PlantsService } from '../../../../data/services/plants.service';
import { utcToZonedTimeSafe } from '../../../../helpers';
import { GridExportSchedule_ForDay_DTO } from '../models/grid-export-schedule.dto';
import { GridExportSchedule_ForDay } from '../models/grid-export-schedule.model';
import { GridExportScheduleApiService } from './api.service';

@Injectable()
export class GridExportScheduleDataService {
  private api = inject(GridExportScheduleApiService);
  private plants = inject(PlantsService);

  getGridExportSchedules(
    plantId: string,
    page: number,
    limit: number,
  ): Observable<DataRequest<GridExportSchedule_ForDay[]>> {
    return this.api.fetchGridExportSchedules(plantId, page, limit).pipe(
      map((req) => ({
        ...req,
        data: req.data ? req.data.map((dto) => this.adaptDtoToModel(dto)) : undefined,
      })),
    );
  }

  getGridExportSchedule(
    plantId: string,
    scheduleId: string,
  ): Observable<DataRequest<GridExportSchedule_ForDay>> {
    return this.api.fetchGridExportSchedule(plantId, scheduleId).pipe(
      map((req) => ({
        ...req,
        data: req.data ? this.adaptDtoToModel(req.data) : undefined,
      })),
    );
  }

  updateGridExportSchedule(
    plantId: string,
    scheduleId: string,
    patch: Partial<GridExportSchedule_ForDay>,
  ): Observable<DataRequest<GridExportSchedule_ForDay>> {
    return this.api.patchGridExportSchedule(plantId, scheduleId, patch).pipe(
      map((req) => ({
        ...req,
        data: req.data ? this.adaptDtoToModel(req.data) : undefined,
      })),
    );
  }

  private adaptDtoToModel(dto: GridExportSchedule_ForDay_DTO): GridExportSchedule_ForDay {
    const plantTimeZone = this.plants.getCachedPlantById(dto.plantId)?.timeZone;

    const result: GridExportSchedule_ForDay = {
      ...dto,
      plantTimeZone,
      title: this.titleForSchedule(dto, plantTimeZone),
      subtitle: this.subtitleForSchedule(dto, plantTimeZone),
    };

    return result;
  }

  private titleForSchedule(
    schedule: GridExportSchedule_ForDay_DTO,
    plantTimeZone: string | undefined,
  ): string {
    const targetDateInPlantTimeZone = utcToZonedTimeSafe(
      new Date(schedule.applicableInterval.from),
      plantTimeZone,
    );

    return formatDate(targetDateInPlantTimeZone, 'EEEE, d MMMM', APP_LOCALE_ID);
  }

  private subtitleForSchedule(
    schedule: GridExportSchedule_ForDay_DTO,
    plantTimeZone: string | undefined,
  ): string {
    const targetDateInPlantTimeZone = utcToZonedTimeSafe(
      new Date(schedule.applicableInterval.from),
      plantTimeZone,
    );

    const nowInPlantTimeZone = utcToZonedTimeSafe(new Date(), plantTimeZone);

    if (isSameDay(targetDateInPlantTimeZone, nowInPlantTimeZone)) {
      return 'Ongoing schedule';
    }

    if (isBefore(targetDateInPlantTimeZone, nowInPlantTimeZone)) {
      return 'Past schedule';
    }

    return 'Upcoming schedule';
  }
}
