import { SSE_DataRequest, SSE_EventName } from '../../../../constants';
import { Plant } from '../../../../data/models';
import { DatetimeRangeModel } from '../../../../shared/datetime-range-select/models';
import { PVBESSHistoricalPowerData, PVBESSHistoricalPowerData_Point } from './models';

export interface DataRequestContext {
  targetRange: DatetimeRangeModel;
  plant: Plant;
  exportFileName: undefined | string;
}

export interface DataRequestWithContext<T> extends DataRequestContext {
  dataRequest: SSE_DataRequest<T>;
}

export interface ErrorWithContext extends DataRequestContext {
  error: any;
}

export interface DataPointsBatch {
  eventName: SSE_EventName | null;
  pointsAdded: PVBESSHistoricalPowerData_Point[];
  pointsRemoved: PVBESSHistoricalPowerData_Point[];
  fullData: PVBESSHistoricalPowerData | undefined;
  from: Date | undefined;
  to: Date | undefined;
  isMainRange: boolean;
  isReemitted?: boolean;
}
