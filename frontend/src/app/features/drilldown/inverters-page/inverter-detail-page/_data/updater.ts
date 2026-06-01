import { SSE_DataUpdateMethod } from '../../../../../constants';
import { DeviceMetricsDTO } from '../../../../device-metrics/_data/device-metrics.dto';

export const inverterMetricsUpdateCallback = (
  currentData: DeviceMetricsDTO,
  newData: DeviceMetricsDTO,
  updateMethod: SSE_DataUpdateMethod,
): DeviceMetricsDTO => {
  if (updateMethod === SSE_DataUpdateMethod.Append) {
    /**
     * This type of update does not make sense for this type of data.
     */

    console.warn(
      'SSE DATA_APPEND was received, but was not applied! Reason: not understood in the given context.',
    );

    return currentData;
  }

  if (updateMethod === SSE_DataUpdateMethod.Patch) {
    console.warn(
      'SSE DATA_PATCH was received, but was not applied! Reason: not understood in the given context.',
    );

    return currentData;
  }

  if (updateMethod === SSE_DataUpdateMethod.Replace) {
    return newData;
  }

  return currentData;
};
