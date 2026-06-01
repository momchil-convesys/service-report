import { AnyValidateFunction } from 'ajv/dist/core';
import { of } from 'rxjs';
import {
  AlarmTriggerType,
  alarmTriggerTypeStringValues,
  DeviceState,
  deviceStateStringValues,
} from '../../../constants';
import { DataAdapter } from '../../../data/adapters/_data-adapter-base';
import {
  AlarmEventDetailsDeviceStateChangeDTO,
  AlarmEventDetailsDTO,
  AlarmEventDetailsFaultRecurrenceDTO,
  AlarmEventDetailsParameterBoundariesDTO,
  AlarmEventDTO,
} from './dto';
import {
  AlarmEvent,
  AlarmEventDetails,
  AlarmEventDetailsDeviceStateChange,
  AlarmEventDetailsFaultRecurrence,
  AlarmEventDetailsParameterBoundaries,
} from './models';

class AlarmEventAdapterClass extends DataAdapter<AlarmEventDTO, AlarmEvent> {
  dtoToModel(dto: AlarmEventDTO): AlarmEvent {
    if (alarmTriggerTypeStringValues.indexOf(dto.type) < 0) {
      throw $localize`Unknown alarm type received from server:` + ` ${dto.type}`;
    }

    const type = <AlarmTriggerType>dto.type;
    const details: AlarmEventDetails[] = dto.details.map((dtoDetails) =>
      this._adaptDetails(dtoDetails, type),
    );

    return {
      ...dto,
      alarmType: type,
      details,
      displayNameRequest: of(''),
    };
  }

  modelToDto(model: AlarmEvent): AlarmEventDTO {
    throw new Error($localize`Method not implemented.`);
  }

  private _adaptDetails(
    dtoDetails: AlarmEventDetailsDTO,
    type: AlarmTriggerType,
  ): AlarmEventDetails {
    switch (type) {
      case AlarmTriggerType.ParameterBoundaries: {
        const details = <AlarmEventDetailsParameterBoundariesDTO>dtoDetails;
        const result: AlarmEventDetailsParameterBoundaries = {
          parameterId: details.parameterId,
          value: details.value,
          unit: details.unit,
          timestamp: DataAdapter.dtoToModelTimestamp(details.timestamp),
        };
        return result;
      }
      case AlarmTriggerType.FaultRecurrence: {
        const details = <AlarmEventDetailsFaultRecurrenceDTO>dtoDetails;
        const result: AlarmEventDetailsFaultRecurrence = {
          faultId: details.faultId,
          interval: {
            from: DataAdapter.dtoToModelTimestamp(details.interval.from),
            to: DataAdapter.dtoToModelTimestamp(details.interval.to),
          },
          occurrences: details.occurrences.map((timestamp: string) =>
            DataAdapter.dtoToModelTimestamp(timestamp),
          ),
        };
        return result;
      }
      case AlarmTriggerType.DeviceStateChange: {
        const details = <AlarmEventDetailsDeviceStateChangeDTO>dtoDetails;

        // Verify that state is one of the predefined values
        if (deviceStateStringValues.indexOf(details.state) < 0) {
          throw new Error(
            $localize`Unknown device state received from server:` + ` ${details.state}`,
          );
        }

        const result: AlarmEventDetailsDeviceStateChange = {
          state: <DeviceState>details.state,
          timestamp: DataAdapter.dtoToModelTimestamp(details.timestamp),
          duration: { seconds: details.duration },
        };
        return result;
      }
    }
  }

  validator(): AnyValidateFunction<AlarmEventDTO> | undefined {
    // TODO: validator
    return undefined;
  }
}

export const AlarmEventAdapter = new AlarmEventAdapterClass();
