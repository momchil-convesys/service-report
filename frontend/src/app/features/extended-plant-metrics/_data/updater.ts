import { SSE_DataUpdateMethod } from '../../../constants';
import { PowerMetersCumulativeData_DTO } from './dto';

export const dataUpdateCallback = (
  currentData: PowerMetersCumulativeData_DTO,
  newData: PowerMetersCumulativeData_DTO,
  updateMethod: SSE_DataUpdateMethod,
): PowerMetersCumulativeData_DTO => {
  if (updateMethod === SSE_DataUpdateMethod.Append) {
    return {
      ...currentData,
      dataPoints: [...currentData.dataPoints, ...newData.dataPoints],
    };
  }

  if (updateMethod === SSE_DataUpdateMethod.Patch) {
    const patchedDataPoints = [...currentData.dataPoints];
    newData.dataPoints.forEach((newPoint) => {
      const pointIndex = patchedDataPoints.findIndex(
        (p) => p.interval.from === newPoint.interval.from,
      );
      if (pointIndex >= 0) {
        patchedDataPoints[pointIndex] = newPoint;
      }
    });

    return {
      ...currentData,
      dataPoints: patchedDataPoints,
    };
  }

  if (updateMethod === SSE_DataUpdateMethod.Replace) {
    return {
      ...newData,
    };
  }

  return currentData;
};
