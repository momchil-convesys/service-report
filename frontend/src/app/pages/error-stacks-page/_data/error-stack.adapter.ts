import { AnyValidateFunction } from 'ajv/dist/core';
import { DeviceSide, deviceSideStringValues } from '../../../constants';
import { DataAdapter } from '../../../data/adapters/_data-adapter-base';
import { utcToZonedTimeSafe } from '../../../helpers';
import { ErrorStackDTO } from './error-stack.dto';
import { ErrorStack, ErrorStackDetail } from './error-stack.model';

function createUniqueIdForErrorStackObject(dto: ErrorStackDTO): string {
  return dto.deviceId + '_' + dto.id;
}

class ErrorStackDetailAdapterClass extends DataAdapter<ErrorStackDTO, ErrorStackDetail> {
  dtoToModel(dto: ErrorStackDTO, timeZone: string | undefined): ErrorStackDetail {
    let deviceSide: DeviceSide | undefined = undefined;

    // Verify that device side is one of the predefined values
    if (deviceSideStringValues.indexOf(dto.deviceSide) < 0) {
      throw new Error(
        $localize`Server returned unknown device side in error stack:` + ` ${dto.deviceSide}`,
      );
    }

    deviceSide = <DeviceSide>dto.deviceSide;

    if (!dto.details) {
      throw $localize`Missing error stack details in server response.`;
    }

    const timestampInPlantTimeZone = utcToZonedTimeSafe(dto.timestamp, timeZone);

    return {
      id: dto.id,
      deviceId: dto.deviceId,
      plantId: dto.plantId,
      deviceSide,
      timestamp: timestampInPlantTimeZone,
      summary: dto.summary,
      isCurrent: dto.isCurrent,
      uniqueId: createUniqueIdForErrorStackObject(dto),
      ...dto.details,
    };
  }

  modelToDto(model: ErrorStackDetail): ErrorStackDTO {
    throw new Error($localize`Method not implemented.`);
  }

  validator(): AnyValidateFunction<ErrorStackDTO> | undefined {
    // TODO: validator
    return undefined;
    // TODO: validation fails because of nullable + allOf
    // return ajvInstance.getSchema<ErrorStackDTO>(objectSchemaPaths.ErrorStack);
  }
}

class ErrorStackAdapterClass extends DataAdapter<ErrorStackDTO, ErrorStack> {
  dtoToModel(dto: ErrorStackDTO, timeZone: string | undefined): ErrorStack {
    let deviceSide: DeviceSide | null = null;

    if (deviceSideStringValues.indexOf(dto.deviceSide) >= 0) {
      deviceSide = <DeviceSide>dto.deviceSide;
    }

    const timestampInPlantTimeZone = utcToZonedTimeSafe(dto.timestamp, timeZone);

    return {
      ...dto,
      uniqueId: createUniqueIdForErrorStackObject(dto),
      deviceSide,
      timestamp: timestampInPlantTimeZone,
    };
  }

  modelToDto(model: ErrorStack): ErrorStackDTO {
    throw new Error($localize`Method not implemented.`);
  }

  validator(): AnyValidateFunction<ErrorStackDTO> | undefined {
    // TODO: validator
    return undefined;
    // TODO: validation fails because of nullable + allOf
    // return ajvInstance.getSchema<ErrorStackDTO>(objectSchemaPaths.ErrorStack);
  }
}

export const ErrorStackDetailAdapter = new ErrorStackDetailAdapterClass();
export const ErrorStackAdapter = new ErrorStackAdapterClass();
