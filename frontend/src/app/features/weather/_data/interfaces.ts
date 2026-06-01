import { SSE_DataRequest } from '../../../constants';
import { Plant } from '../../../data/models';
import { DatetimeRangeModel } from '../../../shared/datetime-range-select/models';
import { PlantWeatherData_ParameterName, PlantWeatherDataChartIdentifier } from './constants';

export interface ChartSpecifics {
  chartIdentifier: PlantWeatherDataChartIdentifier;
  parameterName: PlantWeatherData_ParameterName | undefined;
}

export interface DataRequestContext {
  targetRange: DatetimeRangeModel;
  plant: Plant;
  exportFileName: undefined | string;
  chartSpecifics: ChartSpecifics;
}

export interface DataRequestWithContext<T> extends DataRequestContext {
  dataRequest: SSE_DataRequest<T>;
}

export interface ErrorWithContext extends DataRequestContext {
  error: any;
}
