import { Plant } from '../../../data/models';
import { utcToZonedTimeSafe } from '../../../helpers';
import { preCalcTargetLimitValue } from '../../pv-charts/pv-production-chart/_data/helpers';
import { TargetLimit_PreCalc } from '../../pv-charts/pv-production-chart/_data/pv-production';
import { PowerLimitScheduleDTO } from './dto';
import { calcEnergyLimitEquivalentObject_forSchedulePreview } from './helpers';
import { PowerLimitSchedule, PowerLimitScheduleParsedTableRow } from './models';

type ScheduleTableRow_DTO = PowerLimitScheduleDTO['parsedScheduleTable'][0];

export function adaptSchedule(dto: PowerLimitScheduleDTO, plant: Plant): PowerLimitSchedule {
  const limitType = dto.powerLimitType;
  if (!limitType) {
    throw new Error('Power limit type not provided in schedule.');
  }

  const integrationPeriodMinutes = dto.integrationPeriodMinutes;
  if (!integrationPeriodMinutes) {
    throw new Error('Invalid integration period provided in schedule.');
  }

  const powerLimitTargetCoefficient = plant.plantSpecificMetadata?.powerLimitTargetCoefficient;
  if (!powerLimitTargetCoefficient) {
    throw new Error('Invalid adjustment coefficient provided in schedule.');
  }

  const adaptedSchedule: PowerLimitSchedule = {
    ...dto,
    plantTimeZone: plant.timeZone,

    powerLimitTargetCoefficient,
    limitType,
    integrationPeriodMinutes,

    parsedScheduleTable: dto.parsedScheduleTable.map((row: ScheduleTableRow_DTO) => {
      const targetLimitValues: TargetLimit_PreCalc = preCalcTargetLimitValue(
        row.targetPowerLimit,
        powerLimitTargetCoefficient,
      );

      const energyLimitEquivalent = calcEnergyLimitEquivalentObject_forSchedulePreview(
        targetLimitValues,
        limitType,
        integrationPeriodMinutes,
      );

      const adaptedRow: PowerLimitScheduleParsedTableRow = {
        interval: {
          start: new Date(row.interval.from),
          end: new Date(row.interval.to),
        },
        zonedInterval: {
          start: utcToZonedTimeSafe(row.interval.from, plant.timeZone),
          end: utcToZonedTimeSafe(row.interval.to, plant.timeZone),
        },
        targetLimit_Mega: row.targetPowerLimit,
        targetLimitAdjusted_Mega: targetLimitValues.valueAdjusted_Mega,
        energyLimitEquivalent,
      };

      return adaptedRow;
    }),
  };

  return adaptedSchedule;
}
