import { inject, Injectable } from '@angular/core';
import { map, Observable, Subject, takeUntil } from 'rxjs';
import { DataRequest } from '../../../constants';
import { ApiService, ServerSentEventsService } from '../../../data/api';
import { ControlLimitDTO, ControlLimitUpdateRequestDTO } from './models';

@Injectable()
export class ControlLimitApiService {
  private baseApi = inject(ApiService);
  private sseApi = inject(ServerSentEventsService);

  private _destroy$ = new Subject<void>();

  ngOnDestroy() {
    this._destroy$.next();
  }

  /**
   * GET /plant-manual-control-limit/current?plantId={plantId}
   * Returns the current control limit state for the specified plant
   */
  fetchCurrentControlLimit(plantId: string): Observable<DataRequest<ControlLimitDTO>> {
    return this.sseApi
      .fetch<ControlLimitDTO>(
        `/plant-manual-control-limit/current?plantId=${plantId}`,
        (prev, next) => next,
      )
      .pipe(takeUntil(this._destroy$));
  }

  /**
   * PUT /plant-manual-control-limit/update
   */
  updateControlLimit(
    request: ControlLimitUpdateRequestDTO,
  ): Observable<DataRequest<ControlLimitDTO>> {
    return this.baseApi.decorateRequest(
      this.baseApi.http
        .put<ControlLimitDTO>(
          `${this.baseApi.baseUrl}/plant-manual-control-limit/update`,
          request,
          {
            headers: this.baseApi.defaultHttpHeaders,
          },
        )
        .pipe(
          map((response) => ({ data: response })),
          takeUntil(this._destroy$),
        ),
    );
  }
}
