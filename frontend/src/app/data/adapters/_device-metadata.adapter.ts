import { AnyValidateFunction } from 'ajv/dist/types';
import { DeviceState, deviceStateStringValues } from '../../constants';
import { DeviceMetadataDTO } from '../dtos';
import { DeviceMetadata } from '../models';
import { DataAdapter } from './_data-adapter-base';

class DeviceMetadataAdapterClass extends DataAdapter<DeviceMetadataDTO, DeviceMetadata> {
  dtoToModel(dto: DeviceMetadataDTO): DeviceMetadata {
    const possibleStates: DeviceState[] = [];

    (dto.possibleStates || []).forEach((stateString) => {
      // Verify that state is one of the predefined values
      if (deviceStateStringValues.indexOf(stateString) >= 0) {
        possibleStates.push(<DeviceState>stateString);
      }
    });

    return {
      ...dto,
      possibleStates,
      displayString: dto.manufacturer + ' Version ' + dto.softwareVersion,
    };
  }

  modelToDto(model: DeviceMetadata): DeviceMetadataDTO {
    throw new Error($localize`Method not implemented.`);
  }

  validator(): AnyValidateFunction<DeviceMetadataDTO> | undefined {
    // TODO: validator
    return undefined;
  }
}

export const DeviceMetadataAdapter = new DeviceMetadataAdapterClass();
