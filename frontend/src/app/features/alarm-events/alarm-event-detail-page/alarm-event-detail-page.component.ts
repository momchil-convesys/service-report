import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { isAfter } from 'date-fns';
import {
  Observable,
  Subject,
  exhaustMap,
  filter,
  map,
  merge,
  share,
  shareReplay,
  switchMap,
} from 'rxjs';
import { AccessControlPermission, AlarmTriggerType } from '../../../constants';
import { DataRequest } from '../../../constants/_to-sort';
import { DeviceParameterDefinition, FaultDefinition } from '../../../data/models';
import { FaultTemplatesService } from '../../../data/services/fault-templates.service';
import { ParameterTemplatesService } from '../../../data/services/parameter-templates.service';
import { UsersService } from '../../../data/services/users.service';
import { AlarmEventsService } from '../_data/data.service';
import {
  AlarmEvent,
  AlarmEventDetailsDeviceStateChange,
  AlarmEventDetailsFaultRecurrence,
  AlarmEventDetailsParameterBoundaries,
} from '../_data/models';

interface QueryParams {
  type: string;
  eventId: string;
}

@Component({
  selector: 'app-alarm-event-detail-page',
  templateUrl: './alarm-event-detail-page.component.html',
  styleUrls: ['./alarm-event-detail-page.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AlarmEventDetailPageComponent {
  alarmEvent$: Observable<AlarmEvent | undefined>;
  alarmEventRequest$: Observable<DataRequest<AlarmEvent>>;

  acknowledgeClick$ = new Subject<{ id: string; type: AlarmTriggerType }>();
  akcnowledgeRequest$: Observable<DataRequest<AlarmEvent>>;

  AlarmTriggerType = AlarmTriggerType;

  showCloseButton$: Observable<boolean>;

  eventFiredImmediately = $localize`Event was fired immediately`;

  constructor(
    private route: ActivatedRoute,
    private dataService: AlarmEventsService,
    private faultTemplatesService: FaultTemplatesService,
    private parameterTemplatesService: ParameterTemplatesService,
    private usersService: UsersService,
  ) {
    this.showCloseButton$ = this.route.url.pipe(
      map((segments) => segments.findIndex((segment) => segment.path === 'detail') >= 0),
    );

    this.alarmEventRequest$ = this.route.paramMap.pipe(
      map((params) => {
        return <QueryParams>{
          eventId: params.get('eventId') || '',
          type: params.get('type') || '',
        };
      }),
      switchMap((queryParams: QueryParams) =>
        this.dataService.getAlarmEvent(queryParams.eventId, queryParams.type as AlarmTriggerType),
      ),
      shareReplay(1),
    );

    this.akcnowledgeRequest$ = this.acknowledgeClick$.pipe(
      exhaustMap(({ id, type }) => this.dataService.acknowledgeAlarmEvent(id, type)),
      share(),
    );

    this.alarmEvent$ = merge(this.alarmEventRequest$, this.akcnowledgeRequest$).pipe(
      filter((request) => request.data !== undefined),
      map((request) => request.data),
    );
  }

  faultById(id: string): Observable<FaultDefinition | undefined> {
    return this.faultTemplatesService.getFaultDefinitionById(id);
  }

  parameterNameById(id: string): Observable<DeviceParameterDefinition | undefined> {
    return this.parameterTemplatesService.getDeviceParameterById(id);
  }

  detailsForParameterBoundaries(eventItem: AlarmEvent): AlarmEventDetailsParameterBoundaries[] {
    return <AlarmEventDetailsParameterBoundaries[]>eventItem.details;
  }

  detailsForFaultRecurrence(eventItem: AlarmEvent): AlarmEventDetailsFaultRecurrence[] {
    return <AlarmEventDetailsFaultRecurrence[]>eventItem.details;
  }

  detailsForDeviceStateChange(eventItem: AlarmEvent): AlarmEventDetailsDeviceStateChange[] {
    return <AlarmEventDetailsDeviceStateChange[]>eventItem.details;
  }

  isTriggerModifiedAfterEventWasFired(
    triggerModificationTimestamp: string,
    eventTimestamp: string,
  ): boolean {
    return isAfter(new Date(triggerModificationTimestamp), new Date(eventTimestamp));
  }

  onAcknowledge(eventId: string, eventType: AlarmTriggerType) {
    this.acknowledgeClick$.next({ id: eventId, type: eventType });
  }

  isCurrentUserAuthorizedToAccessAlarmTriggers(): boolean {
    return this.usersService.hasCurrentUserPermission(AccessControlPermission.AlarmTriggers_Manage);
  }
}
