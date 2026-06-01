import { inject, Injectable, OnDestroy } from '@angular/core';
import { catchError, Observable, of, Subject, takeUntil } from 'rxjs';
//import { powerScheduleTrackingMock } from '../../../../../mock/power-scheduke-tracking-mock';
import { DataRequest } from '../../../../constants';
import { ApiService, ServerSentEventsService } from '../../../../data/api';
import { handleAnyError } from '../../../../helpers';
import { PowerScheduleTracking_DTO } from './power-schedule-tracking.dto';
import { powerScheduleTrackingUpdateCallback } from './power-schedule-tracking.updater';

@Injectable()
export class PowerScheduleTrackingService implements OnDestroy {
  private baseApi = inject(ApiService);
  private sseApi = inject(ServerSentEventsService);

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
   * GET /power-schedule-tracking
   *        ? plantId=${plantId}
   *        & from=${from}
   *        & to=${to}
   *
   * Returns object of type PowerScheduleTracking_DTO
   *
   * When liveData is true, uses Server-Sent Events (SSE) for real-time updates.
   * When liveData is false, uses regular HTTP request.
   *
   * Use the `useMockData` flag to control whether to use mock data or real API calls.
   */
  fetchPowerScheduleTracking(
    plantId: string,
    from: string,
    to: string,
    liveData: boolean,
  ): Observable<DataRequest<PowerScheduleTracking_DTO>> {
    const requestUrl = `/power-schedule-tracking?plantId=${plantId}&from=${from}&to=${to}`;

    // if (this.useMockData) {
    //   if (liveData) {
    //     // Mock SSE implementation - return mock data with loading simulation
    //     const loadingValue = of({
    //       isLoading: true,
    //       data: undefined,
    //     } as DataRequest<PowerScheduleTracking_DTO>);

    //     const dataValue = of({
    //       isLoading: false,
    //       data: powerScheduleTrackingMock,
    //     } as DataRequest<PowerScheduleTracking_DTO>).pipe(delay(0)); // Simulate network delay

    //     return concat(loadingValue, dataValue).pipe(takeUntil(this._destroy$));
    //   }

    //   // Mock regular HTTP implementation - return mock data with loading simulation
    //   const loadingValue = of({
    //     isLoading: true,
    //     data: undefined,
    //   } as DataRequest<PowerScheduleTracking_DTO>);

    //   const dataValue = of({
    //     isLoading: false,
    //     data: powerScheduleTrackingMock,
    //   } as DataRequest<PowerScheduleTracking_DTO>).pipe(delay(0)); // Simulate network delay

    //   return concat(loadingValue, dataValue).pipe(takeUntil(this._destroy$));
    // }

    // Real API implementation
    if (liveData) {
      // Real SSE implementation
      return this.sseApi
        .fetch<PowerScheduleTracking_DTO>(requestUrl, powerScheduleTrackingUpdateCallback)
        .pipe(
          catchError((error: string) =>
            of({ isLoading: false, error: handleAnyError(error, undefined) }),
          ),
          takeUntil(this._destroy$),
        );
    }

    // Real HTTP implementation
    return this.baseApi.fetchObject<PowerScheduleTracking_DTO, PowerScheduleTracking_DTO>(
      requestUrl,
      undefined,
    );
  }
}
