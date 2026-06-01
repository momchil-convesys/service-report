import { SSE_DataUpdateMethod } from '../../../../constants';
import { PVProductionDataDTO } from './pv-production.dto';

export const pvProductionDataUpdateCallback = (
  currentData: PVProductionDataDTO,
  newData: PVProductionDataDTO,
  updateMethod: SSE_DataUpdateMethod,
): PVProductionDataDTO => {
  if (updateMethod === SSE_DataUpdateMethod.Append) {
    return {
      ...currentData,

      productionDataPoints: [...currentData.productionDataPoints, ...newData.productionDataPoints],

      targetPowerLimitData: appendNewData(
        currentData.targetPowerLimitData,
        newData.targetPowerLimitData,
      ),

      scheduleStatusHistory: appendNewData(
        currentData.scheduleStatusHistory,
        newData.scheduleStatusHistory,
      ),

      controlledByExternalSystemHistory: appendNewData(
        currentData.controlledByExternalSystemHistory,
        newData.controlledByExternalSystemHistory,
      ),

      controlledManuallyHistory: appendNewData(
        currentData.controlledManuallyHistory,
        newData.controlledManuallyHistory,
      ),

      totalProduction: newData.totalProduction,
      totalProductionPM: newData.totalProductionPM,
    };
  }

  if (updateMethod === SSE_DataUpdateMethod.Patch) {
    return {
      ...currentData,

      productionDataPoints:
        patchData(currentData.productionDataPoints, newData.productionDataPoints) || [],

      targetPowerLimitData: patchData(
        currentData.targetPowerLimitData,
        newData.targetPowerLimitData,
      ),

      scheduleStatusHistory: patchData(
        currentData.scheduleStatusHistory,
        newData.scheduleStatusHistory,
      ),

      controlledByExternalSystemHistory: patchData(
        currentData.controlledByExternalSystemHistory,
        newData.controlledByExternalSystemHistory,
      ),

      controlledManuallyHistory: patchData(
        currentData.controlledManuallyHistory,
        newData.controlledManuallyHistory,
      ),

      totalProduction: newData.totalProduction,
      totalProductionPM: newData.totalProductionPM,
    };
  }

  if (updateMethod === SSE_DataUpdateMethod.Replace) {
    return {
      ...newData,
    };
  }

  return currentData;
};

function appendNewData(
  currentData: null | Array<any> | undefined,
  newData: null | Array<any> | undefined,
): null | Array<any> | undefined {
  let result = currentData;
  if (newData && newData.length) {
    result = [...(currentData || []), ...newData];
  }

  return result;
}

function patchData(
  currentData: null | Array<any> | undefined,
  newData: null | Array<any> | undefined,
): null | Array<any> | undefined {
  if (currentData === null || currentData === undefined) {
    return newData;
  }

  if (newData === null || newData === undefined) {
    return currentData;
  }

  const result = [...currentData];
  newData.forEach((newPoint) => {
    const pointIndex = result.findIndex((p) => p.timestamp === newPoint.timestamp);
    if (pointIndex >= 0) {
      result[pointIndex] = newPoint;
    }
  });

  return result;
}
