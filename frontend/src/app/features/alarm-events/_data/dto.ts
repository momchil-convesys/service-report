import { User } from '../../../data/models';

export interface AlarmEventDTO {
  id: string; // Event id (unique for the system)
  timestamp: string; // Time of triggering the event

  /**
   * Trigger info should be null if trigger was deleted.
   * Otherwise, trigger ID and last modification timestamp should be provided.
   *
   * lastModifiedTimestamp will be used to compare against event timestamp
   * to inform the user that trigger conditions may not be relevant anymore.
   */
  triggerInfo: null | {
    triggerId: string; // References the trigger that caused the event (origin)
    lastModifiedTimestamp: string;
  };

  deviceId: string; // Affected device

  type: string; // AlarmTriggerType;
  details: AlarmEventDetailsDTO[];

  /**
   *
   */
  acknowledged?: {
    user: User;
    timestamp: string;
  };

  /**
   * Whether an email was sent at the time of firing the event.
   * This may differ from current trigger settings,
   * as the trigger may be edited after the particular event has been fired.
   */
  notifiedByEmail: boolean | null;

  // PUT /acknowledge-alarm-event/{type}/{eventId}
  // Response:
  // edited event
}

// A particular alarm event of this type basically says that
// "Fault X occured 130 times from 12 Feb to 11 Mar" and the event is fired because
// there is a configured alarm trigger that says
// "If [Fault X, Fault Y, Fault Z, ...] occurs more that 100 times in a span of 30 days..."
//
export interface AlarmEventDetailsFaultRecurrenceDTO {
  faultId: string; // The particular fault that triggered the event
  interval: {
    // Exact range in time while detection/counting mechanism was on.
    // Its length could be greater or equal than [ first -> last ] occurence.
    from: string;
    to: string;
  };
  occurrences: string[]; // list of timestamps
}

export interface AlarmEventDetailsParameterBoundariesDTO {
  parameterId: string;

  value: number;
  unit: string;
  timestamp: string;
}

export interface AlarmEventDetailsDeviceStateChangeDTO {
  state: string;

  // The exact time when device state changed.
  timestamp: string;

  // Duration in seconds .
  // Zero means that event was fired immediately after state change was detected.
  // Positive value, e.g. 60, means that device was in the same state for 60 seconds (from "timestimp" until the event was fired).
  duration: number;
}

export type AlarmEventDetailsDTO =
  | AlarmEventDetailsFaultRecurrenceDTO
  | AlarmEventDetailsParameterBoundariesDTO
  | AlarmEventDetailsDeviceStateChangeDTO;
