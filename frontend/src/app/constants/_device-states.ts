// Mind the order as it is used when displaying a list of states
export enum DeviceState {
  On = 'on',
  Warning = 'wrn',
  Error = 'err',
  Standby = 'stb',
  Off = 'off',
  NoCommunication = 'nc',
  Invalid = 'inv',
  ServiceMode = 'srvc',
  Intermediate = 'int',
}

export const deviceStatesOrdered: DeviceState[] = Object.values(DeviceState) as DeviceState[];

export const deviceStateStringValues = <string[]>Object.values(DeviceState);
export const deviceStateStringValuesReversed = [...deviceStateStringValues].reverse();

export const deviceStateShortLabels: {
  [state in DeviceState]: string;
} = {
  [DeviceState.On]: $localize`ON`,
  [DeviceState.Off]: $localize`OFF`,
  [DeviceState.Warning]: $localize`WRN`,
  [DeviceState.Error]: $localize`ERR`,
  [DeviceState.NoCommunication]: $localize`N ∕ C`,
  [DeviceState.ServiceMode]: $localize`SVC`,
  [DeviceState.Invalid]: $localize`INV`,
  [DeviceState.Standby]: $localize`STB`,
  [DeviceState.Intermediate]: $localize`INT`,
};

export const deviceStateFullLabels: {
  [state in DeviceState]: string;
} = {
  [DeviceState.On]: $localize`On`,
  [DeviceState.Off]: $localize`Off`,
  [DeviceState.Warning]: $localize`Warning`,
  [DeviceState.Error]: $localize`Error`,
  [DeviceState.NoCommunication]: $localize`No Communication`,
  [DeviceState.ServiceMode]: $localize`Service Mode`,
  [DeviceState.Invalid]: $localize`Invalid`,
  [DeviceState.Standby]: $localize`Standby`,
  [DeviceState.Intermediate]: $localize`Intermediate`,
};

export const deviceStateColors: {
  [state in DeviceState]: string;
} = {
  [DeviceState.On]: '#23BE73', // @green-6
  [DeviceState.Off]: '#99ACBD', // @gray-6
  [DeviceState.Warning]: '#FF9E13', // @gold-6
  [DeviceState.Error]: '#FF4B4B', // @red-6
  [DeviceState.NoCommunication]: '#09BCD7', // @cyan-6
  [DeviceState.ServiceMode]: '#8460AF', // @purple-6
  [DeviceState.Invalid]: '#09BCD7', // @cyan-6
  [DeviceState.Standby]: '#99ACBD', // @gray-6
  [DeviceState.Intermediate]: '#80d0f8', // @blue-4
};

export const deviceStateColorsLight: {
  [state in DeviceState]: string;
} = {
  [DeviceState.On]: '#6cd99d', // @green-4
  [DeviceState.Off]: '#d4dce3', // @gray-4
  [DeviceState.Warning]: '#ffb43b', // @gold-5
  [DeviceState.Error]: '#ff7773', // @red-5
  [DeviceState.NoCommunication]: 'rgba(9, 188, 215, 0.3)', // @cyan-6 with lower opacity
  [DeviceState.ServiceMode]: '#9d80bf', // @purple-5
  [DeviceState.Invalid]: 'rgba(9, 188, 215, 0.3)', // @cyan-6 with lower opacity
  [DeviceState.Standby]: '#d4dce3', // @gray-4
  [DeviceState.Intermediate]: '#b1e1f9', // @blue-3
};

export interface IntermediateDeviceState {
  code: number; // E.g: 32
  label: string; // E.g: START_DC 3
  description?: string; // Optional user friendly description
}

export interface ExtendedDeviceState {
  baseState: DeviceState | undefined;
  intermediateStateCode?: number;

  // intermediateState is populated later based on device metadata and intermediateStateCode
  intermediateState?: IntermediateDeviceState;
}
