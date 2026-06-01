import { SSE_DataRequest } from '../../../../constants';
import { Plant } from '../../../../data/models';
import { DatetimeRangeModel } from '../../../../shared/datetime-range-select/models';

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
