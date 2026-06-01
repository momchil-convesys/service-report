import { AnyValidateFunction } from 'ajv/dist/types';

import { WTCombinedChartDataDTO, WTPowerDataDTO } from '../dtos';
import { WTCombinedChartData, WTPowerData } from '../models';
import { DataAdapter } from './_data-adapter-base';

class WTDataAdapterClass extends DataAdapter<WTPowerDataDTO, WTPowerData> {
  dtoToModel(dto: WTPowerDataDTO): WTPowerData {
    return {
      ...dto,
    };
  }

  modelToDto(model: WTPowerData): WTPowerDataDTO {
    throw new Error($localize`Method not implemented.`);
  }

  validator(): AnyValidateFunction<WTPowerDataDTO> | undefined {
    // TODO: validator
    return undefined;
  }
}

export const WTDataAdapter = new WTDataAdapterClass();

class WTCombinedChartDataAdapterClass extends DataAdapter<
  WTCombinedChartDataDTO,
  WTCombinedChartData
> {
  dtoToModel(dto: WTCombinedChartDataDTO): WTCombinedChartData {
    return {
      ...dto,
    };
  }

  modelToDto(model: WTCombinedChartData): WTCombinedChartDataDTO {
    throw new Error($localize`Method not implemented.`);
  }

  validator(): AnyValidateFunction<WTCombinedChartDataDTO> | undefined {
    // TODO: validator
    return undefined;
  }
}

export const WTCombinedChartDataAdapter = new WTCombinedChartDataAdapterClass();
