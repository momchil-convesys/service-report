// GET /device-metadata
// Return list of DeviceMetadataDTO
//
// GET /device-metadata/:id
// Return single object

import { IntermediateDeviceState } from '../../constants';

export interface DeviceMetadataDTO {
  id: string;

  manufacturer: string; // Display string
  softwareVersion: string;

  faultsTemplateId: string;
  parametersTemplateId: string;

  possibleStates: string[];
  intermediateStates: IntermediateDeviceState[];

  deviceLimits?: {
    powerLimitSettingMin: number;
    powerLimitSettingMax: number;
  };
}
