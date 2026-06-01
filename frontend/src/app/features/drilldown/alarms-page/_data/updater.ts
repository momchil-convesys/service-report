import { SSE_DataUpdateMethod } from '../../../../constants';
import { InverterAlarmHistoricalItem_DTO } from './dto';

export const activeAlarmsUpdateCallback = (
  currentData: InverterAlarmHistoricalItem_DTO[],
  newData: InverterAlarmHistoricalItem_DTO[],
  updateMethod: SSE_DataUpdateMethod,
): InverterAlarmHistoricalItem_DTO[] => {
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
    /**
     * This type of update does not make sense for this type of data.
     */

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
