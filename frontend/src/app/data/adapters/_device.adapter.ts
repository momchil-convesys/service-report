import { AnyValidateFunction } from 'ajv/dist/types';
import { BehaviorSubject } from 'rxjs';
import {
  CurrentFaults,
  DeviceState,
  deviceStateStringValues,
  DeviceType,
  deviceTypeStringValues,
  ExtendedDeviceState,
} from '../../constants';
import { MonbatActiveSchedule } from '../../features/monbat-batteries-schedule/_data/dto';
import { undefinedOrNumber } from '../../helpers';
import { DeviceDTO } from '../dtos';
import { Device, PowerLimitDetails } from '../models';
import { DataAdapter } from './_data-adapter-base';

class DeviceAdapterClass extends DataAdapter<DeviceDTO, Device> {
  dtoToModel(dto: DeviceDTO): Device {
    let state: ExtendedDeviceState = {
      baseState: undefined,
      intermediateStateCode: undefinedOrNumber(dto.intermediateStateCode),
    };

    // Verify that state is one of the predefined values
    if (deviceStateStringValues.indexOf(dto.state) >= 0) {
      state.baseState = <DeviceState>dto.state;
    }

    let type: DeviceType | undefined;

    if (dto.type && deviceTypeStringValues.indexOf(dto.type) >= 0) {
      type = <DeviceType>dto.type;
    }

    if (!type) {
      throw `Invalid device type: ${dto.type}`;
    }

    // dto.powerLimit = Math.random() > 0.5 ? powerlimitMock1 : null;

    return {
      id: dto.id,
      name: dto.name,
      plantId: dto.plantId,
      deviceMetadataId: dto.deviceMetadataId,
      state,
      type,
      assetType: dto.assetType || dto.type,
      serialNumber: dto.serialNumber || '',
      installedPowerKw: dto.installedPowerKw || '',
      stateSubject: new BehaviorSubject<ExtendedDeviceState>(state),
      currentFaults: dto.currentFaults || undefined,
      currentFaultsSubject: new BehaviorSubject<CurrentFaults | undefined>(
        dto.currentFaults || undefined,
      ),
      powerLimit: dto.powerLimit,
      powerLimitSubject: new BehaviorSubject<PowerLimitDetails | null>(dto.powerLimit),
      deviceSpecificMetadata: dto.deviceSpecificMetadata || {},
      monbatActiveSchedule: dto.monbatActiveSchedule,
      monbatActiveScheduleSubject:
        type === DeviceType.BatteryString
          ? new BehaviorSubject<null | MonbatActiveSchedule>(dto.monbatActiveSchedule || null)
          : undefined,
    };
  }

  modelToDto(model: Device): DeviceDTO {
    throw new Error($localize`Method not implemented.`);
  }

  validator(): AnyValidateFunction<DeviceDTO> | undefined {
    // TODO: validator
    return undefined;
    // return ajvInstance.getSchema<DeviceDTO>(objectSchemaPaths.Device);
  }
}

export const DeviceAdapter = new DeviceAdapterClass();
