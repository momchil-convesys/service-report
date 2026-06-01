import { Device, DeviceParameterDefinition, Plant } from '../../data/models';

export interface Scope {
  plant: Plant;
  device: Device | null;
}

export interface Context {
  scope: Scope;
  parameters: DeviceParameterDefinition[];
}
