import {
  addDays,
  addMinutes,
  endOfDay,
  endOfMonth,
  startOfDay,
  startOfMonth,
  subMinutes,
} from 'date-fns';
import { IntegrationPeriod, integrationPeriodStringValues } from '../../../../constants';
import { DataAdapter } from '../../../../data/adapters';
import {
  integrationPeriodInMilliseconds,
  nullOrNumber,
  zonedTimeToUtcSafe,
} from '../../../../helpers';

import { Plant } from '../../../../data/models';
import {
  getLimitTypeForDateInThePast,
  getPowerLimitTargetCoefficientForDateInThePast,
} from '../../../../helpers/dirty-fixes';
import {
  calcEnergyLimitEquivalent_forProductionChart,
  EnergyLimitEquivalent,
} from '../../../power-limit-schedule/_data/helpers';
import { preCalcTargetLimitValue } from './helpers';
import { PVProductionData, TargetLimit_DataPoint, TargetLimit_PreCalc } from './pv-production';
import { PVProductionDataDTO } from './pv-production.dto';

function calculatePointRangeForTimestamp(
  timestampDto: string,
  integrationPeriod: IntegrationPeriod,
  hasPowerMeter: boolean,
  timeZone: string | undefined,
): { from: Date; to: Date } {
  const timestamp = DataAdapter.dtoToModelTimestamp(timestampDto);

  switch (integrationPeriod) {
    case IntegrationPeriod.QuaterOfAnHour:
      if (hasPowerMeter) {
        return {
          from: subMinutes(timestamp, 15),
          to: timestamp,
        };
      }

      return {
        from: timestamp,
        to: addMinutes(timestamp, 15),
      };

    case IntegrationPeriod.Hours:
      if (hasPowerMeter) {
        return {
          from: subMinutes(timestamp, 60),
          to: timestamp,
        };
      }

      return {
        from: timestamp,
        to: addMinutes(timestamp, 60),
      };

    case IntegrationPeriod.Days:
      return {
        from: zonedTimeToUtcSafe(startOfDay(timestamp), timeZone),
        to: zonedTimeToUtcSafe(endOfDay(timestamp), timeZone),
      };

    // TODO: temporary solution, fixing backend timextamps
    case IntegrationPeriod.Months:
      const midMonth = addDays(timestamp, 15);

      return {
        from: zonedTimeToUtcSafe(startOfMonth(midMonth), timeZone),
        to: zonedTimeToUtcSafe(endOfMonth(midMonth), timeZone),
      };

    // case IntegrationPeriod.Months:
    //   return {
    //     from: zonedTimeToUtcSafe(startOfMonth(timestamp), timeZone),
    //     to: zonedTimeToUtcSafe(endOfMonth(timestamp), timeZone),
    //   };

    default:
      throw new Error($localize`Unhandled integration period:` + ` ${integrationPeriod}`);
  }
}

function adaptPowerLimitData(
  targetPowerLimitData: PVProductionDataDTO['targetPowerLimitData'] | null,
  powerLimitTargetCoefficient: number,
  powerLimitType: 'power' | 'energy',
  integrationPeriodMs: number | undefined,
): TargetLimit_DataPoint[] | null {
  if (!targetPowerLimitData) {
    return null;
  }

  return targetPowerLimitData
    .filter(
      (dataPointDTO) =>
        dataPointDTO.targetPowerLimit !== undefined &&
        dataPointDTO.originalTargetPowerLimit !== undefined,
    )
    .map((dataPointDTO) => {
      const targetLimit: TargetLimit_PreCalc = preCalcTargetLimitValue(
        nullOrNumber(dataPointDTO.targetPowerLimit),
        powerLimitTargetCoefficient,
      );

      const targetLimitOriginal: TargetLimit_PreCalc = preCalcTargetLimitValue(
        nullOrNumber(dataPointDTO.originalTargetPowerLimit),
        powerLimitTargetCoefficient,
      );

      let energyLimitEquivalent: null | EnergyLimitEquivalent = null;

      if (powerLimitType === 'power' && integrationPeriodMs) {
        energyLimitEquivalent = calcEnergyLimitEquivalent_forProductionChart(
          targetLimit,
          targetLimitOriginal,
          powerLimitType,
          integrationPeriodMs / 1000 / 60,
        );
      }

      return {
        targetLimit,
        targetLimitOriginal,
        applicableRange: {
          from: DataAdapter.dtoToModelTimestamp(dataPointDTO.interval.from),
          to: DataAdapter.dtoToModelTimestamp(dataPointDTO.interval.to),
        },
        fileRefId: dataPointDTO.fileRefId,
        scheduleStatus: dataPointDTO.scheduleStatus,
        energyLimitEquivalent,
      };
    });
}

export function adaptPVProductionData(
  dto: PVProductionDataDTO,
  hasPowerMeter: boolean,
  plant: Plant,
): PVProductionData {
  // Verify that integrationPeriod is one of the predefined values
  // Use case insensitive compare as a temporary fix for backend sending "quaterofanhour"
  let integrationPeriod: IntegrationPeriod | undefined = <IntegrationPeriod>(
    integrationPeriodStringValues.find(
      (value) => value.toLocaleLowerCase() === dto.integrationPeriod.toLocaleLowerCase(),
    )
  );

  if (!integrationPeriod) {
    throw new Error(
      $localize`Server returned unknown integration period value:` + ` ${dto.integrationPeriod}`,
    );
  }

  const powerLimitTargetCoefficient =
    getPowerLimitTargetCoefficientForDateInThePast(plant, dto.to) || 1;
  const integrationPeriodMs = integrationPeriodInMilliseconds(integrationPeriod);
  const powerLimitType = getLimitTypeForDateInThePast(plant, dto.to) || 'energy';

  // For the case when schedule is given in 15 min intervals
  // but requested data is for one hour intervals and
  // deviation cannot be visualized properly.
  const hideScheduleLimitData =
    powerLimitType === 'power' &&
    integrationPeriod === IntegrationPeriod.Hours &&
    plant.plantSpecificMetadata?.scheduleIntegrationPeriodMinutes !== 60;

  return {
    ...dto,
    from: DataAdapter.dtoToModelTimestamp(dto.from),
    to: DataAdapter.dtoToModelTimestamp(dto.to),
    integrationPeriod,

    powerLimitTargetCoefficient,
    powerLimitType,

    productionDataPoints: dto.productionDataPoints.map((dataPointDTO) => {
      const value = hasPowerMeter ? dataPointDTO.valuePM : dataPointDTO.value;
      const value_Mega = value ? value / 1000 : value;

      return {
        value,
        value_Mega,
        applicableRange: calculatePointRangeForTimestamp(
          dataPointDTO.timestamp,
          integrationPeriod,
          hasPowerMeter,
          plant.timeZone,
        ),
      };
    }),

    targetPowerLimitData: hideScheduleLimitData
      ? null
      : adaptPowerLimitData(
          dto.targetPowerLimitData,
          powerLimitTargetCoefficient,
          powerLimitType,
          integrationPeriodMs,
        ),

    scheduleStatusHistory: (dto.scheduleStatusHistory
      ? dto.scheduleStatusHistory.map((dataPointDTO) => ({
          statusChangedTo: dataPointDTO.statusChangedTo,
          timestamp: DataAdapter.dtoToModelTimestamp(dataPointDTO.timestamp),
          timestampEnd: new Date(), // will later be updated according to next point
          fileRefId: dataPointDTO.fileRefId,
          by: dataPointDTO.by,
        }))
      : dto.scheduleStatusHistory) as PVProductionData['scheduleStatusHistory'],

    controlledByExternalSystemHistory: (dto.controlledByExternalSystemHistory
      ? dto.controlledByExternalSystemHistory.map((dataPointDTO) => ({
          controlledByExternalSystem: dataPointDTO.controlledByExternalSystem,
          timestamp: DataAdapter.dtoToModelTimestamp(dataPointDTO.timestamp),
          timestampEnd: new Date(), // will later be updated according to next point
        }))
      : dto.controlledByExternalSystemHistory) as PVProductionData['controlledByExternalSystemHistory'],

    controlledManuallyHistory: (dto.controlledManuallyHistory
      ? dto.controlledManuallyHistory.map((dataPointDTO) => ({
          controlledManually: dataPointDTO.controlledManually,
          timestamp: DataAdapter.dtoToModelTimestamp(dataPointDTO.timestamp),
          timestampEnd: new Date(), // will later be updated according to next point
          byUserDisplayName: dataPointDTO.byUserDisplayName,
        }))
      : dto.controlledManuallyHistory) as PVProductionData['controlledManuallyHistory'],
  };
}
