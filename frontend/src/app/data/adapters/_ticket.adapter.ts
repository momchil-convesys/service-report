import { AnyValidateFunction } from 'ajv/dist/core';
import { Ticket, TicketDTO } from '../models';
import { DataAdapter } from './_data-adapter-base';

class TicketAdapterClass extends DataAdapter<TicketDTO, Ticket> {
  dtoToModel(dto: TicketDTO): Ticket {
    const createdBy = dto.createdBy && {
      ...dto.createdBy,
      timestamp: DataAdapter.dtoToModelTimestamp(dto.createdBy.timestamp),
    };

    return {
      ...dto,
      createdBy,
    };
  }

  modelToDto(model: Ticket): TicketDTO {
    const createdBy = model.createdBy && {
      ...model.createdBy,
      timestamp: DataAdapter.modelToDtoTimestamp(model.createdBy.timestamp),
    };

    return {
      ...model,
      createdBy,
    };
  }

  validator(): AnyValidateFunction<TicketDTO> | undefined {
    // TODO: validator
    return undefined;
    // return ajvInstance.getSchema<TicketDTO>(objectSchemaPaths.Ticket);
  }
}

export const TicketAdapter = new TicketAdapterClass();
