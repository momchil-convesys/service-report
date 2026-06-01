import { SSE_DataUpdateMethod } from '../../../../constants';
import { TransformerStation_Metrics_DTO } from './dto';

export const tsMetricsUpdateCallback = (
  currentData: TransformerStation_Metrics_DTO,
  newData: TransformerStation_Metrics_DTO,
  updateMethod: SSE_DataUpdateMethod,
): TransformerStation_Metrics_DTO => {
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
    return {
      ...currentData,
      inverterMetricsDataPoints: currentData.inverterMetricsDataPoints.map((currentPoint) => {
        const updatedPoint = newData.inverterMetricsDataPoints.find(
          (newPoint) => newPoint.deviceId === currentPoint.deviceId,
        );

        return updatedPoint || currentPoint;
      }),
    };
  }

  if (updateMethod === SSE_DataUpdateMethod.Replace) {
    return newData;
  }

  return currentData;
};

export const tsMetricsForPlantUpdateCallback = (
  currentData: TransformerStation_Metrics_DTO[],
  newData: TransformerStation_Metrics_DTO[],
  updateMethod: SSE_DataUpdateMethod,
): TransformerStation_Metrics_DTO[] => {
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
    const patchedData = [...currentData];

    newData.forEach((newTsData) => {
      const existingTsDataIndex = patchedData.findIndex(
        (tsData) => tsData.deviceId === newTsData.deviceId,
      );
      if (existingTsDataIndex >= 0) {
        const patchedTsData = tsMetricsUpdateCallback(
          patchedData[existingTsDataIndex],
          newTsData,
          updateMethod,
        );
        patchedData[existingTsDataIndex] = patchedTsData;
      }
    });

    return patchedData;
  }

  if (updateMethod === SSE_DataUpdateMethod.Replace) {
    return newData;
  }

  return currentData;
};
