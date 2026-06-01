import { Injectable } from '@angular/core';
import { Observable, Subject, catchError, map, of, takeUntil, tap } from 'rxjs';
import { DataRequest } from '../../../constants';
import { ApiService, ServerSentEventsService } from '../../../data/api';
import { handleAnyError, utcToZonedTimeSafe } from '../../../helpers';
import { Scope } from '../models';
import { DeviceMetrics } from './device-metrics.model';
import { pvDeviceMetricsUpdateCallback } from './device-metrics.updater';

@Injectable()
export class DeviceMetricsService {
  private _destroy$ = new Subject<void>();

  constructor(
    private api: ApiService,
    private sse: ServerSentEventsService,
  ) {}

  ngOnDestroy() {
    this._destroy$.next();
  }

  getDeviceMetricsForScope(scope: Scope): Observable<DataRequest<DeviceMetrics[]>> {
    return this._fetchMetrics(scope.plant.id, scope.device?.id).pipe(
      tap((req) => {
        if (req.data && !Array.isArray(req.data)) {
          throw new Error(
            'Unexpected server response: The data returned does not match the expected array of device metrics.',
          );
        }
      }),
      map((req) => ({
        ...req,
        data:
          req.data && scope.device
            ? req.data.filter((value) => value.deviceId === scope.device?.id)
            : req.data,
      })),
      map((req) => ({
        ...req,
        data: req.data
          ? req.data.map((dataForDevice) => ({
              ...dataForDevice,
              timestamp: utcToZonedTimeSafe(dataForDevice.timestamp, scope.plant.timeZone),
            }))
          : undefined,
      })),
      catchError((error: string) =>
        of({ isLoading: false, error: handleAnyError(error, undefined) }),
      ),
      takeUntil(this._destroy$),
    );
  }

  //===============================================================================================
  // API

  private _fetchMetrics(
    plantId: string,
    deviceId: string | undefined | null,
  ): Observable<DataRequest<DeviceMetrics[]>> {
    let requestUrl = `/metrics?plantId=${plantId}`;

    if (deviceId) {
      requestUrl += `&deviceId=${deviceId}`;
    }
    return this.sse
      .fetch<DeviceMetrics[]>(requestUrl, pvDeviceMetricsUpdateCallback)
      .pipe(takeUntil(this._destroy$));
  }
}
