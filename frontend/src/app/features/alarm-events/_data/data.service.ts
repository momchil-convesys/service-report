import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  filter,
  forkJoin,
  from,
  map,
  merge,
  mergeMap,
  Observable,
  of,
  shareReplay,
  skip,
  switchMap,
  tap,
} from 'rxjs';
import { AlarmTriggerType, deviceStateFullLabels } from '../../../constants';
import { DataRequest } from '../../../constants/_to-sort';
import { WebSocketsService, WsTopic } from '../../../data/api';
import { FaultTemplatesService } from '../../../data/services/fault-templates.service';
import { ParameterTemplatesService } from '../../../data/services/parameter-templates.service';
import { AlarmEventAdapter } from './adapter';
import { AlarmEventsApiService } from './api.service';
import { AlarmEventDTO } from './dto';
import {
  AlarmEvent,
  AlarmEventDetails,
  AlarmEventDetailsDeviceStateChange,
  AlarmEventDetailsFaultRecurrence,
  AlarmEventDetailsParameterBoundaries,
} from './models';

@Injectable({
  providedIn: 'root',
})
export class AlarmEventsService {
  private _unseenAlarmEvents$ = new BehaviorSubject<AlarmEvent[]>([]);
  unseenAlarmEvents$ = this._unseenAlarmEvents$.asObservable();

  private _lastKnownActiveTimestamp = new Date();

  constructor(
    private api: AlarmEventsApiService,
    private ws: WebSocketsService,
    private parameterTemplatesService: ParameterTemplatesService,
    private faultTemplatesService: FaultTemplatesService,
  ) {
    const missedEvents$ = this.ws.socketConnectedEvent$.pipe(
      skip(1),
      switchMap(() =>
        this.api.fetchAlarmEvents(1, 100, [], [], undefined, {
          from: this._lastKnownActiveTimestamp.toISOString(),
          to: new Date().toISOString(),
        }),
      ),
      map((req) => req.data),
      filter((data) => data !== undefined),
      mergeMap((array) => from(array)),
    );

    const eventsFromWs$ = this.ws
      .getWebSocketStreamOnTopic<AlarmEventDTO>(WsTopic.AlarmEvents)
      .pipe(
        map((wsMessage) => wsMessage.message),
        map((dto) => AlarmEventAdapter.dtoToModel(dto)),
        catchError((err) => {
          console.warn('Failed to process data received over web socket. Error: ', err);
          return of(null);
        }),
        filter((alarmEvent) => alarmEvent !== null),
        map((alarmEvent) => {
          alarmEvent.displayNameRequest = this._constructDisplayNameRequest(
            alarmEvent.details,
            alarmEvent.alarmType,
          );

          return alarmEvent;
        }),
      );

    const eventsLiveStream$ = merge(missedEvents$, eventsFromWs$).pipe(
      tap(() => (this._lastKnownActiveTimestamp = new Date())),
      shareReplay(1),
    );

    eventsLiveStream$.subscribe((alarmEvent) => {
      const currentValue = this._unseenAlarmEvents$.getValue();
      this._unseenAlarmEvents$.next([alarmEvent, ...currentValue]);
    });
  }

  markAllAsSeen() {
    this._unseenAlarmEvents$.next([]);
  }

  getUnseen(): AlarmEvent[] {
    return this._unseenAlarmEvents$.getValue();
  }

  getAlarmEvents(
    pageIndex: number,
    pageSize: number,
    deviceIds: string[],
    alarmTypes: string[], // TODO: define type,
    triggerInfo?: {
      id: string;
      type: string;
    },
  ): Observable<DataRequest<AlarmEvent[]>> {
    return this.api.fetchAlarmEvents(pageIndex, pageSize, deviceIds, alarmTypes, triggerInfo).pipe(
      map((req) => {
        req.data?.forEach((alarmEvent) => {
          alarmEvent.displayNameRequest = this._constructDisplayNameRequest(
            alarmEvent.details,
            alarmEvent.alarmType,
          );
        });

        return req;
      }),
    );
  }

  getAlarmEvent(id: string, type: AlarmTriggerType): Observable<DataRequest<AlarmEvent>> {
    return this.api.fetchAlarmEvent(id, type);
  }

  acknowledgeAlarmEvent(
    eventId: string,
    type: AlarmTriggerType,
  ): Observable<DataRequest<AlarmEvent>> {
    return this.api.acknowledgeAlarmEvent(eventId, type).pipe(shareReplay(1));
  }

  private _constructDisplayNameRequest(
    detailsArray: AlarmEventDetails[],
    type: AlarmTriggerType,
  ): Observable<string> {
    switch (type) {
      case AlarmTriggerType.ParameterBoundaries: {
        const details = <AlarmEventDetailsParameterBoundaries[]>detailsArray;
        const asyncParameterNames = details.map((detail) =>
          this.parameterTemplatesService
            .getDeviceParameterById(detail.parameterId)
            .pipe(map((parameter) => parameter?.name)),
        );

        return forkJoin(asyncParameterNames).pipe(
          map((names) => {
            return names.join(' & ');
          }),
        );
      }
      case AlarmTriggerType.FaultRecurrence: {
        const details = <AlarmEventDetailsFaultRecurrence[]>detailsArray;
        const asyncFaultNames = details.map((detail) =>
          this.faultTemplatesService.getFaultDefinitionById(detail.faultId).pipe(
            map((fault) => {
              return fault ? `${fault.code} ${fault.name}` : $localize`Unknown fault`;
            }),
          ),
        );

        return forkJoin(asyncFaultNames).pipe(
          map((names) => {
            return names.join(' & ');
          }),
        );
      }
      case AlarmTriggerType.DeviceStateChange: {
        const details = <AlarmEventDetailsDeviceStateChange[]>detailsArray;
        const states = details.map((detail) => deviceStateFullLabels[detail.state]).join(' & ');
        return of($localize`Device state changed to` + ` "${states}"`);
      }
      default:
        return of($localize`Unknown event type.`);
    }
  }
}
