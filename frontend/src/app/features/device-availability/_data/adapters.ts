import { AnyValidateFunction } from 'ajv/dist/types';
import { addMilliseconds, differenceInMilliseconds, intervalToDuration } from 'date-fns';
import { DeviceState, deviceStateStringValues } from '../../../constants';
import { DataAdapter } from '../../../data/adapters';
import { DeviceAvailabilityDTO, DevicesAvailabilityDTO, StateContinuityIntervalDTO } from './dtos';
import { DeviceAvailability, DevicesAvailability, StateContinuityInterval } from './models';

class DevicesAvailabilityAdapterClass extends DataAdapter<
  DevicesAvailabilityDTO,
  DevicesAvailability
> {
  dtoToModel(dto: DevicesAvailabilityDTO): DevicesAvailability {
    const from = DataAdapter.dtoToModelTimestamp(dto.from);
    const to = DataAdapter.dtoToModelTimestamp(dto.to);
    return {
      ...dto,
      from,
      to,
      values: dto.values.map((value) => DeviceAvailabilityAdapter.dtoToModel(value, from, to)),
    };
  }

  modelToDto(model: DevicesAvailability): DevicesAvailabilityDTO {
    throw new Error($localize`Method not implemented.`);
  }

  validator(): AnyValidateFunction<DevicesAvailabilityDTO> | undefined {
    // TODO: validator
    return undefined;
  }
}

class DeviceAvailabilityAdapterClass extends DataAdapter<
  DeviceAvailabilityDTO,
  DeviceAvailability
> {
  dtoToModel(dto: DeviceAvailabilityDTO, from: Date, to: Date): DeviceAvailability {
    let intervals = (dto.intervals || []).map((intervalDto) =>
      StateContinuityIntervalAdapter.dtoToModel(intervalDto),
    );

    // If there is a single entry with no data, consider it as no data for the whole chart
    // if (intervals.length === 1 && intervals[0].state === null) {
    //   intervals = [];
    // }

    const durationByState = {
      [DeviceState.On]: 0,
      [DeviceState.Warning]: 0,
      [DeviceState.Error]: 0,
      [DeviceState.Off]: 0,
      [DeviceState.NoCommunication]: 0,
      [DeviceState.ServiceMode]: 0,
      [DeviceState.Invalid]: 0,
      [DeviceState.Standby]: 0,
      [DeviceState.Intermediate]: 0,
      'no-data': 0,
    };

    intervals.map((interval) => {
      const key = interval.state || 'no-data';
      durationByState[key] += interval.durationMs;
    });

    return {
      ...dto,
      from,
      to,
      fullDurationMs: differenceInMilliseconds(to, from),
      intervals,
      durationByState,
    };
  }

  modelToDto(model: DeviceAvailability): DeviceAvailabilityDTO {
    throw new Error($localize`Method not implemented.`);
  }

  validator(): AnyValidateFunction<DeviceAvailabilityDTO> | undefined {
    // TODO: validator
    return undefined;
  }
}

class StateContinuityIntervalAdapterClass extends DataAdapter<
  StateContinuityIntervalDTO,
  StateContinuityInterval
> {
  dtoToModel(dto: StateContinuityIntervalDTO): StateContinuityInterval {
    // TODO: This should be fixed at backend
    // State should be null when no data is available, but it is sometimes and empty string.
    // Temporary we are converting any empty value to null at the fromt end.
    if (!dto.state) {
      dto.state = null;
    }

    // Verify that state is one of the predefined values
    if (dto.state !== null && deviceStateStringValues.indexOf(dto.state) < 0) {
      throw new Error($localize`Unknown device state received from server: ` + dto.state);
    }

    const state: DeviceState | null = dto.state === null ? null : <DeviceState>dto.state;

    const timestampFrom = DataAdapter.dtoToModelTimestamp(dto.from);

    const interval: Interval = {
      start: timestampFrom,
      end: addMilliseconds(timestampFrom, dto.duration),
    };
    const duration: Duration = intervalToDuration(interval);

    return {
      ...dto,
      from: timestampFrom,
      durationMs: dto.duration,
      duration,
      state,
    };
  }

  modelToDto(model: StateContinuityInterval): StateContinuityIntervalDTO {
    throw new Error($localize`Method not implemented.`);
  }

  validator(): AnyValidateFunction<StateContinuityIntervalDTO> | undefined {
    // TODO: validator
    return undefined;
  }
}

const StateContinuityIntervalAdapter = new StateContinuityIntervalAdapterClass();
const DeviceAvailabilityAdapter = new DeviceAvailabilityAdapterClass();

export const DevicesAvailabilityAdapter = new DevicesAvailabilityAdapterClass();
