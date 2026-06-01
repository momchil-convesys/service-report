import { Injectable } from '@angular/core';
import { Observable, Subject, catchError, map, of, takeUntil } from 'rxjs';
import { DataRequest, IntegrationPeriod } from '../../../../constants';
import { ApiService, ServerSentEventsService } from '../../../../data/api';
import { handleAnyError } from '../../../../helpers';
import { PVAveragePowerDataAdapter } from './pv-average-power.adapter';
import { PVAveragePowerDataDTO } from './pv-average-power.dto';
import { PVAveragePowerData } from './pv-average-power.model';
import { pvAveragePowerDataUpdateCallback } from './pv-average-power.updater';

@Injectable()
export class PVAveragePowerApiService {
  private _destroy$ = new Subject<void>();

  constructor(
    private baseApi: ApiService,
    private sseApi: ServerSentEventsService,
  ) {}

  ngOnDestroy() {
    this._destroy$.next();
  }

  //============================================================================
  // PV Average Power

  fetchPVAveragePowerData(
    plantId: string,
    from: string,
    to: string,
    integrationPeriod: IntegrationPeriod,
    liveData: boolean,
  ): Observable<DataRequest<PVAveragePowerData>> {
    let queryParams = `?plantId=${plantId}&integrationPeriod=${integrationPeriod}&from=${from}&to=${to}`;

    const requestUrl = `/pv-average-power${queryParams}`;

    if (liveData) {
      return this.sseApi
        .fetch<PVAveragePowerDataDTO>(requestUrl, pvAveragePowerDataUpdateCallback)
        .pipe(
          map((req) => ({
            ...req,
            data: req.data ? PVAveragePowerDataAdapter.dtoToModel(req.data) : undefined,
          })),
          catchError((error: string) =>
            of({ isLoading: false, error: handleAnyError(error, undefined) }),
          ),
          takeUntil(this._destroy$),
        );
    }

    return this.baseApi.fetchObject(requestUrl, PVAveragePowerDataAdapter);
  }
}
