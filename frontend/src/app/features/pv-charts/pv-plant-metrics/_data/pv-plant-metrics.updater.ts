import { isBefore } from 'date-fns';
import { SSE_DataUpdateMethod } from '../../../../constants';
import { PVPlantEssentialMetrics } from './pv-plant-metrics.model';

export const pvPlantEssentialMetricsUpdateCallback = (
  currentData: PVPlantEssentialMetrics,
  newData: PVPlantEssentialMetrics,
  updateMethod: SSE_DataUpdateMethod,
): PVPlantEssentialMetrics => {
  if (updateMethod === SSE_DataUpdateMethod.Append) {
    return {
      ...currentData,
      // TODO: define logic for append if any
    };
  }

  if (updateMethod === SSE_DataUpdateMethod.Patch) {
    return {
      ...currentData,
      // TODO: define logic for patch if any
    };
  }

  if (updateMethod === SSE_DataUpdateMethod.Replace) {
    if (
      currentData.plantScheduledLimitData &&
      newData.plantScheduledLimitData &&
      isBefore(
        new Date(newData.plantScheduledLimitData.timestamp), // date
        new Date(currentData.plantScheduledLimitData.timestamp), // date to compare
      )
    ) {
      // New data (from scheduler) is older than current data.
      // Skipping data
      // TODO: backend issue
    } else {
      return {
        ...newData,
      };
    }
  }

  return currentData;
};
