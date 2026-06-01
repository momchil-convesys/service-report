import { Injectable, inject } from '@angular/core';
import { Observable, Subject, catchError, filter, map, of, switchMap, takeUntil } from 'rxjs';
import { DataRequest } from 'src/app/constants';
import { ApiService } from 'src/app/data/api';
import { Plant } from '../../../data/models';
import { PlantsService } from '../../../data/services/plants.service';
import { handleAnyError } from '../../../helpers';
import { adaptSchedule } from './adapter';
import { PowerLimitScheduleDTO, PowerLimitScheduleToggleStatusDTO } from './dto';
import { PowerLimitSchedule } from './models';

@Injectable()
export class PowerLimitScheduleApiService {
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
   * Download power limit schedule file
   */
  fetchPowerLimitScheduleFile(
    plantId: string,
    scheduleId: string,
  ): Observable<DataRequest<Blob | null>> {
    const url = `${this.baseUrl}/power-limit-schedules/${plantId}/${scheduleId}/file`;

    const request: Observable<{ data: Blob | null }> = this.baseApi.http
      .get(url, { observe: 'response', responseType: 'blob' })
      .pipe(map((response) => ({ data: response.body })));

    return this.baseApi.decorateRequest(request);
  }

  /**
   * Get all schedules related to plant (history of uploaded files) paginated
   *
   * GET /power-limit-schedules/{plantId}
   */
  fetchPowerLimitSchedules(
    plantId: string,
    page: number,
    limit: number,
  ): Observable<DataRequest<PowerLimitSchedule[]>> {
    const plant$: Observable<Plant> = this.plantsService.getPlant(plantId).pipe(
      filter((request) => request.data !== undefined),
      map((request) => request.data as Plant),
    );

    return plant$.pipe(
      switchMap((plant) =>
        this.baseApi
          .fetchList<
            PowerLimitScheduleDTO,
            PowerLimitScheduleDTO
          >(`/power-limit-schedules/${plantId}?_page=${page}&_limit=${limit}`, undefined)
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
   * GET /power-limit-schedules/{plantId}/{scheduleId}
   */
  fetchPowerLimitSchedule(
    plantId: string,
    scheduleId: string,
  ): Observable<DataRequest<PowerLimitSchedule>> {
    const plant$: Observable<Plant> = this.plantsService.getPlant(plantId).pipe(
      filter((request) => request.data !== undefined),
      map((request) => request.data as Plant),
    );

    return plant$.pipe(
      switchMap((plant) =>
        this.baseApi
          .fetchObject<
            PowerLimitScheduleDTO,
            PowerLimitScheduleDTO
          >(`/power-limit-schedules/${plantId}/${scheduleId}`, undefined)
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
   * PATCH /power-limit-schedules/{plantId}/{scheduleId}
   */
  patchPowerLimitSchedule(
    plantId: string,
    scheduleId: string,
    patch: PowerLimitScheduleToggleStatusDTO,
  ): Observable<DataRequest<PowerLimitSchedule>> {
    const plant$: Observable<Plant> = this.plantsService.getPlant(plantId).pipe(
      filter((request) => request.data !== undefined),
      map((request) => request.data as Plant),
    );

    return plant$.pipe(
      switchMap((plant) =>
        this.baseApi
          .patchItem<
            PowerLimitScheduleDTO,
            PowerLimitScheduleDTO
          >(`/power-limit-schedules/${plantId}/${scheduleId}`, patch, undefined)
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
