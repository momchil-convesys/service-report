import { Injectable } from '@angular/core';
import { Observable, Subject, catchError, of, takeUntil } from 'rxjs';
import { DataRequest } from '../../../../constants';
import { ApiService, ServerSentEventsService } from '../../../../data/api';
import { Inverter_DTO } from '../../../../data/dtos';
import { handleAnyError } from '../../../../helpers';
import { PVPowerDataForDeviceDTO_NEW, PVPowerDataForPlantDTO_NEW } from './pv-power.dto';
import {
  pvPowerDataForDeviceUpdateCallback,
  pvPowerDataForPlantUpdateCallback,
} from './pv-power.updater';

@Injectable()
export class PVPowerApiService {
  private _destroy$ = new Subject<void>();

  constructor(
    private baseApi: ApiService,
    private sseApi: ServerSentEventsService,
  ) {}

  ngOnDestroy() {
    this._destroy$.next();
  }

  //============================================================================
  // PV Power

  fetchPVPowerDataForPlant(
    plantId: string,
    from: string,
    to: String,
    liveData: boolean,
  ): Observable<DataRequest<PVPowerDataForPlantDTO_NEW>> {
    const requestUrl = `/pv-power-for-plant?plantId=${plantId}&from=${from}&to=${to}`;

    if (liveData) {
      return this.sseApi
        .fetch<PVPowerDataForPlantDTO_NEW>(requestUrl, pvPowerDataForPlantUpdateCallback)
        .pipe(
          catchError((error: string) =>
            of({ isLoading: false, error: handleAnyError(error, undefined) }),
          ),
          takeUntil(this._destroy$),
        );
    }

    return this.baseApi.fetchObject(requestUrl, undefined);
  }

  fetchPVPowerDataForDevice(
    deviceId: string,
    from: string,
    to: String,
    liveData: boolean,
    inverter?: Inverter_DTO,
  ): Observable<DataRequest<PVPowerDataForDeviceDTO_NEW>> {
    let requestUrl = `/pv-power-for-device?deviceId=${deviceId}&from=${from}&to=${to}`;

    if (inverter) {
      requestUrl += `&inverterId=${inverter.inverterId}`;
    }

    if (liveData) {
      return this.sseApi
        .fetch<PVPowerDataForDeviceDTO_NEW>(requestUrl, pvPowerDataForDeviceUpdateCallback)
        .pipe(
          catchError((error: string) =>
            of({ isLoading: false, error: handleAnyError(error, undefined) }),
          ),
          takeUntil(this._destroy$),
        );
    }

    return this.baseApi.fetchObject(requestUrl, undefined);
  }
}
