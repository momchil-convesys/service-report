import { DeviceState, IntermediateDeviceState } from '../../constants';

export interface DeviceMetadata {
  id: string;

  manufacturer: string;
  softwareVersion: string;

  faultsTemplateId: string;
  parametersTemplateId: string;

  possibleStates: DeviceState[];
  intermediateStates?: IntermediateDeviceState[];

  displayString: string;

  deviceLimits?: {
    powerLimitSettingMin: number;
    powerLimitSettingMax: number;
  };
}
