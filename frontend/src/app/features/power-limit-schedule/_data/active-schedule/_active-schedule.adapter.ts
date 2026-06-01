import { ActivePowerLimitScheduleDTO } from './_active-schedule.dto';
import { ActivePowerLimitSchedule } from './_active-schedule.model';

/**
 * The following adapter relates to the object that is contained in Plant
 * and is updated via web sockets.
 * Visually represents the yellow "active schedule" indicator next to a plant.
 */
export function adaptActivePowerLimitSchedule(
  dto: ActivePowerLimitScheduleDTO,
  plantTimeZone: string | undefined,
  powerLimitTargetCoefficient: number | undefined,
): ActivePowerLimitSchedule {
  const coefficient: number = powerLimitTargetCoefficient || 1;

  const result: ActivePowerLimitSchedule = {
    ...dto,
    plantTimeZone,
    currentRecord: dto.currentRecord
      ? {
          ...dto.currentRecord,
          coefficient,
          calculatedTarget: calculatePowerLimitTarget(dto.currentRecord.powerLimitMw, coefficient),
        }
      : null,
    records: null,
    // records: dto.records
    //   ? dto.records.map((record) => ({
    //       ...record,
    //       coefficient,
    //       calculatedTarget: calculatePowerLimitTarget(record.powerLimitMw, coefficient),
    //     }))
    //   : null,
  };

  return result;
}

function calculatePowerLimitTarget(
  value: number | null | undefined,
  coefficient: number | undefined,
): number | null | undefined {
  if (value === null || value === undefined || coefficient === undefined) {
    return value;
  }

  return value * coefficient;
}
