import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DataRequest } from '../../../constants';
import { ApiService } from '../../../data/api';
import { ErrorStackDTO } from './error-stack.dto';

@Injectable({
  providedIn: 'root',
})
export class ErrorStacksApiService {
  constructor(private baseApi: ApiService) {}

  fetchErrorStacksForPlant(plantId: string): Observable<DataRequest<ErrorStackDTO[]>> {
    return this.baseApi.fetchList(
      `/error-stacks?plantId=${plantId}&_sort=timestamp&_order=desc`,
      undefined,
    );
  }

  fetchErrorStacks(
    plantId: string | undefined,
    deviceId: string | undefined,
    page: number,
    limit: number,
    queryOptions: { [key: string]: string } = {},
  ): Observable<DataRequest<ErrorStackDTO[]>> {
    let queryParams = `?_sort=timestamp&_order=desc&_page=${page}&_limit=${limit}`;

    if (deviceId) {
      queryParams += `&deviceId=${deviceId}`;
    }

    if (plantId) {
      queryParams += `&plantId=${plantId}`;
    }

    if (queryOptions) {
      Object.keys(queryOptions).forEach((key) => {
        const value = queryOptions[key];
        queryParams += `&${key}=${value}`;
      });
    }

    return this.baseApi.fetchList(`/error-stacks${queryParams}`, undefined);
  }

  fetchErrorStack(deviceId: string, stackId: string): Observable<DataRequest<ErrorStackDTO>> {
    return this.baseApi.fetchObject(`/devices/${deviceId}/error-stacks/${stackId}`, undefined);
  }
}
