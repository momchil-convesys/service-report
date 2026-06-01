import { AnyValidateFunction } from 'ajv/dist/types';
import { User_DTO } from '../dtos';
import { User } from '../models';
import { DataAdapter } from './_data-adapter-base';

class UserAdapterClass extends DataAdapter<User_DTO, User> {
  dtoToModel(dto: User_DTO): User {
    return {
      id: dto.id,
      email: dto.email,
      displayName: dto.displayName,
      permissions: dto.permissions || [],
      relatedPlantIds: dto.relatedPlantIds || [],
    };
  }

  modelToDto(model: User): User_DTO {
    throw new Error($localize`Method not implemented.`);
  }

  validator(): AnyValidateFunction<User_DTO> | undefined {
    return undefined;
  }
}

export const UserAdapter = new UserAdapterClass();
