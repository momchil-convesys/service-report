import { AnyValidateFunction } from 'ajv/dist/core';
import { TaskNodeDefinitionDTO } from '../dtos';
import { TaskNodeDefinition } from '../models';
import { DataAdapter } from './_data-adapter-base';

class TasksAdapterClass extends DataAdapter<TaskNodeDefinitionDTO, TaskNodeDefinition> {
  dtoToModel(dto: TaskNodeDefinitionDTO): TaskNodeDefinition {
    return {
      ...dto,
      description: dto.description || '',
      parentNodeId: 'not-set-yet',
      forceOrder: dto.forceOrder === undefined ? false : dto.forceOrder,
    };
  }

  modelToDto(model: TaskNodeDefinition): TaskNodeDefinitionDTO {
    return {
      ...model,
    };
  }

  validator(): AnyValidateFunction<TaskNodeDefinitionDTO> | undefined {
    // TODO: validator
    return undefined;
    // return ajvInstance.getSchema<TaskNodeDefinitionDTO>(objectSchemaPaths.Tasks);
  }
}

export const TasksAdapter = new TasksAdapterClass();
