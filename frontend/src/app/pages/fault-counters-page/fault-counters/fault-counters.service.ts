import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiService } from '../../../data/api';

import { FaultCountersData, FaultCountersWithIntegrationPeriod } from '../../../data/models';

import { addDays, addHours, addMonths, isBefore } from 'date-fns';
import { DataRequest, IntegrationPeriod } from '../../../constants';
import { DataAdapter } from '../../../data/adapters';

@Injectable()
export class FaultCountersService {
  constructor(private api: ApiService) {}

  getFaultCountersData(
    deviceId: string,
    timeRange: Date[],
  ): Observable<DataRequest<FaultCountersData>> {
    return this.api.fetchFaultCounters(
      deviceId,
      DataAdapter.modelToDtoTimestamp(timeRange[0]),
      DataAdapter.modelToDtoTimestamp(timeRange[1]),
    );
  }

  getFaultCountersDataWithIntegrationPerod(
    deviceId: string,
    timeRange: Date[],
    faultId: string,
    integrationPeriod: IntegrationPeriod,
  ): Observable<DataRequest<FaultCountersWithIntegrationPeriod>> {
    return this.api.fetchFaultCountersWithIntegrationPeriod(
      deviceId,
      faultId,
      DataAdapter.modelToDtoTimestamp(timeRange[0]),
      DataAdapter.modelToDtoTimestamp(timeRange[1]),
      integrationPeriod,
    );
  }

  getFaultCountersDataWithIntegrationPerodMock(
    deviceId: string,
    timeRange: Date[],
    faultId: string,
    integrationPeriod: IntegrationPeriod,
  ): Observable<DataRequest<FaultCountersWithIntegrationPeriod>> {
    const values: { timestamp: Date; value: number }[] = [];

    let nextFunction;

    switch (integrationPeriod) {
      case IntegrationPeriod.Hours:
        nextFunction = addHours;
        break;
      case IntegrationPeriod.Days:
        nextFunction = addDays;
        break;
      case IntegrationPeriod.Months:
        nextFunction = addMonths;
        break;
      default:
        nextFunction = addMonths;
    }
    let currentTimestamp = timeRange[0];

    while (isBefore(currentTimestamp, timeRange[1])) {
      const next = nextFunction(currentTimestamp, 1);

      values.push({
        timestamp: currentTimestamp,
        value: Math.floor(Math.random() * 30),
      });

      currentTimestamp = next;
    }

    const data: FaultCountersWithIntegrationPeriod = {
      deviceId,
      faultId,
      from: timeRange[0],
      to: timeRange[1],
      integrationPeriod,

      maxValue: 10,
      values,
    };

    return of({
      isLoading: false,
      data,
    });
  }
}
