//------------------------------------------------------------------------------------
// Device metrics (a.k.a. Live data)

export interface DeviceMetricsDTO {
  id: string;
  deviceId: string; // ID of the device itself.

  state: string; // 'on' | 'wrn' | 'err' | 'off' | 'nc' | 'srvc'
  intermediateStateCode: number | undefined; // Should be provided if state == 'int'

  timestamp: string;

  values: { [parameterDefinitionId: string]: number | string | null };
}
