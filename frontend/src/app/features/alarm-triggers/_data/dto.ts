//------------------------------------------------------------------------------------
// Alarm triggers

import { User } from '../../../data/models';

export interface TriggerDetailsForDevice {
  deviceId: string;
  trigerId: string;
  trigerType: string;

  status: 'enabled' | 'disabled' | 'muted';
  mutedUntilTimestamp?: 'string'; // if status == 'muted'

  /**
   * Number of triggered events for this device.
   */
  eventsCount: number;
}

export interface AlarmTriggerDTO {
  id?: string;

  title: string;
  description: string; // notes

  enabled: boolean;

  type: string; // AlarmTriggerType;

  conditions: AlarmTriggerConditionDTO[];

  triggerIf: 'all' | 'any';

  lastModified?: {
    user: User;
    timestamp: string;
  };

  created?: {
    user: User;
    timestamp: string;
  };

  // Trigger can be applied only to devices with the same deviceMetadataId.
  // This is important for triggers of type ParameterBoundaries and FaultRecurrence.
  //
  // If set to null then trigger can be applied to any device.
  // E.g. triggers of type DeviceStateChange can be applied to any device.
  deviceMetadataId: string | null;

  affectedDeviceIds: string[];

  /**
   * This field is optional and should be present in the response from backend when retrieving a trigger.
   * For POST/PUT/PATCH requests (when a trigger is being created or edited) it will not be populated.
   */
  affectedDevicesDetails?: TriggerDetailsForDevice[];

  /**
   * An alarm event is fired if a certain condition is satisfied.
   * muteDurationMinutes will prevent excessive firing of events while the condition is still true.
   * E.g:
   * Given the condition "powerParameter > 1500 kW" an event will be fired wneh true.
   * The parameter will be checked on every read from device, but this will not fire an event
   * untill muteDurationMinutes times out.
   *
   * If muteDurationMinutes = -1, then trigger will be disabled after an event is fired.
   */
  muteDurationMinutes: number;

  /**
   * List of users to be notified by email along with the fired events.
   */
  notifyUsersByEmail: User[];

  relatedEventsCount: number;
}

export interface AlarmTriggerConditionFaultRecurrenceDTO {
  faultIds: string[];
  duration: {
    unit: string; // DurationUnit;
    value: number;
  };
  count: number;
}

export interface AlarmTriggerConditionParameterBoundariesDTO {
  parameterId: string;
  comparisonOperator: string; // ComparisonOperator;
  value: number;
  unit: string; // TODO: define units (e.g: EnergyPerHourUnit);
}

export interface AlarmTriggerConditionDeviceStateChangeDTO {
  stateOfInterest: string;
  persistenceSeconds: number;
}

export type AlarmTriggerConditionDTO =
  | AlarmTriggerConditionFaultRecurrenceDTO
  | AlarmTriggerConditionParameterBoundariesDTO
  | AlarmTriggerConditionDeviceStateChangeDTO;
