import { Plant } from '../data/models';
import { ActivePowerLimitSchedule } from '../features/power-limit-schedule/_data/active-schedule';

export function plsLink(
  plant: Plant | null | undefined,
  activePowerLimitSchedule: ActivePowerLimitSchedule | null | undefined,
): string | undefined {
  if (!plant || !activePowerLimitSchedule || !activePowerLimitSchedule.fileRefId) {
    return undefined;
  }

  if (plant.plantSpecificMetadata?.bessId) {
    return `/home/${plant.id}/power-schedule/${activePowerLimitSchedule.fileRefId}`;
  }

  return `/home/${plant.id}/power-limit-schedule/${activePowerLimitSchedule.fileRefId}`;
}
