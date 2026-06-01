import { Plant } from '../../../data/models';
import { utcToZonedTimeSafe } from '../../../helpers';
import { PowerSchedule, PowerScheduleParsedTableRow } from './models';
import { PowerScheduleDTO } from './power-schedule.dto';

type ScheduleTableRow_DTO = PowerScheduleDTO['parsedScheduleTable'][0];

export function adaptSchedule(dto: PowerScheduleDTO, plant: Plant): PowerSchedule {
  const coefficientForPvPowerSetpoint =
    plant.plantSpecificMetadata?.powerLimitTargetCoefficient || 1;
  const coefficientForBessPowerSetpoint =
    plant.plantSpecificMetadata?.bessSetpointTargetCoefficient || 1;

  const adaptedSchedule: PowerSchedule = {
    ...dto,
    plantTimeZone: plant.timeZone,
    coefficientForPvPowerSetpoint,
    coefficientForBessPowerSetpoint,

    parsedScheduleTable: dto.parsedScheduleTable.map((row: ScheduleTableRow_DTO) => {
      const interval = {
        start: new Date(row.interval.start),
        end: new Date(row.interval.end),
      };

      const intervalHours = (interval.end.getTime() - interval.start.getTime()) / (1000 * 60 * 60);

      const pvEnergyEquivalent =
        row.pvPowerSetpoint === null
          ? null
          : Math.round((row.pvPowerSetpoint * intervalHours) / 60);

      const bessEnergyEquivalent =
        row.bessPowerSetpoint === null
          ? null
          : Math.round((Math.abs(row.bessPowerSetpoint) * intervalHours) / 60);

      // Grid power setpoint: sum of original PV + BESS setpoints (null if either is null)
      const gridPowerSetpoint =
        row.pvPowerSetpoint === null || row.bessPowerSetpoint === null
          ? null
          : row.pvPowerSetpoint + row.bessPowerSetpoint;

      const adaptedRow: PowerScheduleParsedTableRow = {
        interval,
        zonedInterval: {
          start: utcToZonedTimeSafe(row.interval.start, plant.timeZone),
          end: utcToZonedTimeSafe(row.interval.end, plant.timeZone),
        },
        pvPowerSetpoint: row.pvPowerSetpoint,
        bessPowerSetpoint: row.bessPowerSetpoint,

        pvPowerSetpointAdjusted:
          row.pvPowerSetpoint === null
            ? null
            : adjustPowerSetpoint(row.pvPowerSetpoint, coefficientForPvPowerSetpoint),
        bessPowerSetpointAdjusted:
          row.bessPowerSetpoint === null
            ? null
            : adjustPowerSetpoint(row.bessPowerSetpoint, coefficientForBessPowerSetpoint),

        pvEnergyEquivalent,
        bessEnergyEquivalent,

        gridPowerSetpoint,
        gridExportEnergyEquivalent: null, // Will be added later
        gridImportEnergyEquivalent: null, // Will be added later
      };

      return adaptedRow;
    }),
  };

  return adaptedSchedule;
}

function adjustPowerSetpoint(
  powerSetpoint: number | null,
  coefficient: number | null,
): number | null {
  if (powerSetpoint === null || coefficient === null) {
    return null;
  }
  return Math.round(powerSetpoint * coefficient * 100) / 100;
}
