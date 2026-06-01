import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DataRequest } from 'src/app/constants';
import { ApiService, ServerSentEventsService } from 'src/app/data/api';
import {
  GridExportSchedule_CurrentSettings_DTO,
  GridExportSchedule_SettingsHistory_DTO,
  GridExportSchedule_UpdateSettings_DTO,
} from '../models/grid-export-schedule-settings.dto';
import { GridExportSchedule_ForDay_DTO } from '../models/grid-export-schedule.dto';
import { GridExportSchedule_ForDay } from '../models/grid-export-schedule.model';

/** ----------------------------------------------------------------------------
 * ALL REQUESTS
 *
 * GET    /grid-export-schedule/schedules-list ? plantId=""
 * GET    /grid-export-schedule/schedules-list/{scheduleId} ? plantId=""
 *
 * PATCH  /grid-export-schedule/schedules-list/{scheduleId} ? plantId=""
 *
 * GET    /grid-export-schedule/settings/current ? plantId=""
 * PATCH  /grid-export-schedule/settings/current ? plantId=""
 *
 * GET    /grid-export-schedule/settings/history ? plantId=""
 *
 *
 * In context (given as example only, not implemented):
 *
 *        /plants/{plantId}/grid-export-schedule/...
 */

@Injectable()
export class GridExportScheduleApiService {
  private baseApi = inject(ApiService);
  private sseApi = inject(ServerSentEventsService);
  // private mockSettings = inject(GridExportScheduleMockSettingsService);

  get baseUrl(): string {
    return this.baseApi.baseUrl;
  }

  // private _mockSchedules = mockSchedules;

  /** --------------------------------------------------------------------------
   * Get all grid export schedules related to plant paginated
   *
   * GET /grid-export-schedule/schedules-list
   *
   * Query params:
   *
   *    plantId: string; // required
   *
   *    Pagination parameters:
   *
   *    {_sort}
   *    {_order}
   *    {_page}
   *
   * Response:
   *
   *    Array of objects of type GridExportSchedule_ForDay_DTO
   *    SORTED by applicable interval
   */
  fetchGridExportSchedules(
    plantId: string,
    page: number,
    limit: number,
  ): Observable<DataRequest<GridExportSchedule_ForDay_DTO[]>> {
    return this.baseApi.fetchList(
      `/grid-export-schedule/schedules-list?plantId=${plantId}&_page=${page}&_limit=${limit}`,
      undefined,
    );

    // const request: DataRequest<GridExportSchedule_ForDay_DTO[]> = {
    //   isLoading: false,
    //   data: this._mockSchedules,
    //   listMetadata: {
    //     totalCount: this._mockSchedules.length,
    //   },
    // };

    // return of(request);
  }

  /** --------------------------------------------------------------------------
   * Get single schedule by ID
   *
   * GET /grid-export-schedule/schedules-list/{scheduleId}
   *
   * Query params:
   *
   *    plantId: string; // required
   *
   * Response:
   *
   *    Object of type GridExportSchedule_ForDay_DTO
   */
  fetchGridExportSchedule(
    plantId: string,
    scheduleId: string,
  ): Observable<DataRequest<GridExportSchedule_ForDay_DTO>> {
    return this.baseApi.fetchObject(
      `/grid-export-schedule/schedules-list/${scheduleId}?plantId=${plantId}`,
      undefined,
    );

    // const schedule = this._mockSchedules.find((s) => s.id === scheduleId);
    // const minPrice = this.mockSettings.getSettings().minPriceToEnableExport;
    // const now = new Date();

    // schedule?.dataRecords.forEach((record) => {
    //   if (isAfter(new Date(record.interval.from), now)) {
    //     record.objective.minPriceToEnableExport = minPrice;
    //     record.objective.exportToGrid = (record.ibex.priceMWh || 0) > minPrice;
    //   }
    // });

    // if (schedule) {
    //   schedule.plantId = plantId;
    // }

    // const request: DataRequest<GridExportSchedule_ForDay_DTO> = {
    //   isLoading: false,
    //   data: schedule,
    //   listMetadata: {
    //     totalCount: 1,
    //   },
    // };

    // return of(request);
  }

  /** --------------------------------------------------------------------------
   * Enable / Disable schedule
   *
   * PATCH /grid-export-schedule/schedules-list/{scheduleId}
   *
   * Query params:
   *
   *    plantId: string; // required
   *
   * Request body:
   *
   *    {
   *        status: 'enabled' | 'disabled';
   *    }
   *
   * Response:
   *
   *    Object of type GridExportSchedule_ForDay_DTO
   *    (the applied patch should be also present in statusHistory)
   */
  patchGridExportSchedule(
    plantId: string,
    scheduleId: string,
    dataPatch: Partial<GridExportSchedule_ForDay>,
  ): Observable<DataRequest<GridExportSchedule_ForDay_DTO>> {
    return this.baseApi.patchItem(
      `/grid-export-schedule/schedules-list/${scheduleId}?plantId=${plantId}`,
      dataPatch,
      undefined,
    );
  }

  /** ----------------------------------------------------------------------------
   * Get current settings
   *
   * GET /grid-export-schedule/settings/current
   *
   * Query params:
   *
   *    plantId: string; // required
   *
   * Response:
   *
   *    Object of type GridExportSchedule_CurrentSettings_DTO
   */

  fetchCurrentSettings(
    plantId: string,
  ): Observable<DataRequest<GridExportSchedule_CurrentSettings_DTO>> {
    return this.baseApi.fetchObject(
      `/grid-export-schedule/settings/current?plantId=${plantId}`,
      undefined,
    );

    // const mockSettings = this.mockSettings.getSettings();
    // const mockResult: DataRequest<GridExportSchedule_CurrentSettings_DTO> = {
    //   isLoading: false,
    //   data: {
    //     plantId,
    //     settings: {
    //       minPriceToEnableExport: mockSettings.minPriceToEnableExport,
    //       autoEnableNewSchedules: mockSettings.autoEnableNewSchedules,
    //     },
    //   },
    // };
    // return of(mockResult).pipe(delay(0));
  }

  /** ----------------------------------------------------------------------------
   * Update current settings
   *
   * PATCH /grid-export-schedule/settings/current
   *
   * Query params:
   *
   *    plantId: string; // required
   *
   * Request body:
   *
   *    GridExportSchedule_UpdateSettings_DTO
   *    (partial settings for plant Id)
   *
   * Response:
   *
   *    Object of type GridExportSchedule_CurrentSettings_DTO
   *    (full object with updated settings)
   */

  patchCurrentSettings(
    plantId: string,
    dataPatch: GridExportSchedule_UpdateSettings_DTO,
  ): Observable<DataRequest<GridExportSchedule_CurrentSettings_DTO>> {
    return this.baseApi.patchItem(
      `/grid-export-schedule/settings/current?plantId=${plantId}`,
      dataPatch,
      undefined,
    );

    // this.mockSettings.updateSettings(dataPatch.settings);

    // return this.fetchCurrentSettings(plantId);
  }

  /** ----------------------------------------------------------------------------
   * Get settings history
   *
   * GET /grid-export-schedule/settings/history
   *
   * Query params:
   *
   *    plantId: string; // required
   *
   * Response:
   *
   *    Object of type GridExportSchedule_SettingsHistory_DTO
   */

  fetchSettingsHistory(
    plantId: string,
  ): Observable<DataRequest<GridExportSchedule_SettingsHistory_DTO>> {
    return this.baseApi.fetchObject(
      `/grid-export-schedule/settings/history?plantId=${plantId}`,
      undefined,
    );

    // const mockResult: DataRequest<GridExportSchedule_SettingsHistory_DTO> = {
    //   isLoading: false,
    //   data: {
    //     plantId,
    //     records: this.mockSettings.getHistoryRecords(),
    //   },
    // };

    // return of(mockResult);
  }
}
