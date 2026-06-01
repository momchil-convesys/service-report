import { Injectable } from '@angular/core';
import { Observable, Subject, map, of, shareReplay, takeUntil } from 'rxjs';
import { DataRequest } from '../../../constants';
import { BatteriesApiService } from './api.service';
import { MonbatBatteryString } from './models';

@Injectable()
export class MonbatBatteryStringDataService {
  private _destroy$ = new Subject<void>();
  private _activeSubscriptions = new Map<string, Observable<DataRequest<MonbatBatteryString[]>>>();

  constructor(private api: BatteriesApiService) {}

  getBatteryStringsForDevice(deviceId: string): Observable<DataRequest<MonbatBatteryString[]>> {
    // Check if we already have an active subscription for this device
    if (this._activeSubscriptions.has(deviceId)) {
      return this._activeSubscriptions.get(deviceId)!;
    }

    // Create new subscription
    const subscription = this.api.fetchBatteryStringsForDevice(deviceId).pipe(
      // Assign indices to battery strings as they are used in route instead of ids
      map((req) => {
        return {
          ...req,
          data: req.data?.map((batteryString, index) => ({
            ...batteryString,
            index: index.toString(),
          })),
        };
      }),
      shareReplay(1),
      takeUntil(this._destroy$),
    );

    // Store the subscription to prevent duplicates
    this._activeSubscriptions.set(deviceId, subscription);

    return subscription;
  }

  getBatteryStringByIndex(
    stringIndex: string,
    deviceId: string,
  ): Observable<MonbatBatteryString | undefined> {
    if (this._activeSubscriptions.has(deviceId)) {
      const index = parseInt(stringIndex);
      const res = this._activeSubscriptions.get(deviceId)?.pipe(map((req) => req.data?.[index]));

      if (!res) {
        console.error(`String at index ${stringIndex} was not found!`);
        return of(undefined);
      }

      return res;
    }

    return this.getBatteryStringsForDevice(deviceId).pipe(
      map((req) => req.data?.find((string) => string.index === stringIndex)),
    );
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._activeSubscriptions.clear();
  }
}
