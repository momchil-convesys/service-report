import { AnyValidateFunction } from 'ajv/dist/core';
import { IntegrationPeriod, integrationPeriodStringValues } from '../../constants';
import { FaultCountersDTO, FaultCountersWithIntegrationPeriodDTO } from '../dtos';

import { FaultCountersData, FaultCountersWithIntegrationPeriod } from '../models';
import { DataAdapter } from './_data-adapter-base';

class FaultCountersAdapterClass extends DataAdapter<FaultCountersDTO, FaultCountersData> {
  dtoToModel(dto: FaultCountersDTO): FaultCountersData {
    return {
      ...dto,
    };
  }

  modelToDto(model: FaultCountersData): FaultCountersDTO {
    throw new Error($localize`Method not implemented.`);
  }

  validator(): AnyValidateFunction<FaultCountersDTO> | undefined {
    // TODO: validator
    return undefined;
  }
}

class FaultCountersWithIntegrationPeriodAdapterClass extends DataAdapter<
  FaultCountersWithIntegrationPeriodDTO,
  FaultCountersWithIntegrationPeriod
> {
  dtoToModel(dto: FaultCountersWithIntegrationPeriodDTO): FaultCountersWithIntegrationPeriod {
    let integrationPeriod: IntegrationPeriod | undefined = undefined;

    // Verify that integrationPeriod is one of the predefined values
    if (integrationPeriodStringValues.indexOf(dto.integrationPeriod) >= 0) {
      integrationPeriod = <IntegrationPeriod>dto.integrationPeriod;
    } else {
      throw new Error(
        $localize`Server returned unknown integration period value:` + ` ${dto.integrationPeriod}`,
      );
    }

    return {
      ...dto,
      from: DataAdapter.dtoToModelTimestamp(dto.from),
      to: DataAdapter.dtoToModelTimestamp(dto.to),
      integrationPeriod,
      values: dto.values.map((dtoValueObject) => ({
        ...dtoValueObject,
        timestamp: DataAdapter.dtoToModelTimestamp(dtoValueObject.timestamp),
      })),
    };
  }

  modelToDto(model: FaultCountersWithIntegrationPeriod): FaultCountersWithIntegrationPeriodDTO {
    throw new Error($localize`Method not implemented.`);
  }

  validator(): AnyValidateFunction<FaultCountersWithIntegrationPeriodDTO> | undefined {
    // TODO: validator
    return undefined;
  }
}

export const FaultCountersAdapter = new FaultCountersAdapterClass();
export const FaultCountersWithIntegrationPeriodAdapter =
  new FaultCountersWithIntegrationPeriodAdapterClass();
