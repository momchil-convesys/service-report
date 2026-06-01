import { AlarmTriggerType, DeviceState, DurationUnit } from '../../../constants';
import { User } from '../../../data/models';
import { TriggerDetailsForDevice } from './dto';

//------------------------------------------------------------------------------------
// Alarm Triggers

export enum ComparisonOperator {
  LT = 'lt',
  GT = 'gt',
  Equal = 'eq',
  NotEqual = 'neq',
}

export const comparisonOperatorsKeys: string[] = Object.keys(ComparisonOperator);
export const comparisonOperatorsValues: string[] = Object.values(ComparisonOperator);

export const comparisonOperatorLabels: {
  [k: string]: string;
} = {
  [ComparisonOperator.LT]: $localize`is less than`,
  [ComparisonOperator.GT]: $localize`is greater than`,
  [ComparisonOperator.Equal]: $localize`equals`,
  [ComparisonOperator.NotEqual]: $localize`is not`,
};

export interface AlarmTrigger {
  id?: string;

  title: string;
  description: string; // notes

  enabled: boolean;

  type: AlarmTriggerType;

  conditions: AlarmConditionType[];

  triggerIf: 'all' | 'any';

  // Last modified date is important in the following case:
  // 1. The trigger causes an alarm event based on certain condition.
  // 2. The alarm event has a reason (refence to the trigger condition) that caused the alarm event.
  // 3. Trigger condition is changed/removed.
  // 4. The alarm event is still existing somewhere in history, but the reason that caused it is obsolete.
  // Behaviour: If tha alarm event occured before last modification of the trigger,
  // a warning will be shown, explaining that the trigger is modified and the reason for the alarm event is possibly obsolete.
  lastModified?: {
    // userId: string; // user ID
    user: User;
    timestamp: Date;
  };

  created?: {
    // userId: string; // user ID
    user: User;
    timestamp: Date;
  };

  affectedDeviceIds: string[];

  affectedDevicesDetails?: TriggerDetailsForDevice[];

  deviceMetadataId: string | null;

  muteDurationMinutes: number;

  notifyUsersByEmail: User[];

  relatedEventsCount: number;
}

// Prefixed with "Custom" to avoid conflicts with date-fns Duration interface
export interface CustomDuration {
  unit: DurationUnit;
  value: number;
}

export interface AlarmConditionFaultRecurrence {
  faultIds: string[];
  duration: CustomDuration;
  count: number;
}

export interface AlarmConditionParameterBoundaries {
  parameter: string;
  comparisonOperator: ComparisonOperator;
  value: number;
  unit: string; // TODO: define units (e.g: EnergyPerHourUnit);
}

export interface AlarmConditionDeviceStateChange {
  stateOfInterest: DeviceState;

  // State persistency
  // Example: Value of 60 seconds means that an alarm event will be triggered
  // only if the device was in stateOfInterest for at least 60  seconds.
  persistenceSeconds: number;
}

export type AlarmConditionType =
  | AlarmConditionFaultRecurrence
  | AlarmConditionParameterBoundaries
  | AlarmConditionDeviceStateChange;

export interface TriggerDeleteAction {
  trigger: AlarmTrigger;
  deleteRelatedEvents: boolean;
}
