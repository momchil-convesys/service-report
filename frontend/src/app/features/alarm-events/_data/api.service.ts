import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { AlarmTriggerType } from '../../../constants';
import { DataRequest } from '../../../constants/_to-sort';
import { ApiService } from '../../../data/api';
import { AlarmEventAdapter } from './adapter';
import { AlarmEventDTO } from './dto';
import { AlarmEvent } from './models';

const fakeDelay = 0;

@Injectable({
  providedIn: 'root',
})
export class AlarmEventsApiService {
  constructor(private api: ApiService) {}

  //===============================================================================================
  // Alarm events

  /**
   * GET /alarm-events
   * Returns an array of alarm events filtered by query parameters as described.
   * Specific logic is applied here, as alarm triggers and events are identified by a combination of type and id.
   *
   * Pagination parameters:
   *
   *    {_sort}
   *    {_order}
   *    {_page}
   *
   * Filtering parameters:
   *
   *    {deviceId} – multiple, optional // E.g: &deviceId=1&deviceId=2...
   *
   *    {type} – multiple, optional // E.g: &type=pb&type=sc&type=fr...
   *
   *        If {triggerId} is included in the request, then ignore filtering by {type}.
   *        Filtering will be applied according to {triggerId} and {triggerType}.
   *
   *    {triggerId} & {triggerType} – single, optional // E.g: &triggerId=1&triggerType=pb...
   *
   *        If {triggerId} is included in the request, then {triggerType} parameter takes precedence over {type}.
   */
  fetchAlarmEvents(
    pageIndex: number,
    pageSize: number,
    deviceIds: string[],
    alarmTypes: string[],
    triggerInfo:
      | undefined
      | {
          id: string;
          type: string;
        },
    queryOptions: { [key: string]: string } = {},
  ): Observable<DataRequest<AlarmEvent[]>> {
    let queryParams = `?_sort=timestamp&_order=desc&_page=${pageIndex}&_limit=${pageSize}`;

    if (deviceIds.length > 0) {
      queryParams += this.api.queryStringForDeviceIds(deviceIds);
    }

    if (triggerInfo) {
      queryParams += `&triggerId=${triggerInfo.id}&triggerType=${triggerInfo.type}`;
    } else {
      if (alarmTypes.length > 0) {
        queryParams += alarmTypes.map((alarmType) => `&type=${alarmType}`).join('');
      }
    }

    if (queryOptions) {
      Object.keys(queryOptions).forEach((key) => {
        const value = queryOptions[key];
        queryParams += `&${key}=${value}`;
      });
    }

    return this.api.fetchList(`/alarm-events${queryParams}`, AlarmEventAdapter);
  }

  fetchAlarmEvent(eventId: string, type: AlarmTriggerType): Observable<DataRequest<AlarmEvent>> {
    return this.api.fetchObject(`/alarm-events/${type}/${eventId}`, AlarmEventAdapter);
  }

  acknowledgeAlarmEvent(
    eventId: string,
    type: AlarmTriggerType,
  ): Observable<DataRequest<AlarmEvent>> {
    return this.api.decorateRequest(
      this.api.http
        .put<AlarmEventDTO>(`${this.api.baseUrl}/acknowledge-alarm-event/${type}/${eventId}`, {
          headers: this.api.defaultHttpHeaders,
        })
        .pipe(
          delay(fakeDelay),
          map((response) => ({ data: AlarmEventAdapter.dtoToModel(response) })),
        ),
    );
  }
}
