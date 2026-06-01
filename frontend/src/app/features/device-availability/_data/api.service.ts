import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DataRequest } from '../../../constants';
import { ApiService } from '../../../data/api';
import { DevicesAvailabilityAdapter } from './adapters';
import { DevicesAvailability } from './models';

@Injectable()
export class DeviceAvailabilityApiService {
  constructor(private baseApi: ApiService) {}

  fetchDevicesAvailability(
    deviceIds: string[],
    from: string,
    to: string,
  ): Observable<DataRequest<DevicesAvailability>> {
    let queryParams = `?from=${from}&to=${to}`;

    if (deviceIds.length > 0) {
      queryParams += this.baseApi.queryStringForDeviceIds(deviceIds);
    }

    return this.baseApi.fetchObject(
      `/devices-availability${queryParams}`,
      DevicesAvailabilityAdapter,
    );
  }
}
