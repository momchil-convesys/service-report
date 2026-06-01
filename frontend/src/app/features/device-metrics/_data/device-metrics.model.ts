import { DeviceState } from '../../../constants';

export interface DeviceMetrics {
  id: string;
  deviceId: string;

  state: DeviceState | null;
  intermediateStateCode: number | undefined; // Should be provided if state == 'int'

  timestamp: Date;

  values: { [parameterDefinitionId: string]: number | string | null };
}
