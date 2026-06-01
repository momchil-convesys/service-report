import { Injectable, inject } from '@angular/core';
import { Observable, Subject, catchError, filter, map, of, switchMap, takeUntil } from 'rxjs';
import { DataRequest } from 'src/app/constants';
import { ApiService } from 'src/app/data/api';
import { createMockPowerSchedule } from '../../../../mock/power-schedule-mock';
import { Plant } from '../../../data/models';
import { PlantsService } from '../../../data/services/plants.service';
import { handleAnyError } from '../../../helpers';
import { adaptSchedule } from './adapter';
import { PowerSchedule } from './models';
import { PowerScheduleDTO, PowerScheduleToggleStatusDTO } from './power-schedule.dto';

@Injectable()
export class PowerScheduleApiService {
  useMockStream = false;

  private baseApi = inject(ApiService);
  private plantsService = inject(PlantsService);

  private _destroy$ = new Subject<void>();

  get baseUrl(): string {
    return this.baseApi.baseUrl;
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /**
   * Download power schedule file
   */
  fetchPowerScheduleFile(
    plantId: string,
    scheduleId: string,
  ): Observable<DataRequest<Blob | null>> {
    const url = `${this.baseUrl}/power-schedules/${plantId}/${scheduleId}/file`;

    const request: Observable<{ data: Blob | null }> = this.baseApi.http
      .get(url, { observe: 'response', responseType: 'blob' })
      .pipe(map((response) => ({ data: response.body })));

    return this.baseApi.decorateRequest(request);
  }

  /**
   * Get all schedules related to plant (history of uploaded files) paginated
   *
   * GET /power-schedules/{plantId}
   */
  fetchPowerSchedules(
    plantId: string,
    page: number,
    limit: number,
  ): Observable<DataRequest<PowerSchedule[]>> {
    const plant$: Observable<Plant> = this.plantsService.getPlant(plantId).pipe(
      filter((request) => request.data !== undefined),
      map((request) => request.data as Plant),
    );

    return plant$.pipe(
      switchMap((plant) =>
        this.baseApi
          .fetchList<
            PowerScheduleDTO,
            PowerScheduleDTO
          >(`/power-schedules/${plantId}?_page=${page}&_limit=${limit}`, undefined)
          .pipe(
            map((request) => ({
              ...request,
              data: request.data ? request.data.map((dto) => adaptSchedule(dto, plant)) : undefined,
            })),
            catchError((error: unknown) =>
              of({ isLoading: false, error: handleAnyError(error, undefined) }),
            ),
          ),
      ),
      takeUntil(this._destroy$),
    );
  }

  /**
   * Get single schedule by ID
   *
   * GET /power-schedules/{plantId}/{scheduleId}
   */
  fetchPowerSchedule(plantId: string, scheduleId: string): Observable<DataRequest<PowerSchedule>> {
    if (this.useMockStream) {
      return of({ isLoading: false, data: createMockPowerSchedule(plantId) as unknown as PowerSchedule });
    }

    const plant$: Observable<Plant> = this.plantsService.getPlant(plantId).pipe(
      filter((request) => request.data !== undefined),
      map((request) => request.data as Plant),
    );

    return plant$.pipe(
      switchMap((plant) =>
        this.baseApi
          .fetchObject<
            PowerScheduleDTO,
            PowerScheduleDTO
          >(`/power-schedules/${plantId}/${scheduleId}`, undefined)
          .pipe(
            map((request) => ({
              ...request,
              data: request.data ? adaptSchedule(request.data, plant) : undefined,
            })),
            catchError((error: unknown) =>
              of({ isLoading: false, error: handleAnyError(error, undefined) }),
            ),
          ),
      ),
      takeUntil(this._destroy$),
    );
  }

  /**
   * Edit schedule state (enable/disable file)
   *
   * PATCH /power-schedules/{plantId}/{scheduleId}
   */
  patchPowerSchedule(
    plantId: string,
    scheduleId: string,
    patch: PowerScheduleToggleStatusDTO,
  ): Observable<DataRequest<PowerSchedule>> {
    const plant$: Observable<Plant> = this.plantsService.getPlant(plantId).pipe(
      filter((request) => request.data !== undefined),
      map((request) => request.data as Plant),
    );

    return plant$.pipe(
      switchMap((plant) =>
        this.baseApi
          .patchItem<
            PowerScheduleDTO,
            PowerScheduleDTO
          >(`/power-schedules/${plantId}/${scheduleId}`, patch, undefined)
          .pipe(
            map((request) => ({
              ...request,
              data: request.data ? adaptSchedule(request.data, plant) : undefined,
            })),
            catchError((error: unknown) =>
              of({ isLoading: false, error: handleAnyError(error, undefined) }),
            ),
          ),
      ),
      takeUntil(this._destroy$),
    );
  }
}
