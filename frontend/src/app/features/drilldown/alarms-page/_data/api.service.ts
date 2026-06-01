import { Injectable } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { map } from 'rxjs/operators';
import { SSE_DataRequest } from '../../../../constants';
import { ServerSentEventsService } from '../../../../data/api';

import { PlantsService } from '../../../../data/services/plants.service';
import { utcToZonedTimeSafe } from '../../../../helpers';
import { DatetimeRangeModel } from '../../../../shared/datetime-range-select/models';
import { InverterAlarmHistoricalItem_DTO } from './dto';
import { activeAlarmsUpdateCallback } from './updater';

@Injectable()
export class ApiService {
  private _destroy$ = new Subject<void>();

  constructor(
    private sse: ServerSentEventsService,
    private plantsService: PlantsService,
  ) {}

  /**
   * /active-alarms ? plantId: string
   *
   * Response: Array of objects of type InverterAlarmHistoricalItem_DTO
   */

  fetchActiveAlarms(
    plantId: string,
  ): Observable<SSE_DataRequest<InverterAlarmHistoricalItem_DTO[]>> {
    const requestUrl = `/active-alarms?plantId=${plantId}`;
    return this.sse
      .fetch<InverterAlarmHistoricalItem_DTO[]>(requestUrl, activeAlarmsUpdateCallback)
      .pipe(
        map((req) => ({
          ...req,
          data: req.data
            ? req.data.map((ts) => this._adaptInverterAlarmHistoricalItemDTO_mutate(ts, plantId))
            : undefined,
        })),
        takeUntil(this._destroy$),
      );
  }

  /**
   * /alarms-history ? plantId: string ? from: string ? to: string
   *
   * Response: Array of objects of type InverterAlarmHistoricalItem_DTO
   */

  fetchAlarms(
    plantId: string,
    timeRange: DatetimeRangeModel,
  ): Observable<SSE_DataRequest<InverterAlarmHistoricalItem_DTO[]>> {
    const requestUrl = `/alarms-history?plantId=${plantId}&from=${timeRange.from.toISOString()}&to=${timeRange.to.toISOString()}`;
    return this.sse
      .fetch<InverterAlarmHistoricalItem_DTO[]>(requestUrl, activeAlarmsUpdateCallback)
      .pipe(
        map((req) => ({
          ...req,
          data: req.data
            ? req.data.map((ts) => this._adaptInverterAlarmHistoricalItemDTO_mutate(ts, plantId))
            : undefined,
        })),
        takeUntil(this._destroy$),
      );
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _adaptInverterAlarmHistoricalItemDTO_mutate(
    dto: InverterAlarmHistoricalItem_DTO,
    plantId: string,
  ): InverterAlarmHistoricalItem_DTO {
    const plantTimeZone = this.plantsService.getCachedPlantById(plantId)?.timeZone;

    dto.inverterEvents.forEach((inverter) => {
      inverter.intervalZoned = {
        start: utcToZonedTimeSafe(inverter.interval.start, plantTimeZone),
        end: inverter.interval.end
          ? utcToZonedTimeSafe(inverter.interval.end, plantTimeZone)
          : null,
      };
    });

    dto.inverterEvents.sort(
      (a, b) => b.intervalZoned.start.getTime() - a.intervalZoned.start.getTime(),
    );

    return dto;
  }
}
