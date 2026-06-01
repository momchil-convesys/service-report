import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DataRequest } from '../../../constants';
import { ApiService } from '../../../data/api';
import { InverterTemperatureSensorsDataDTO } from './dtos';

@Injectable()
export class TemperatureSensorsApiService {
  constructor(private baseApi: ApiService) {}

  fetchData(
    deviceId: string,
    from: string,
    to: string,
  ): Observable<DataRequest<InverterTemperatureSensorsDataDTO>> {
    let queryParams = `?deviceId=${deviceId}&from=${from}&to=${to}`;

    return this.baseApi.fetchObject(`/inverter-temperature-sensors-data${queryParams}`);

    //   return of({
    //     isLoading: false,
    //     data: {
    //       ...exampleResponse,
    //       targetDate,
    //       dataPoints: exampleResponse.dataPoints.map((point) => ({
    //         ...point,
    //         timestamp: new Date(
    //           new Date(point.timestamp).setDate(new Date(targetDate).getDate())
    //         ).toISOString(),
    //       })),
    //       // dataPoints: [],
    //     },
    //   }).pipe(
    //     delay(1000),
    //     startWith({
    //       isLoading: true,
    //     })
    //   );
  }
}
