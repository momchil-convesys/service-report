import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DataRequest } from '../../../constants';
import { InverterControlApiService } from './api.service';
import { InverterControlRequest, InverterControlRequestType } from './inverter-control.model';

@Injectable()
export class InverterControlService {
  shouldUpdateHistoryList$ = new BehaviorSubject<boolean>(true);

  constructor(private api: InverterControlApiService) {}

  getInverterControlRequests(
    pageIndex: number,
    pageSize: number,
    deviceIds: string[],
    from?: string,
    to?: string,
    commandType?: InverterControlRequestType,
  ): Observable<DataRequest<InverterControlRequest[]>> {
    return this.api.fetchInverterControlRequests(
      pageIndex,
      pageSize,
      deviceIds,
      from,
      to,
      commandType,
    );
  }

  getInverterControlRequest(requestId: string): Observable<DataRequest<InverterControlRequest>> {
    return this.api.fetchInverterControlRequest(requestId);
  }

  sendInverterControlRequest(
    controlType: InverterControlRequestType,
    affectedDevices: string[],
    powerLimitValue: number | null | undefined,
    passcode: string,
  ): Observable<DataRequest<any>> {
    return this.api.sendInverterControlRequest(
      controlType,
      affectedDevices,
      powerLimitValue,
      passcode,
    );
  }
}
