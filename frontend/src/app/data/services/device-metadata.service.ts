import { Injectable } from '@angular/core';
import { filter, map, Observable, shareReplay } from 'rxjs';
import { DataRequest } from '../../constants';
import { ApiService } from '../api';
import { DeviceMetadata } from '../models';

@Injectable({
  providedIn: 'root',
})
export class DeviceMetadataService {
  private _cache: Observable<DataRequest<DeviceMetadata[]>> | undefined;

  constructor(private api: ApiService) {}

  getDeviceMetadataList(): Observable<DataRequest<DeviceMetadata[]>> {
    if (this._cache) {
      return this._cache;
    }

    this._cache = this.api.fetchDeviceMetadataList().pipe(shareReplay(1));

    return this._cache;
  }

  getDeviceMetadata(id: string): Observable<DataRequest<DeviceMetadata | undefined>> {
    return this.getDeviceMetadataList().pipe(
      filter((request) => !request.isLoading),
      map((request) => request.data?.find((item) => item.id === id)),
      map((metadata) => {
        if (!metadata) {
          throw `Device metadata with id '${id}' was not found!`;
        }

        return {
          isLoading: false,
          data: metadata,
          // error: new Error(`Device metadata with id '${id}' was not found!`),
        };
      }),
    );
  }
}
