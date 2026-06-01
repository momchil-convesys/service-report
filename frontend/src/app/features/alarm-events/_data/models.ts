import { Observable } from 'rxjs';
import { AlarmTriggerType, DeviceState } from '../../../constants';
import { User } from '../../../data/models';

//------------------------------------------------------------------------------------
// Alarm Events
//
// Defines events that are caused by alarm triggers

export interface AlarmEvent {
  id: string; // Event id (unique for the system)
  timestamp: string; // Time of triggering the event

  triggerInfo: null | {
    triggerId: string; // References the trigger that caused the event (origin)
    lastModifiedTimestamp: string;
  };

  deviceId: string; // Affected device

  displayNameRequest: Observable<string>; // Calculated

  alarmType: AlarmTriggerType;

  notifiedByEmail: boolean | null;

  acknowledged?: {
    user: User;
    timestamp: string;
  };

  details: AlarmEventDetails[];
}

export interface AlarmEventDetailsFaultRecurrence {
  faultId: string; // The particular fault that triggered the event
  interval: {
    // Exact range in time while detection/counting mechanism was on.
    // Its length could be greater or equal than [ first -> last ] occurence.
    from: Date;
    to: Date;
  };
  occurrences: Date[];

  // E.g:
  // 12:00 (interval.from) Started watching fault X
  // 12:07 (occurrences[0]) First occurence of fault X
  //    ...other occurrences
  // 12:30 (occurrences[N]) Last (N-th) occurence of fault X
  // 12:31 (interval.to) Stopped watching
}

export interface AlarmEventDetailsParameterBoundaries {
  parameterId: string;

  value: number;
  unit: string;
  timestamp: Date;
}

export interface AlarmEventDetailsDeviceStateChange {
  state: DeviceState;
  timestamp: Date;
  duration: Duration;
}

export type AlarmEventDetails =
  | AlarmEventDetailsFaultRecurrence
  | AlarmEventDetailsParameterBoundaries
  | AlarmEventDetailsDeviceStateChange;
