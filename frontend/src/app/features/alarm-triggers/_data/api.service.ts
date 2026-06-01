import { Injectable } from '@angular/core';
import { delay, map, Observable, tap } from 'rxjs';
import { AlarmTriggerType, DataRequest } from '../../../constants';
import { ApiService } from '../../../data/api';
import { AlarmTriggerAdapter } from './adapter';
import { TriggerDetailsForDevice } from './dto';
import { AlarmTrigger } from './models';

@Injectable({
  providedIn: 'root',
})
export class AlarmTriggersApiService {
  constructor(private api: ApiService) {}

  //===============================================================================================
  // Alarm triggers

  fetchAlarmTrigger(id: string, type: AlarmTriggerType): Observable<DataRequest<AlarmTrigger>> {
    return this.api.fetchObject(`/alarm-triggers/${type}/${id}`, AlarmTriggerAdapter);
  }

  fetchAlarmTriggers(
    pageIndex: number,
    pageSize: number,
    deviceIds: string[],
    alarmTypes: string[],
  ): Observable<DataRequest<AlarmTrigger[]>> {
    let queryParams = `?_sort=created.timestamp&_order=desc`;
    if (pageIndex !== undefined) {
      queryParams += `&_page=${pageIndex}`;
    }

    if (pageSize !== undefined) {
      queryParams += `&_limit=${pageSize}`;
    }

    if (deviceIds.length > 0) {
      queryParams += this.api.queryStringForDeviceIds(deviceIds);
    }

    if (alarmTypes.length > 0) {
      queryParams += alarmTypes.map((alarmType) => `&type=${alarmType}`).join('');
    }

    return this.api.fetchList(`/alarm-triggers${queryParams}`, AlarmTriggerAdapter);
  }

  createAlarmTrigger(item: AlarmTrigger): Observable<DataRequest<AlarmTrigger>> {
    return this.api.createItem(`/alarm-triggers/${item.type}`, AlarmTriggerAdapter, item);
  }

  updateAlarmTrigger(item: AlarmTrigger): Observable<DataRequest<AlarmTrigger>> {
    if (!item.id) {
      throw 'Invalid parameters! Missing ID in alarm trigger';
    }

    return this.api.updateItem(
      `/alarm-triggers/${item.type}/${item.id}`,
      AlarmTriggerAdapter,
      item,
    );
  }

  deleteAlarmTrigger(
    id: string,
    type: AlarmTriggerType,
    deleteRelatedEvents: boolean,
  ): Observable<DataRequest<unknown>> {
    return this.api.deleteItem(
      `/alarm-triggers/${type}/${id}?deleteRelatedEvents=${deleteRelatedEvents}`,
    );
  }

  //===============================================================================================
  // Alarm triggers -> affected devices

  alterTriggerStateForDevices(
    triggerId: string,
    triggerType: AlarmTriggerType,
    deviceIds: string[],
    action: 'enable' | 'disable' | 'unmute',
  ): Observable<DataRequest<TriggerDetailsForDevice[]>> {
    const queryParams = `?` + deviceIds.map((deviceId) => `deviceId=${deviceId}`).join('&');

    return this.api.decorateRequest(
      this.api.http
        .put<TriggerDetailsForDevice[]>(
          `${this.api.baseUrl}/alarm-triggers/${triggerType}/${triggerId}/affected-devices/${action}${queryParams}`,
          {},
          {
            headers: this.api.defaultHttpHeaders,
          },
        )
        .pipe(
          delay(0),
          tap((response) => {
            // TODO: double validation
            if (!response) {
              throw new Error($localize`Server returned empty response after updating an item!`);
            }
          }),
          map((response) => ({ data: response })),
        ),
    );
  }

  // GET /alarm-triggers/${type}/${id}/affected-devices
  // Returns an array of TriggerSettingsForDevice

  // GET /alarm-triggers/${type}/${id}/affected-devices/${deviceId}
  // Returns object of type TriggerSettingsForDevice

  // PUT /alarm-triggers/${type}/${id}/affected-devices/enable?deviceId=1&deviceId=2
  // PUT /alarm-triggers/${type}/${id}/affected-devices/unmute?deviceId=1&deviceId=2
  // PUT /alarm-triggers/${type}/${id}/affected-devices/disable?deviceId=1&deviceId=2
  // Return array of TriggerSettingsForDevice[]
}
