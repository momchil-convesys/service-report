import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { DataRequest } from '../../../../constants';
import { ApiService } from '../../../../data/api';
import { Plant } from '../../../../data/models';
import { zonedTimeToUtcSafe } from '../../../../helpers';

interface ScheduleAdjustment_RequestBody_DTO {
  from: string;
  to: string;
  newTargetValue: number | null;
  passcode: string;
}

@Injectable()
export class PlsManualAdjustmentsDataService {
  constructor(private api: ApiService) {}

  adjustScheduleInterval(
    plant: Plant | undefined,
    interval: Interval,
    targetValue_MWh: number | null,
    passcode: string,
  ): Observable<DataRequest<void>> {
    let endpoint: string = `${this.api.baseUrl}/manual-schedule-adjustments?plantId=${plant?.id}`;

    const body: ScheduleAdjustment_RequestBody_DTO = {
      from: zonedTimeToUtcSafe(new Date(interval.start), plant?.timeZone).toISOString(),
      to: zonedTimeToUtcSafe(new Date(interval.end), plant?.timeZone).toISOString(),
      newTargetValue: targetValue_MWh,
      passcode,
    };

    return this.api.decorateRequest(
      this.api.http
        .post<any>(endpoint, body, {
          headers: this.api.defaultHttpHeaders,
        })
        .pipe(map((response) => ({ data: response }))),
    );
  }
}
