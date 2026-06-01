import { inject, Injectable, OnDestroy } from '@angular/core';
import { isBefore } from 'date-fns';
import { catchError, map, Observable, of, Subject, takeUntil } from 'rxjs';
import { SSE_DataRequest, SSE_EventName } from '../../../../constants';
import { ApiService, ServerSentEventsService } from '../../../../data/api';
import { Plant } from '../../../../data/models';
import { handleAnyError } from '../../../../helpers';
import { DatetimeRangeModel } from '../../../../shared/datetime-range-select/models';
import { adaptEnergyDataToChartModel } from './adapter';
import { PVBESSHistoricalEnergyData_DTO } from './dto';
import { PVBESSHistoricalEnergyData } from './models';

@Injectable()
export class HistoricalEnergyApiService implements OnDestroy {
  private _baseApi = inject(ApiService);
  private _sseApi = inject(ServerSentEventsService);
  private _destroy$ = new Subject<void>();

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /**
   * GET /pv-bess-historical-energy-data
   *        ? plantId=${plantId}
   *        & from=${from}
   *        & to=${to}
   *        & integrationPeriod=${integrationPeriod}
   *        & sse=true (optional)
   *
   * Returns object of type PVBESSHistoricalEnergyData_DTO
   *
   * When the requested range includes current time (targetRange.to >= now), uses Server-Sent Events (SSE) for real-time updates.
   * When the requested range is in the past, uses regular HTTP request.
   *
   * Use the `useMockData` flag to control whether to use mock data or real API calls.
   */
  fetchHistoricalEnergyData(
    plant: Plant,
    targetRange: DatetimeRangeModel,
  ): Observable<SSE_DataRequest<PVBESSHistoricalEnergyData>> {
    const from = targetRange.from.toISOString();
    const to = targetRange.to.toISOString();
    const integrationPeriod = targetRange.integrationPeriod || 'quarterOfAnHour';
    const requestUrl = `/pv-bess-historical-energy-data?plantId=${plant.id}&from=${from}&to=${to}&integrationPeriod=${integrationPeriod}`;

    // Determine if SSE should be used: if the range includes current time or future
    const liveData = !isBefore(targetRange.to, new Date());

    if (liveData) {
      return this._sseApi.fetch<PVBESSHistoricalEnergyData_DTO>(requestUrl, undefined).pipe(
        map((sseRequest) => ({
          ...sseRequest,
          data: sseRequest.data ? adaptEnergyDataToChartModel(sseRequest.data) : sseRequest.data,
        })),
        catchError((error: string) =>
          of({
            isLoading: false,
            error: handleAnyError(error, undefined),
            eventName: null,
          }),
        ),
        takeUntil(this._destroy$),
      ) as Observable<SSE_DataRequest<PVBESSHistoricalEnergyData>>;
    }

    return this._baseApi
      .fetchObject<
        PVBESSHistoricalEnergyData_DTO,
        PVBESSHistoricalEnergyData_DTO
      >(requestUrl, undefined)
      .pipe(
        map((dataRequest) => ({
          isLoading: dataRequest.isLoading,
          data: dataRequest.data ? adaptEnergyDataToChartModel(dataRequest.data) : dataRequest.data,
          error: dataRequest.error,
          eventName: dataRequest.data ? SSE_EventName.DATA_INIT : null,
        })),
        catchError((error: string) =>
          of({ isLoading: false, error: handleAnyError(error, undefined), eventName: null }),
        ),
      ) as Observable<SSE_DataRequest<PVBESSHistoricalEnergyData>>;
  }
}
