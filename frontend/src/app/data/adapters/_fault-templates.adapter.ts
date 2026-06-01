import { AnyValidateFunction } from 'ajv/dist/core';
import { FaultDefinitionDTO, FaultDefinitionGroupDTO, FaultsTemplateDTO } from '../dtos';
import { FaultDefinition, FaultDefinitionGroup, FaultsTemplate } from '../models';
import { DataAdapter } from './_data-adapter-base';

class FaultTemplatesAdapterClass extends DataAdapter<FaultsTemplateDTO, FaultsTemplate> {
  dtoToModel(dto: FaultsTemplateDTO): FaultsTemplate {
    return {
      id: dto.id,
      master: this._adaptFaultGroupDTO(dto.master),
      slave: dto.slave && dto.slave.length > 0 ? this._adaptFaultGroupDTO(dto.slave) : undefined,
      hideFilteringOptions: dto.hideFilteringOptions,
    };
  }

  private _adaptFaultGroupDTO(faultGroupDTO: FaultDefinitionGroupDTO[]): FaultDefinitionGroup[] {
    return faultGroupDTO.map((groupDTO) => ({
      id: groupDTO.id,
      name: groupDTO.name,
      code: groupDTO.code,
      faults: groupDTO.faults.map((faultDTO) => this._adaptFaultDTO(faultDTO, groupDTO.code)),
    }));
  }

  private _adaptFaultDTO(faultDTO: FaultDefinitionDTO, groupCode: string): FaultDefinition {
    return {
      id: faultDTO.id,
      name: faultDTO.name,
      code: faultDTO.code,
      isMajor: !!faultDTO.isMajor,
    };
  }

  modelToDto(model: FaultsTemplate): FaultsTemplateDTO {
    throw new Error($localize`Method not implemented.`);
  }

  validator(): AnyValidateFunction<FaultsTemplateDTO> | undefined {
    // TODO: validator
    return undefined;
    // return ajvInstance.getSchema<FaultsTemplateDTO>(objectSchemaPaths.FaultsDefinitionSet);
  }
}

export const FaultTemplatesAdapter = new FaultTemplatesAdapterClass();
