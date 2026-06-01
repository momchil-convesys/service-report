import { SSE_DataUpdateMethod } from '../../../../constants';
import { PVPowerDataForDeviceDTO_NEW, PVPowerDataForPlantDTO_NEW } from './pv-power.dto';

export const pvPowerDataForPlantUpdateCallback = (
  currentData: PVPowerDataForPlantDTO_NEW,
  newData: PVPowerDataForPlantDTO_NEW,
  updateMethod: SSE_DataUpdateMethod,
): PVPowerDataForPlantDTO_NEW => {
  if (updateMethod === SSE_DataUpdateMethod.Append) {
    return {
      ...currentData,
      dataPoints: [...currentData.dataPoints, ...newData.dataPoints],
      calculatedProduction: newData.calculatedProduction,
      calculatedProductionPM: newData.calculatedProductionPM,
      scheduledPowerLimitDataPoints: [
        ...(currentData.scheduledPowerLimitDataPoints || []),
        ...(newData.scheduledPowerLimitDataPoints || []),
      ],
      irradianceDataPoints: [
        ...(currentData.irradianceDataPoints || []),
        ...(newData.irradianceDataPoints || []),
      ],
    };
  }

  if (updateMethod === SSE_DataUpdateMethod.Patch) {
    return {
      ...currentData,
      dataPoints: patchPoints(currentData.dataPoints, newData.dataPoints),
      calculatedProduction: newData.calculatedProduction,
      calculatedProductionPM: newData.calculatedProductionPM,
      scheduledPowerLimitDataPoints: patchPoints(
        currentData.scheduledPowerLimitDataPoints || [],
        newData.scheduledPowerLimitDataPoints || [],
      ),
      irradianceDataPoints: patchPoints(
        currentData.irradianceDataPoints || [],
        newData.irradianceDataPoints || [],
      ),
    };
  }

  if (updateMethod === SSE_DataUpdateMethod.Replace) {
    return {
      ...newData,
    };
  }

  return currentData;
};

export const pvPowerDataForDeviceUpdateCallback = (
  currentData: PVPowerDataForDeviceDTO_NEW,
  newData: PVPowerDataForDeviceDTO_NEW,
  updateMethod: SSE_DataUpdateMethod,
): PVPowerDataForDeviceDTO_NEW => {
  if (updateMethod === SSE_DataUpdateMethod.Append) {
    return {
      ...currentData,
      dataPoints: [...currentData.dataPoints, ...newData.dataPoints],
      calculatedProduction: newData.calculatedProduction,
      scheduledPowerLimitDataPoints: [
        ...(currentData.scheduledPowerLimitDataPoints || []),
        ...(newData.scheduledPowerLimitDataPoints || []),
      ],
      irradianceDataPoints: [
        ...(currentData.irradianceDataPoints || []),
        ...(newData.irradianceDataPoints || []),
      ],
    };
  }

  if (updateMethod === SSE_DataUpdateMethod.Patch) {
    return {
      ...currentData,
      dataPoints: patchPoints(currentData.dataPoints, newData.dataPoints),
      calculatedProduction: newData.calculatedProduction,
      scheduledPowerLimitDataPoints: patchPoints(
        currentData.scheduledPowerLimitDataPoints || [],
        newData.scheduledPowerLimitDataPoints || [],
      ),
      irradianceDataPoints: patchPoints(
        currentData.irradianceDataPoints || [],
        newData.irradianceDataPoints || [],
      ),
    };
  }

  if (updateMethod === SSE_DataUpdateMethod.Replace) {
    return {
      ...newData,
    };
  }

  return currentData;
};

function patchPoints<T>(
  currentPoints: (T & { timestamp: string })[],
  newPoints: (T & { timestamp: string })[],
): T[] {
  const patchedDataPoints = [...currentPoints];
  newPoints.forEach((newPoint) => {
    const pointIndex = patchedDataPoints.findIndex((p) => p.timestamp === newPoint.timestamp);
    if (pointIndex >= 0) {
      patchedDataPoints[pointIndex] = newPoint;
    }
  });

  return patchedDataPoints;
}
