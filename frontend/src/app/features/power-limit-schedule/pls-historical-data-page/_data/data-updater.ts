import { SSE_DataUpdateMethod } from '../../../../constants';
import { MasterGwScheduledPowerLimitHistoricalData } from './dto';

export const updateCallback = (
  currentData: MasterGwScheduledPowerLimitHistoricalData,
  newData: MasterGwScheduledPowerLimitHistoricalData,
  updateMethod: SSE_DataUpdateMethod,
): MasterGwScheduledPowerLimitHistoricalData => {
  if (updateMethod === SSE_DataUpdateMethod.Append) {
    return {
      ...currentData,
      dataPoints: [...currentData.dataPoints, ...newData.dataPoints],
    };
  }

  // Patch does not make sense in this case
  if (updateMethod === SSE_DataUpdateMethod.Patch) {
    console.warn(
      'Data patch was received, but was not applied! Reason: not understood in the given context.',
    );
    return {
      ...currentData,
    };
  }

  if (updateMethod === SSE_DataUpdateMethod.Replace) {
    return {
      ...newData,
    };
  }

  return currentData;
};
