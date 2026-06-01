import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { DataRequest } from '../../../constants';
import { ApiService } from '../../../data/api';
import {
  InverterControlRequest,
  InverterControlRequestBody,
  InverterControlRequestType,
} from './inverter-control.model';

@Injectable()
export class InverterControlApiService {
  private _api = inject(ApiService);

  /**
   * PUT /inverter-control/limit-power (limit-power as a command, not power-limit)
   *
   * Request Body: Object of type InverterControlRequestBody
   *
   * Response: OK or Error
   */

  /**
   * PUT /inverter-control/start
   *
   * Request Body: Object of type InverterControlRequestBody
   *
   * Response: OK or Error
   */

  /**
   * PUT /inverter-control/stop
   *
   * Request Body: Object of type InverterControlRequestBody
   *
   * Response: OK or Error
   */

  sendInverterControlRequest(
    controlType: InverterControlRequestType,
    affectedDevices: string[],
    powerLimitValue: number | null | undefined,
    passcode: string,
  ): Observable<DataRequest<any>> {
    const body: InverterControlRequestBody = {
      affectedDevices,
      passcode,
      powerLimitValue: controlType === 'limit-inverter-power' ? powerLimitValue : undefined,
    };

    let endpoint: string = '/inverter-control';

    switch (controlType) {
      case 'limit-inverter-power':
        endpoint += '/limit-power';
        break;
      case 'start-inverter':
        endpoint += '/start';
        break;
      case 'stop-inverter':
        endpoint += '/stop';
    }

    return this._api.decorateRequest(
      this._api.http
        .put<any>(`${this._api.baseUrl}${endpoint}`, body, {
          headers: this._api.defaultHttpHeaders,
        })
        .pipe(map((response) => ({ data: response }))),
    );
  }

  /**
   * GET /inverter-control?deviceId=1&deviceId=2...
   *
   *    _sort="timestamp"
   *    _order="desc"
   *    _page
   *    _limit
   *    from: timestamp
   *    to: timestamp
   *    deviceId: string[]
   *    commandType: InverterControlRequestType
   *
   * Response: Array of type InverterControlRequest
   */

  fetchInverterControlRequests(
    pageIndex: number,
    pageSize: number,
    deviceIds: string[],
    from?: string,
    to?: string,
    commandType?: InverterControlRequestType,
  ): Observable<DataRequest<InverterControlRequest[]>> {
    let queryParams = `?_sort=timestamp&_order=desc&_page=${pageIndex}&_limit=${pageSize}`;

    if (deviceIds.length > 0) {
      queryParams += this._api.queryStringForDeviceIds(deviceIds);
    }

    if (from) {
      queryParams += `&from=${from}`;
    }

    if (to) {
      queryParams += `&to=${to}`;
    }

    if (commandType) {
      queryParams += `&commandType=${commandType}`;
    }

    return this._api.fetchList(`/inverter-control${queryParams}`, undefined);
  }

  fetchInverterControlRequest(requestId: string): Observable<DataRequest<InverterControlRequest>> {
    return this._api.fetchObject(`/inverter-control/${requestId}`, undefined);
  }
}
