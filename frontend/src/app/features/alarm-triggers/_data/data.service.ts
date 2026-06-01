import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, shareReplay } from 'rxjs';
import { AlarmTriggerType, DataRequest } from '../../../constants';
import { AlarmTriggersApiService } from './api.service';
import { AlarmTrigger } from './models';

@Injectable({
  providedIn: 'root',
})
export class AlarmTriggersService {
  private _listNeedsReload$ = new BehaviorSubject<void>(undefined);
  listNeedsReload$: Observable<void> = this._listNeedsReload$.asObservable();

  constructor(private api: AlarmTriggersApiService) {}

  getAlarmTrigger(id: string, type: AlarmTriggerType): Observable<DataRequest<AlarmTrigger>> {
    return this.api.fetchAlarmTrigger(id, type);
  }

  getAlarmTriggers(
    pageIndex: number,
    pageSize: number,
    deviceIds: string[],
    alarmTypes: AlarmTriggerType[],
  ): Observable<DataRequest<AlarmTrigger[]>> {
    return this.api.fetchAlarmTriggers(pageIndex, pageSize, deviceIds, alarmTypes);
  }

  createAlarmTrigger(alarmTrigger: AlarmTrigger): Observable<DataRequest<AlarmTrigger>> {
    return this.api.createAlarmTrigger(alarmTrigger).pipe(shareReplay(1));
  }

  updateAlarmTrigger(alarmTrigger: AlarmTrigger): Observable<DataRequest<AlarmTrigger>> {
    return this.api.updateAlarmTrigger(alarmTrigger).pipe(shareReplay(1));
  }

  deleteAlarmTrigger(
    id: string,
    type: AlarmTriggerType,
    deleteRelatedEvents: boolean,
  ): Observable<DataRequest<unknown>> {
    return this.api.deleteAlarmTrigger(id, type, deleteRelatedEvents).pipe(shareReplay(1));
  }

  reloadAlarmTriggers() {
    this._listNeedsReload$.next();
  }
}
