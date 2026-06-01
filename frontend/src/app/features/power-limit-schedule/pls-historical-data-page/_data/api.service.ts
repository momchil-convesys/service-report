import { Injectable, inject } from '@angular/core';
import { isBefore } from 'date-fns';
import { Observable } from 'rxjs';
import { DataRequest } from 'src/app/constants';
import { ApiService, ServerSentEventsService } from 'src/app/data/api';

import { DatetimeRangeModel } from '../../../../shared/datetime-range-select/models';
import { updateCallback } from './data-updater';
import { MasterGwScheduledPowerLimitHistoricalData } from './dto';

@Injectable()
export class PlsHistoricalDataApiService {
  private baseApi = inject(ApiService);
  private sseApi = inject(ServerSentEventsService);

  get baseUrl(): string {
    return this.baseApi.baseUrl;
  }

  /**
   * GET /power-limit-schedule-historical-data/{plantId}?from={from}&to={to}
   *
   *    Path params:
   *        plantId
   *
   *    Query params:
   *        from
   *        to
   *
   * Returns object of type MasterGwScheduledPowerLimitHistoricalData
   */

  fetchPowerLimitScheduleHistoricalData(
    plantId: string,
    targetRange: DatetimeRangeModel,
  ): Observable<DataRequest<MasterGwScheduledPowerLimitHistoricalData>> {
    const from = targetRange.from.toISOString();
    const to = targetRange.to.toISOString();

    const requestUrl = `/power-limit-schedule-historical-data?plantId=${plantId}&from=${from}&to=${to}`;

    // TODO: check for other time zones (whould we convert new Date() to plant time zone?)
    let liveData = !isBefore(targetRange.to, new Date());

    if (liveData) {
      return this.sseApi.fetch<MasterGwScheduledPowerLimitHistoricalData>(
        requestUrl,
        updateCallback,
      );
    }

    return this.baseApi.fetchObject(requestUrl, undefined);
  }
}
