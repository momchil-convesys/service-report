import { AnyValidateFunction } from 'ajv/dist/core';
import { ParameterDefinitionDTO, ParametersTemplateDTO } from '../dtos';
import { DeviceParameterDefinition, DeviceParametersTemplate } from '../models';
import { DataAdapter } from './_data-adapter-base';

class ParametersTemplateAdapterClass extends DataAdapter<
  ParametersTemplateDTO,
  DeviceParametersTemplate
> {
  dtoToModel(dto: ParametersTemplateDTO): DeviceParametersTemplate {
    return {
      ...dto,
      parameters: dto.parameters.map((parameterDto) =>
        this._adaptParameterDefinition(parameterDto),
      ),
    };
  }

  private _adaptParameterDefinition(dto: ParameterDefinitionDTO): DeviceParameterDefinition {
    return { ...dto };
  }

  modelToDto(model: DeviceParametersTemplate): ParametersTemplateDTO {
    throw new Error($localize`Method not implemented.`);
  }

  validator(): AnyValidateFunction<ParametersTemplateDTO> | undefined {
    // TODO: validator
    return undefined;
  }
}

export const ParametersTemplateAdapter = new ParametersTemplateAdapterClass();
