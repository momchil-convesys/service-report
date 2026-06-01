import { AnyValidateFunction } from 'ajv/dist/types';
import { IntegrationPeriod, integrationPeriodStringValues } from '../../../../constants';
import { DataAdapter } from '../../../../data/adapters/_data-adapter-base';
import { PVAveragePowerDataDTO } from './pv-average-power.dto';
import { PVAveragePowerData } from './pv-average-power.model';

class PVAveragePowerDataAdapterClass extends DataAdapter<
  PVAveragePowerDataDTO,
  PVAveragePowerData
> {
  dtoToModel(dto: PVAveragePowerDataDTO): PVAveragePowerData {
    // Verify that integrationPeriod is one of the predefined values
    // Use case insensitive compare as a temporary fix for backend sending "quaterofanhour"
    let integrationPeriod: IntegrationPeriod | undefined = <IntegrationPeriod>(
      integrationPeriodStringValues.find(
        (value) => value.toLocaleLowerCase() === dto.integrationPeriod.toLocaleLowerCase(),
      )
    );

    if (!integrationPeriod) {
      throw new Error(
        $localize`Server returned unknown integration period value:` + `${dto.integrationPeriod}`,
      );
    }

    return {
      ...dto,
      from: DataAdapter.dtoToModelTimestamp(dto.from),
      to: DataAdapter.dtoToModelTimestamp(dto.to),
      integrationPeriod,
      dataPoints: dto.dataPoints.map((dataPointDTO) => ({
        ...dataPointDTO,
        timestamp: DataAdapter.dtoToModelTimestamp(dataPointDTO.timestamp),
      })),
    };
  }

  modelToDto(model: PVAveragePowerData): PVAveragePowerDataDTO {
    throw new Error($localize`Method not implemented.`);
  }

  validator(): AnyValidateFunction<PVAveragePowerDataDTO> | undefined {
    // TODO: validator
    return undefined;
  }
}

export const PVAveragePowerDataAdapter = new PVAveragePowerDataAdapterClass();
