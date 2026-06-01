export interface DeviceParameterDefinition {
  id: string;

  name: string;

  type: 'number' | 'string';
  unit: string | null; // E.g.: kWh, V, A, °C; if type is string, then unit is set to null
}

export interface DeviceParametersTemplate {
  id: string;

  parameterIdsVisibleInDeviceMetrics: string[];
  parameterIdsVisibleInInverterMetrics: string[];

  parameters: DeviceParameterDefinition[];
}
