import { SSE_DataUpdateMethod } from '../../../../constants';
import { PowerScheduleTracking_DTO } from './power-schedule-tracking.dto';

export const powerScheduleTrackingUpdateCallback = (
  currentData: PowerScheduleTracking_DTO,
  newData: PowerScheduleTracking_DTO,
  updateMethod: SSE_DataUpdateMethod,
): PowerScheduleTracking_DTO => {
  if (updateMethod === SSE_DataUpdateMethod.Append) {
    // Append new intervals to existing data
    return {
      ...currentData,
      intervals: [...currentData.intervals, ...newData.intervals],
      to: newData.to, // Update the 'to' timestamp
    };
  }

  if (updateMethod === SSE_DataUpdateMethod.Patch) {
    // Patch intervals by matching interval start/end times
    const patchedIntervals = [...currentData.intervals];
    newData.intervals.forEach((newInterval) => {
      const intervalIndex = patchedIntervals.findIndex(
        (i) =>
          i.interval.start === newInterval.interval.start &&
          i.interval.end === newInterval.interval.end,
      );
      if (intervalIndex >= 0) {
        patchedIntervals[intervalIndex] = newInterval;
      }
    });

    return {
      ...currentData,
      intervals: patchedIntervals,
      to: newData.to, // Update the 'to' timestamp
    };
  }

  if (updateMethod === SSE_DataUpdateMethod.Replace) {
    // Replace all data
    return newData;
  }

  return currentData;
};
