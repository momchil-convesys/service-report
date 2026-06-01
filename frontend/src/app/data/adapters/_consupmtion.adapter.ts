import { AnyValidateFunction } from 'ajv/dist/types';
import { IntegrationPeriod, integrationPeriodStringValues } from '../../constants';
import { ConsumptionWithIntegrationPeriodDTO } from '../dtos';
import { ConsumptionWithIntegrationPeriod } from '../models';
import { DataAdapter } from './_data-adapter-base';

class ConsumptionWithIntegrationPeriodAdapterClass extends DataAdapter<
  ConsumptionWithIntegrationPeriodDTO,
  ConsumptionWithIntegrationPeriod
> {
  dtoToModel(dto: ConsumptionWithIntegrationPeriodDTO): ConsumptionWithIntegrationPeriod {
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
      maxValue: 0, // TODO
      from: DataAdapter.dtoToModelTimestamp(dto.from),
      to: DataAdapter.dtoToModelTimestamp(dto.to),
      integrationPeriod,
      values: dto.values.map((dtoValueObject) => ({
        ...dtoValueObject,
        timestamp: DataAdapter.dtoToModelTimestamp(dtoValueObject.timestamp),
      })),
    };
  }

  modelToDto(model: ConsumptionWithIntegrationPeriod): ConsumptionWithIntegrationPeriodDTO {
    throw new Error($localize`Method not implemented.`);
  }

  validator(): AnyValidateFunction<ConsumptionWithIntegrationPeriodDTO> | undefined {
    // TODO: validator
    return undefined;
  }
}

export const ConsumptionWithIntegrationPeriodAdapter =
  new ConsumptionWithIntegrationPeriodAdapterClass();
