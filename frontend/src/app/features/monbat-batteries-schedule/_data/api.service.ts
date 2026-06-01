import { Injectable, inject } from '@angular/core';
import { Observable, Subject, catchError, filter, map, of, switchMap, takeUntil } from 'rxjs';
import { DataRequest } from 'src/app/constants';
import { ApiService } from 'src/app/data/api';
import { Plant } from '../../../data/models';
import { PlantsService } from '../../../data/services/plants.service';
import { handleAnyError } from '../../../helpers';
import { adaptSchedule } from './adapter';
import { MonbatPowerLimitScheduleDTO, MonbatPowerLimitScheduleToggleStatusDTO } from './dto';
import { MonbatSchedule } from './models';

@Injectable()
export class MonbatApiService {
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
    deviceId: string,
    scheduleId: string,
  ): Observable<DataRequest<Blob | null>> {
    const url = `${this.baseUrl}/monbat/power-limit-schedules/${plantId}/${deviceId}/${scheduleId}/file`;

    const request: Observable<{ data: Blob | null }> = this.baseApi.http
      .get(url, { observe: 'response', responseType: 'blob' })
      .pipe(map((response) => ({ data: response.body })));

    return this.baseApi.decorateRequest(request);
  }

  /**
   * Get all schedules related to plant (history of uploaded files) paginated
   *
   * GET /monbat/power-limit-schedules/{plantId}/{deviceId}
   */
  fetchPowerLimitSchedules(
    plantId: string,
    deviceId: string,
    page: number,
    limit: number,
  ): Observable<DataRequest<MonbatSchedule[]>> {
    const plant$: Observable<Plant> = this.plantsService.getPlant(plantId).pipe(
      filter((request) => request.data !== undefined),
      map((request) => request.data as Plant),
    );

    return plant$.pipe(
      switchMap((plant) =>
        this.baseApi
          .fetchList<
            MonbatPowerLimitScheduleDTO,
            MonbatPowerLimitScheduleDTO
          >(`/monbat/power-limit-schedules/${plantId}/${deviceId}?_page=${page}&_limit=${limit}`, undefined)
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
   * GET /monbat/power-limit-schedules/{plantId}/{deviceId}/{scheduleId}
   */
  fetchPowerLimitSchedule(
    plantId: string,
    deviceId: string,
    scheduleId: string,
  ): Observable<DataRequest<MonbatSchedule>> {
    const plant$: Observable<Plant> = this.plantsService.getPlant(plantId).pipe(
      filter((request) => request.data !== undefined),
      map((request) => request.data as Plant),
    );

    return plant$.pipe(
      switchMap((plant) =>
        this.baseApi
          .fetchObject<
            MonbatPowerLimitScheduleDTO,
            MonbatPowerLimitScheduleDTO
          >(`/monbat/power-limit-schedules/${plantId}/${deviceId}/${scheduleId}`, undefined)
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
   * PATCH /monbat/power-limit-schedules/{plantId}/{deviceId}/{scheduleId}
   */
  patchPowerLimitSchedule(
    plantId: string,
    deviceId: string,
    scheduleId: string,
    patch: MonbatPowerLimitScheduleToggleStatusDTO,
  ): Observable<DataRequest<MonbatSchedule>> {
    const plant$: Observable<Plant> = this.plantsService.getPlant(plantId).pipe(
      filter((request) => request.data !== undefined),
      map((request) => request.data as Plant),
    );

    return plant$.pipe(
      switchMap((plant) =>
        this.baseApi
          .patchItem<
            MonbatPowerLimitScheduleDTO,
            MonbatPowerLimitScheduleDTO
          >(`/monbat/power-limit-schedules/${plantId}/${deviceId}/${scheduleId}`, patch, undefined)
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
