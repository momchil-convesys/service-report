import { inject, Injectable, OnDestroy } from '@angular/core';
import { isBefore } from 'date-fns';
import { catchError, map, Observable, of, Subject, takeUntil } from 'rxjs';
import { SSE_DataRequest, SSE_EventName } from '../../../../constants';
import { ApiService, ServerSentEventsService } from '../../../../data/api';
import { Plant } from '../../../../data/models';
import { handleAnyError } from '../../../../helpers';
import { adaptHistoricalPowerData } from './adapter';
import { DataAggregationFunction, DataResolutionPeriod } from './constants';
import { PVBESSHistoricalPowerData_DTO } from './dto';
import { PVBESSHistoricalPowerData } from './models';

@Injectable()
export class HistoricalPowerApiService implements OnDestroy {
  private _baseApi = inject(ApiService);
  private _sseApi = inject(ServerSentEventsService);
  private _destroy$ = new Subject<void>();

  /**
   * Flag to determine whether to use mock data or real API calls.
   * Set to false to use real API implementation.
   */
  useMockData = false;

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /**
   * GET /pv-bess-historical-power-data
   *        ? plantId=${plantId}
   *        & from=${from}
   *        & to=${to}
   *        & sse=true (optional)
   *
   * Returns object of type PVBESSHistoricalPowerData_DTO
   *
   * When the requested range includes current time (targetRange.to >= now), uses Server-Sent Events (SSE) for real-time updates.
   * When the requested range is in the past, uses regular HTTP request.
   *
   * Use the `useMockData` flag to control whether to use mock data or real API calls.
   */
  fetchHistoricalPowerData(
    plant: Plant,
    targetRangeFrom: Date,
    targetRangeTo: Date,
    res: DataResolutionPeriod,
    agg: DataAggregationFunction,
    forceStaticData: boolean = false,
  ): Observable<SSE_DataRequest<PVBESSHistoricalPowerData>> {
    const from = targetRangeFrom.toISOString();
    const to = targetRangeTo.toISOString();
    const requestUrl = `/pv-bess-historical-power-data?plantId=${plant.id}&from=${from}&to=${to}&res=${res}&agg=${agg}`;

    // Determine if SSE should be used: if the range includes current time or future
    const liveData = !isBefore(targetRangeTo, new Date()) && !forceStaticData;

    if (liveData) {
      return this._sseApi.fetch<PVBESSHistoricalPowerData_DTO>(requestUrl, undefined).pipe(
        map((sseRequest) => ({
          ...sseRequest,
          data: sseRequest.data ? adaptHistoricalPowerData(sseRequest.data) : sseRequest.data,
        })),
        catchError((error: string) =>
          of({
            isLoading: false,
            error: handleAnyError(error, undefined),
            eventName: null,
          }),
        ),
        takeUntil(this._destroy$),
      ) as Observable<SSE_DataRequest<PVBESSHistoricalPowerData>>;
    }

    // Real HTTP implementation
    return this._baseApi
      .fetchObject<
        PVBESSHistoricalPowerData_DTO,
        PVBESSHistoricalPowerData_DTO
      >(requestUrl, undefined)
      .pipe(
        map((dataRequest) => ({
          ...dataRequest,
          data: dataRequest.data ? adaptHistoricalPowerData(dataRequest.data) : dataRequest.data,
          eventName: dataRequest.data ? SSE_EventName.DATA_INIT : null,
        })),
        catchError((error: string) =>
          of({
            isLoading: false,
            error: handleAnyError(error, undefined),
            data: undefined,
            eventName: null,
          }),
        ),
      ) as Observable<SSE_DataRequest<PVBESSHistoricalPowerData>>;
  }
}
