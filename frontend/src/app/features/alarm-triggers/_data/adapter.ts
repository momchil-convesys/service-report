import { AnyValidateFunction } from 'ajv/dist/types';
import { AlarmTriggerType, alarmTriggerTypeStringValues } from '../../../constants';
import { DataAdapter } from '../../../data/adapters/_data-adapter-base';
import { AlarmTriggerConditionDTO, AlarmTriggerDTO } from './dto';
import { AlarmConditionType, AlarmTrigger } from './models';

class AlarmTriggerAdapterClass extends DataAdapter<AlarmTriggerDTO, AlarmTrigger> {
  dtoToModel(dto: AlarmTriggerDTO): AlarmTrigger {
    if (!dto.lastModified || !dto.created) {
      throw new Error(
        $localize`Server returned invalid data (timestamp is missing) for alarm trigger:` +
          ` ${JSON.stringify(dto)}`,
      );
    }

    if (alarmTriggerTypeStringValues.indexOf(dto.type) < 0) {
      throw new Error($localize`Unknown alarm trigger type received from server:` + ` ${dto.type}`);
    }

    const type = <AlarmTriggerType>dto.type;

    return {
      ...dto,
      id: dto.id?.toString(),
      type,
      lastModified: {
        user: dto.lastModified.user,
        timestamp: DataAdapter.dtoToModelTimestamp(dto.lastModified.timestamp),
      },
      created: {
        user: dto.created.user,
        timestamp: DataAdapter.dtoToModelTimestamp(dto.created.timestamp),
      },
      conditions: <AlarmConditionType[]>dto.conditions,
      affectedDeviceIds: dto.affectedDeviceIds ? dto.affectedDeviceIds : [], // TODO: this check may be unnecessary at some point
    };
  }

  modelToDto(model: AlarmTrigger): AlarmTriggerDTO {
    return {
      ...model,
      conditions: <AlarmTriggerConditionDTO[]>model.conditions,
      lastModified: model.lastModified
        ? {
            user: model.lastModified.user,
            timestamp: DataAdapter.modelToDtoTimestamp(model.lastModified.timestamp),
          }
        : undefined,
      created: model.created
        ? {
            user: model.created.user,
            timestamp: DataAdapter.modelToDtoTimestamp(model.created.timestamp),
          }
        : undefined,
    };
  }

  validator(): AnyValidateFunction<AlarmTriggerDTO> | undefined {
    // TODO: validator
    return undefined;
  }
}

export const AlarmTriggerAdapter = new AlarmTriggerAdapterClass();
