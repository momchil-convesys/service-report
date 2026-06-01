import { Injectable } from '@angular/core';
import { Observable, Subject, catchError, map, of, takeUntil } from 'rxjs';
import { DataRequest, IntegrationPeriod } from '../../../../constants';
import { ApiService, EmptyContentError, ServerSentEventsService } from '../../../../data/api';
import { Plant } from '../../../../data/models';
import { handleAnyError } from '../../../../helpers';
import { PVProductionData } from './pv-production';
import { adaptPVProductionData } from './pv-production.adapter';
import { PVProductionDataDTO } from './pv-production.dto';
import { pvProductionDataUpdateCallback } from './pv-production.updater';

@Injectable()
export class PVProductionApiService {
  private _destroy$ = new Subject<void>();

  constructor(
    private baseApi: ApiService,
    private sseApi: ServerSentEventsService,
  ) {}

  ngOnDestroy() {
    this._destroy$.next();
  }

  //============================================================================
  // PV Production

  fetchPVProductionData(
    plant: Plant,
    deviceIds: string[],
    from: string,
    to: string,
    integrationPeriod: IntegrationPeriod,
    liveData: boolean,
  ): Observable<DataRequest<PVProductionData>> {
    let queryParams = `?integrationPeriod=${integrationPeriod}&from=${from}&to=${to}`;

    if (deviceIds.length > 0) {
      queryParams += this.baseApi.queryStringForDeviceIds(deviceIds);
    }

    const requestUrl = `/pv-production${queryParams}`;

    const request$ = liveData
      ? this.sseApi.fetch<PVProductionDataDTO>(requestUrl, pvProductionDataUpdateCallback)
      : this.baseApi.fetchObject<PVProductionDataDTO, PVProductionDataDTO>(requestUrl, undefined);

    return request$.pipe(
      /**
       * TODO: fix at backend
       * Backend should return an object with empty array of points
       */
      map((req) => {
        if (req.error instanceof EmptyContentError) {
          return {
            ...req,
            error: undefined,
            data: undefined,
          };
        }

        return req;
      }),
      map((req) => ({
        ...req,
        data: req.data
          ? adaptPVProductionData(
              req.data,
              (deviceIds.length > 1 && plant.plantSpecificMetadata?.hasPowerMeter) || false,
              plant,
            )
          : req.data,
      })),
      catchError((error: string) =>
        of({ isLoading: false, error: handleAnyError(error, undefined) }),
      ),
      takeUntil(this._destroy$),
    ) as Observable<DataRequest<PVProductionData>>;
  }
}
