export enum AlarmTriggerType {
  FaultRecurrence = 'fr',
  ParameterBoundaries = 'pb',
  DeviceStateChange = 'sc',
}

export const triggerStatusLabels = {
  ['enabled']: $localize`Enabled`,
  ['disabled']: $localize`Disabled`,
  ['muted']: $localize`Muted`,
};

export const alarmTriggerTypeStringValues = Object.values(AlarmTriggerType) as string[];

// export const alarmConfigTitles: { [key in AlarmTriggerType]: string } = {
//   [AlarmTriggerType.FaultRecurrence]: 'Fault recurrence',
//   [AlarmTriggerType.ParameterBoundaries]: 'Parameter boundaries',
//   [AlarmTriggerType.DeviceStateChange]: 'Device state change',
// };
export const alarmConfigTitles: { [key in AlarmTriggerType]: string } = {
  [AlarmTriggerType.FaultRecurrence]: $localize`Fault recurrence`,
  [AlarmTriggerType.ParameterBoundaries]: $localize`Parameter boundaries`,
  [AlarmTriggerType.DeviceStateChange]: $localize`Device state change`,
};

export const alarmConfigShortLabels: { [key in AlarmTriggerType]: string } = {
  [AlarmTriggerType.FaultRecurrence]: 'FR',
  [AlarmTriggerType.ParameterBoundaries]: 'PB',
  [AlarmTriggerType.DeviceStateChange]: 'SC',
};

export const alarmConfigDescriptions: { [key in AlarmTriggerType]: string } = {
  [AlarmTriggerType.FaultRecurrence]:
    'Fire an alarm when a predefined fault(s) occurrence exceeds a predefined count in a predefined range of time.',
  [AlarmTriggerType.ParameterBoundaries]:
    'Fire an alarm when certain parameters exceed predifined boundaries.',
  [AlarmTriggerType.DeviceStateChange]:
    'Fire an alarm when device state changes to any of predefined states.',
};
