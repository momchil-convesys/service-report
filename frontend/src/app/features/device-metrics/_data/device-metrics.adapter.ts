import { AnyValidateFunction } from 'ajv/dist/types';
import { DeviceState, deviceStateStringValues } from '../../../constants';
import { DataAdapter } from '../../../data/adapters';
import { DeviceMetricsDTO } from './device-metrics.dto';
import { DeviceMetrics } from './device-metrics.model';

class DeviceMetricsAdapterClass extends DataAdapter<DeviceMetricsDTO, DeviceMetrics> {
  dtoToModel(dto: DeviceMetricsDTO): DeviceMetrics {
    // Verify that state is one of the predefined values
    if (dto.state !== null && deviceStateStringValues.indexOf(dto.state) < 0) {
      throw new Error($localize`Unknown device state received from server:` + ` ${dto.state}`);
    }

    return {
      ...dto,
      timestamp: DataAdapter.dtoToModelTimestamp(dto.timestamp),
      state: <DeviceState>dto.state,
      values: dto.values || {},
    };
  }

  modelToDto(model: DeviceMetrics): DeviceMetricsDTO {
    throw new Error($localize`Method not implemented.`);
  }

  validator(): AnyValidateFunction<DeviceMetricsDTO> | undefined {
    // TODO: validator
    return undefined;
    // return ajvInstance.getSchema<DeviceMetricsDTO>(objectSchemaPaths.DeviceMetrics);
  }
}

export const DeviceMetricsAdapter = new DeviceMetricsAdapterClass();
