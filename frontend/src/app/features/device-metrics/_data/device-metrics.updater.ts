import { SSE_DataUpdateMethod } from '../../../constants';
import { DeviceMetrics } from './device-metrics.model';

export const pvDeviceMetricsUpdateCallback = (
  currentData: DeviceMetrics[],
  newData: DeviceMetrics[],
  updateMethod: SSE_DataUpdateMethod,
): DeviceMetrics[] => {
  if (updateMethod === SSE_DataUpdateMethod.Append) {
    // TODO: define logic for patch if any
    return currentData;
  }

  if (updateMethod === SSE_DataUpdateMethod.Patch) {
    // When new data is for a single device

    const result: DeviceMetrics[] = [...currentData];

    newData.forEach((metricsForDevice) => {
      const index = result.findIndex((m) => m.deviceId === metricsForDevice.deviceId);
      if (index >= 0) {
        result[index] = metricsForDevice;
      }
    });

    return result;
  }

  if (updateMethod === SSE_DataUpdateMethod.Replace) {
    // TODO: do we need a copy here?
    return newData;
  }

  return currentData;
};
