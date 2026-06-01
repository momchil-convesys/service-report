import { Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { DataRequest, IntegrationPeriod } from '../../constants';
import { DataAdapter } from '../../data/adapters';
import { ApiService } from '../../data/api';
import { ConsumptionWithIntegrationPeriod } from '../../data/models';

@Injectable({
  providedIn: 'root',
})
export class ConsumptionService {
  constructor(private api: ApiService) {}

  getConsumptionDataWithIntegrationPerod(
    deviceIds: string[],
    timeRange: Date[],
    integrationPeriod: IntegrationPeriod,
  ): Observable<DataRequest<ConsumptionWithIntegrationPeriod[]>> {
    return this.api
      .fetchConsumptionWithIntegrationPeriod(
        deviceIds,
        DataAdapter.modelToDtoTimestamp(timeRange[0]),
        DataAdapter.modelToDtoTimestamp(timeRange[1]),
        integrationPeriod,
      )
      .pipe(
        map((req) => {
          // Accumulate values

          if (req.data && req.data.length > 0) {
            const result: ConsumptionWithIntegrationPeriod = req.data[0];

            for (let i = 1; i < req.data.length; i++) {
              const deviceValues = req.data[i].values;

              for (let j = 0; j < deviceValues.length; ++j) {
                if (j >= result.values.length) {
                  result.values.push(deviceValues[j]);
                } else {
                  const resultValue = result.values[j];

                  resultValue.consumptionFromGridValue =
                    (resultValue.consumptionFromGridValue || 0) +
                    (deviceValues[j].consumptionFromGridValue || 0);

                  resultValue.consumptionFromPvValue =
                    (resultValue.consumptionFromPvValue || 0) +
                    (deviceValues[j].consumptionFromPvValue || 0);
                }
              }
            }

            return { ...req, data: [result] };
          }

          return req;
        }),
        shareReplay(1),
      );
  }
}
