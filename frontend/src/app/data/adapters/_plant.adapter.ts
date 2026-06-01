import { AnyValidateFunction } from 'ajv/dist/types';
import { DeviceType, deviceTypeStringValues } from '../../constants';

import { BehaviorSubject } from 'rxjs';
import {
  ActivePowerLimitSchedule,
  adaptActivePowerLimitSchedule,
} from '../../features/power-limit-schedule/_data/active-schedule';
import { undefinedOrNumber } from '../../helpers';
import { getShouldUseParameterGroupingByName } from '../../helpers/dirty-fixes';
import { PlantDTO } from '../dtos';
import { Plant } from '../models';
import { DataAdapter } from './_data-adapter-base';
import { DeviceAdapter } from './_device.adapter';

class PlantAdapterClass extends DataAdapter<PlantDTO, Plant> {
  dtoToModel(dto: PlantDTO): Plant {
    let type: DeviceType = DeviceType.Solar;

    if (dto.type && deviceTypeStringValues.indexOf(dto.type) >= 0) {
      type = <DeviceType>dto.type;
    }

    return {
      ...dto,
      type,
      timeZone: dto.timeZone,
      devices: dto.devices?.map((deviceDto) => DeviceAdapter.dtoToModel(deviceDto)) || [],
      activePowerLimitSchedule$: new BehaviorSubject<null | ActivePowerLimitSchedule>(
        dto.activePowerLimitSchedule
          ? adaptActivePowerLimitSchedule(
              dto.activePowerLimitSchedule,
              dto.timeZone,
              dto.plantSpecificMetadata?.powerLimitTargetCoefficient || 1,
            )
          : null,
      ),
      activeBESSSchedule$: new BehaviorSubject<null | ActivePowerLimitSchedule>(
        dto.activeBESSSchedule
          ? adaptActivePowerLimitSchedule(
              dto.activeBESSSchedule,
              dto.timeZone,
              dto.plantSpecificMetadata?.bessSetpointTargetCoefficient || 1,
            )
          : null,
      ),
      plantSpecificMetadata: {
        ...dto.plantSpecificMetadata,
        hasPowerMeter: dto.plantSpecificMetadata?.hasPowerMeter || false,
        maxPowerLimitTreshold: undefinedOrNumber(dto.plantSpecificMetadata?.maxPowerLimitTreshold),
        hasExtendedPlantMetrics: dto.plantSpecificMetadata?.hasExtendedPlantMetrics || false,
        powerLimitTargetCoefficient: dto.plantSpecificMetadata?.powerLimitTargetCoefficient || 1,
        powerLimitType: dto.plantSpecificMetadata?.powerLimitType || 'energy',
        scheduleIntegrationPeriodMinutes:
          dto.plantSpecificMetadata?.scheduleIntegrationPeriodMinutes || 60,
        hasTsWithInverters: dto.plantSpecificMetadata?.hasTsWithInverters || false,
        hasOnSiteSetup: dto.plantSpecificMetadata?.hasOnSiteSetup || false,
        thisSetup: dto.plantSpecificMetadata?.thisSetup || null,
        hasFaultsTab: dto.plantSpecificMetadata?.hasFaultsTab || false,

        bessId: dto.plantSpecificMetadata?.bessId,
        bessSetpointTargetCoefficient:
          dto.plantSpecificMetadata?.bessSetpointTargetCoefficient || 1,

        /**
         * TODO: do not check against HARDCODED plant ids!
         */
        shouldUseParameterGroupingByName: getShouldUseParameterGroupingByName(dto.id) || false,
      },
    };
  }

  modelToDto(model: Plant): PlantDTO {
    throw new Error($localize`Method not implemented.`);
  }

  validator(): AnyValidateFunction<PlantDTO> | undefined {
    // TODO: validator
    return undefined;
    // return ajvInstance.getSchema<PlantDTO>(objectSchemaPaths.Plant);
  }
}

export const PlantAdapter = new PlantAdapterClass();
