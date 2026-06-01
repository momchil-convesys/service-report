import { SSE_DataUpdateMethod } from '../../../../constants';
import { PVAveragePowerDataDTO } from './pv-average-power.dto';

// TODO: make a generic updater

export const pvAveragePowerDataUpdateCallback = (
  currentData: PVAveragePowerDataDTO,
  newData: PVAveragePowerDataDTO,
  updateMethod: SSE_DataUpdateMethod,
): PVAveragePowerDataDTO => {
  if (updateMethod === SSE_DataUpdateMethod.Append) {
    return {
      ...currentData,
      dataPoints: [...currentData.dataPoints, ...newData.dataPoints],
    };
  }

  if (updateMethod === SSE_DataUpdateMethod.Patch) {
    const patchedDataPoints = [...currentData.dataPoints];
    newData.dataPoints.forEach((newPoint) => {
      const pointIndex = patchedDataPoints.findIndex((p) => p.timestamp === newPoint.timestamp);
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
