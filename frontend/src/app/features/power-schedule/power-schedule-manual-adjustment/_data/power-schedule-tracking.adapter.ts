import {
  addMilliseconds,
  addSeconds,
  setMilliseconds,
  setMinutes,
  setSeconds,
  startOfDay,
} from 'date-fns';
import { IntegrationPeriod, PowerScheduleStatus } from 'src/app/constants';
import { DataAdapter } from 'src/app/data/adapters';
import { Plant } from 'src/app/data/models';
import { utcToZonedTimeSafe, zonedTimeToUtcSafe } from 'src/app/helpers/_time-zone-convertions';
import {
  PowerScheduleTracking_DTO,
  PowerScheduleTrackingInterval_DTO,
} from './power-schedule-tracking.dto';
import {
  PowerScheduleTracking,
  PowerScheduleTrackingInterval,
  ScheduleStatusInterval,
} from './power-schedule-tracking.model';

export function adaptPowerScheduleTracking(
  dto: PowerScheduleTracking_DTO,
  plant: Plant,
): PowerScheduleTracking {
  const pvSetpointTargetCoefficient = plant.plantSpecificMetadata?.powerLimitTargetCoefficient || 1;
  const bessSetpointTargetCoefficient =
    plant.plantSpecificMetadata?.bessSetpointTargetCoefficient || 1;

  const rangeStart = DataAdapter.dtoToModelTimestamp(dto.from);
  const rangeEnd = DataAdapter.dtoToModelTimestamp(dto.to);
  const intervalMs = 15 * 60 * 1000;
  const msInHour = 1000 * 60 * 60;

  // Align rangeStart to beginning of day in plant time zone, rounded down to nearest 15-minute boundary
  const rangeStartInPlantTz = utcToZonedTimeSafe(rangeStart, plant.timeZone);
  const alignedStartInPlantTz = setMilliseconds(
    setSeconds(setMinutes(startOfDay(rangeStartInPlantTz), 0), 0),
    0,
  );
  const alignedRangeStart = zonedTimeToUtcSafe(alignedStartInPlantTz, plant.timeZone);

  type IntervalSlice = Omit<PowerScheduleTrackingInterval_DTO, 'interval'> & {
    interval: { start: Date; end: Date };
  };

  const roundTo2 = (value: number): number => Math.round(value * 100) / 100;

  const sumValues = (values: Array<number | null>): number | null => {
    if (values.length === 0) {
      return null;
    }
    if (values.some((value) => value === null)) {
      return null;
    }
    let total = 0;
    values.forEach((value) => {
      total += value ?? 0;
    });
    return total;
  };

  const adaptIntervalSlice = (interval: IntervalSlice): PowerScheduleTrackingInterval => {
    const intervalStart = interval.interval.start;
    const intervalEnd = interval.interval.end;
    const intervalHours = (intervalEnd.getTime() - intervalStart.getTime()) / msInHour;

    //---------------------------------------------------------------------------------------------
    // PV

    const pvPowerSetpointValueAdjusted: null | number =
      interval.pvPowerSetpointOriginal !== null
        ? roundTo2(interval.pvPowerSetpointOriginal * pvSetpointTargetCoefficient)
        : null;

    // Undefined if not set, null if set to null (N/L), number if set to a value
    let pvPowerSetpointCustomValueAdjusted: undefined | null | number = undefined;
    if (interval.pvPowerSetpointCustom !== null) {
      pvPowerSetpointCustomValueAdjusted =
        interval.pvPowerSetpointCustom.value !== null
          ? roundTo2(interval.pvPowerSetpointCustom.value * pvSetpointTargetCoefficient)
          : null;
    }

    const pvEffectiveSetpointValue: null | number =
      pvPowerSetpointCustomValueAdjusted !== undefined
        ? pvPowerSetpointCustomValueAdjusted
        : pvPowerSetpointValueAdjusted;

    const pvEffectiveSetpointEnergyEquivalent =
      pvEffectiveSetpointValue !== null ? roundTo2(pvEffectiveSetpointValue * intervalHours) : null;

    const pvProductionDeviation =
      interval.pvProduction !== null && pvEffectiveSetpointEnergyEquivalent !== null
        ? roundTo2(interval.pvProduction - pvEffectiveSetpointEnergyEquivalent)
        : null;

    //---------------------------------------------------------------------------------------------
    // BESS

    const bessPowerSetpointValueAdjusted: null | number =
      interval.bessPowerSetpointOriginal !== null
        ? roundTo2(interval.bessPowerSetpointOriginal * bessSetpointTargetCoefficient)
        : null;

    // Undefined if not set, null if set to null (N/L), number if set to a value
    let bessPowerSetpointCustomValueAdjusted: undefined | null | number;
    if (interval.bessPowerSetpointCustom !== null) {
      bessPowerSetpointCustomValueAdjusted =
        interval.bessPowerSetpointCustom.value !== null
          ? roundTo2(interval.bessPowerSetpointCustom.value * bessSetpointTargetCoefficient)
          : null;
    }

    const bessEffectiveSetpointValue: null | number =
      bessPowerSetpointCustomValueAdjusted !== undefined
        ? bessPowerSetpointCustomValueAdjusted
        : bessPowerSetpointValueAdjusted;

    const bessEffectiveSetpointEnergyEquivalent =
      bessEffectiveSetpointValue !== null
        ? roundTo2(Math.abs(bessEffectiveSetpointValue) * intervalHours)
        : null;

    let bessEnergyDeviation: number | null = null;
    if (bessEffectiveSetpointValue !== null && bessEffectiveSetpointEnergyEquivalent !== null) {
      if (bessEffectiveSetpointValue > 0 && interval.bessDischargedEnergy !== null) {
        bessEnergyDeviation = roundTo2(
          interval.bessDischargedEnergy - bessEffectiveSetpointEnergyEquivalent,
        );
      } else if (bessEffectiveSetpointValue < 0 && interval.bessChargedEnergy !== null) {
        bessEnergyDeviation = roundTo2(
          interval.bessChargedEnergy - bessEffectiveSetpointEnergyEquivalent,
        );
      }
    }

    //---------------------------------------------------------------------------------------------
    // Grid power setpoint (sum of original PV + BESS setpoints, without coefficients/customs)

    const gridPowerSetpointValue = sumValues([
      interval.pvPowerSetpointOriginal,
      interval.bessPowerSetpointOriginal,
    ]);

    // Grid energy equivalents (export if positive, import if negative)
    const gridExportEnergyEquivalent =
      gridPowerSetpointValue !== null && gridPowerSetpointValue >= 0
        ? roundTo2(gridPowerSetpointValue * intervalHours)
        : null;
    const gridImportEnergyEquivalent =
      gridPowerSetpointValue !== null && gridPowerSetpointValue <= 0
        ? roundTo2(Math.abs(gridPowerSetpointValue) * intervalHours)
        : null;

    // Grid energy deviation
    let gridEnergyDeviation: number | null = null;
    if (gridPowerSetpointValue !== null) {
      if (gridPowerSetpointValue > 0 && gridExportEnergyEquivalent !== null) {
        // Exporting: compare exported energy with export equivalent
        if (interval.exportedEnergy !== null && interval.exportedEnergy !== undefined) {
          gridEnergyDeviation = roundTo2(interval.exportedEnergy - gridExportEnergyEquivalent);
        }
      } else if (gridPowerSetpointValue < 0 && gridImportEnergyEquivalent !== null) {
        // Importing: compare imported energy with import equivalent
        if (interval.importedEnergy !== null && interval.importedEnergy !== undefined) {
          gridEnergyDeviation = roundTo2(interval.importedEnergy - gridImportEnergyEquivalent);
        }
      }
    }

    return {
      interval: {
        start: intervalStart,
        end: intervalEnd,
      },
      zonedInterval: {
        start: utcToZonedTimeSafe(intervalStart, plant.timeZone),
        end: utcToZonedTimeSafe(intervalEnd, plant.timeZone),
      },
      pvPowerSetpoint: {
        value: interval.pvPowerSetpointOriginal,
        valueAdjusted: pvPowerSetpointValueAdjusted,
      },
      pvPowerSetpointCustom:
        interval.pvPowerSetpointCustom !== null && pvPowerSetpointCustomValueAdjusted !== undefined
          ? {
              value: interval.pvPowerSetpointCustom.value,
              valueAdjusted: pvPowerSetpointCustomValueAdjusted,
            }
          : null,
      pvEffectiveSetpointValue,
      pvEffectiveSetpointEnergyEquivalent,
      pvProduction: interval.pvProduction,
      pvProductionDeviation,
      bessPowerSetpoint: {
        value: interval.bessPowerSetpointOriginal,
        valueAdjusted: bessPowerSetpointValueAdjusted,
      },
      bessPowerSetpointCustom:
        interval.bessPowerSetpointCustom !== null &&
        bessPowerSetpointCustomValueAdjusted !== undefined
          ? {
              value: interval.bessPowerSetpointCustom.value,
              valueAdjusted: bessPowerSetpointCustomValueAdjusted,
            }
          : null,
      bessEffectiveSetpointValue,
      bessEffectiveSetpointEnergyEquivalent,
      bessChargedEnergy: interval.bessChargedEnergy,
      bessDischargedEnergy: interval.bessDischargedEnergy,
      bessEnergyDeviation,
      priorityModeCustom: interval.priorityModeCustom,
      scheduleStatus: interval.scheduleStatus ?? null,
      gridPowerSetpoint: gridPowerSetpointValue,
      gridExportEnergyEquivalent,
      gridImportEnergyEquivalent,
      gridEnergyDeviation,
      exportedEnergy: interval.exportedEnergy ?? null,
      importedEnergy: interval.importedEnergy ?? null,
      responsibleUserDisplayName: interval.responsibleUserDisplayName ?? null,
    };
  };

  // Use aligned range start for bucket generation
  const alignedRangeStartMs = alignedRangeStart.getTime();
  const rangeEndMs = fixLastIntervalEndTime(rangeEnd).getTime();
  const bucketStarts: number[] = [];
  for (let t = alignedRangeStartMs; t < rangeEndMs; t += intervalMs) {
    bucketStarts.push(t);
  }

  const slicesByBucket: IntervalSlice[][] = bucketStarts.map(() => []);
  const scaleValue = (value: number | null, factor: number): number | null =>
    value === null ? null : value * factor;

  dto.intervals.forEach((interval, index) => {
    const intervalStart = DataAdapter.dtoToModelTimestamp(interval.interval.start);
    const intervalEnd =
      index === dto.intervals.length - 1
        ? fixLastIntervalEndTime(DataAdapter.dtoToModelTimestamp(interval.interval.end))
        : DataAdapter.dtoToModelTimestamp(interval.interval.end);
    const startMs = intervalStart.getTime();
    const endMs = intervalEnd.getTime();
    const durationMs = endMs - startMs;

    if (durationMs <= 0) {
      return;
    }

    const firstBucketIndex = Math.max(0, Math.floor((startMs - alignedRangeStartMs) / intervalMs));
    const lastBucketIndex = Math.min(
      bucketStarts.length - 1,
      Math.floor((endMs - alignedRangeStartMs - 1) / intervalMs),
    );

    for (let i = firstBucketIndex; i <= lastBucketIndex; i++) {
      const bucketStartMs = bucketStarts[i];
      const bucketEndMs = Math.min(bucketStartMs + intervalMs, rangeEndMs);
      const overlapStartMs = Math.max(startMs, bucketStartMs);
      const overlapEndMs = Math.min(endMs, bucketEndMs);

      if (overlapStartMs >= overlapEndMs) {
        continue;
      }

      const overlapDurationMs = overlapEndMs - overlapStartMs;
      const factor = overlapDurationMs / durationMs;

      slicesByBucket[i].push({
        interval: {
          start: new Date(overlapStartMs),
          end: new Date(overlapEndMs),
        },
        pvPowerSetpointOriginal: interval.pvPowerSetpointOriginal,
        pvPowerSetpointCustom: interval.pvPowerSetpointCustom,
        pvProduction: scaleValue(interval.pvProduction, factor),
        bessPowerSetpointOriginal: interval.bessPowerSetpointOriginal,
        bessPowerSetpointCustom: interval.bessPowerSetpointCustom,
        bessChargedEnergy: scaleValue(interval.bessChargedEnergy, factor),
        bessDischargedEnergy: scaleValue(interval.bessDischargedEnergy, factor),
        priorityModeCustom: interval.priorityModeCustom,
        scheduleStatus: interval.scheduleStatus ?? null,
        exportedEnergy: scaleValue(interval.exportedEnergy ?? null, factor),
        importedEnergy: scaleValue(interval.importedEnergy ?? null, factor),
        responsibleUserDisplayName: interval.responsibleUserDisplayName ?? null,
      });
    }
  });

  const intervals: PowerScheduleTrackingInterval[] = bucketStarts.map(
    (bucketStartMs, bucketIndex) => {
      const intervalStart = new Date(bucketStartMs);
      const intervalEnd = new Date(Math.min(bucketStartMs + intervalMs, rangeEndMs));
      const intervalHours = (intervalEnd.getTime() - intervalStart.getTime()) / msInHour;

      const slices = slicesByBucket[bucketIndex];
      const historyIntervals = slices.map((slice) => adaptIntervalSlice(slice));

      if (slices.length === 0) {
        return {
          interval: {
            start: intervalStart,
            end: intervalEnd,
          },
          zonedInterval: {
            start: utcToZonedTimeSafe(intervalStart, plant.timeZone),
            end: utcToZonedTimeSafe(intervalEnd, plant.timeZone),
          },
          pvPowerSetpoint: {
            value: null,
            valueAdjusted: null,
          },
          pvPowerSetpointCustom: null,
          pvEffectiveSetpointValue: null,
          pvEffectiveSetpointEnergyEquivalent: null,
          pvProduction: null,
          pvProductionDeviation: null,
          bessPowerSetpoint: {
            value: null,
            valueAdjusted: null,
          },
          bessPowerSetpointCustom: null,
          bessEffectiveSetpointValue: null,
          bessEffectiveSetpointEnergyEquivalent: null,
          bessChargedEnergy: null,
          bessDischargedEnergy: null,
          bessEnergyDeviation: null,
          priorityModeCustom: null,
          scheduleStatus: null,
          historyIntervals: [],
          gridPowerSetpoint: null,
          gridExportEnergyEquivalent: null,
          gridImportEnergyEquivalent: null,
          gridEnergyDeviation: null,
          exportedEnergy: null,
          importedEnergy: null,
          responsibleUserDisplayName: null,
        };
      }

      const lastSlice = slices.reduce((latest, current) =>
        current.interval.end.getTime() > latest.interval.end.getTime() ? current : latest,
      );

      const pvPowerSetpointValue = lastSlice.pvPowerSetpointOriginal;
      const pvPowerSetpointValueAdjusted =
        pvPowerSetpointValue !== null
          ? roundTo2(pvPowerSetpointValue * pvSetpointTargetCoefficient)
          : null;

      let pvPowerSetpointCustomValueAdjusted: undefined | null | number = undefined;
      if (lastSlice.pvPowerSetpointCustom !== null) {
        pvPowerSetpointCustomValueAdjusted =
          lastSlice.pvPowerSetpointCustom.value !== null
            ? roundTo2(lastSlice.pvPowerSetpointCustom.value * pvSetpointTargetCoefficient)
            : null;
      }

      const pvEffectiveSetpointValue: null | number =
        pvPowerSetpointCustomValueAdjusted !== undefined
          ? pvPowerSetpointCustomValueAdjusted
          : pvPowerSetpointValueAdjusted;
      const pvEffectiveSetpointEnergyEquivalent =
        pvEffectiveSetpointValue !== null
          ? roundTo2(pvEffectiveSetpointValue * intervalHours)
          : null;

      const pvProduction = sumValues(slices.map((slice) => slice.pvProduction));
      const pvProductionDeviation =
        pvProduction !== null && pvEffectiveSetpointEnergyEquivalent !== null
          ? roundTo2(pvProduction - pvEffectiveSetpointEnergyEquivalent)
          : null;

      const bessPowerSetpointValue = lastSlice.bessPowerSetpointOriginal;
      const bessPowerSetpointValueAdjusted =
        bessPowerSetpointValue !== null
          ? roundTo2(bessPowerSetpointValue * bessSetpointTargetCoefficient)
          : null;

      let bessPowerSetpointCustomValueAdjusted: undefined | null | number;
      if (lastSlice.bessPowerSetpointCustom !== null) {
        bessPowerSetpointCustomValueAdjusted =
          lastSlice.bessPowerSetpointCustom.value !== null
            ? roundTo2(lastSlice.bessPowerSetpointCustom.value * bessSetpointTargetCoefficient)
            : null;
      }

      const bessEffectiveSetpointValue: null | number =
        bessPowerSetpointCustomValueAdjusted !== undefined
          ? bessPowerSetpointCustomValueAdjusted
          : bessPowerSetpointValueAdjusted;
      const bessEffectiveSetpointEnergyEquivalent =
        bessEffectiveSetpointValue !== null
          ? roundTo2(Math.abs(bessEffectiveSetpointValue) * intervalHours)
          : null;

      const bessChargedEnergy = sumValues(slices.map((slice) => slice.bessChargedEnergy));
      const bessDischargedEnergy = sumValues(slices.map((slice) => slice.bessDischargedEnergy));

      let bessEnergyDeviation: number | null = null;
      if (bessEffectiveSetpointValue !== null && bessEffectiveSetpointEnergyEquivalent !== null) {
        if (bessEffectiveSetpointValue > 0 && bessDischargedEnergy !== null) {
          bessEnergyDeviation = roundTo2(
            bessDischargedEnergy - bessEffectiveSetpointEnergyEquivalent,
          );
        } else if (bessEffectiveSetpointValue < 0 && bessChargedEnergy !== null) {
          bessEnergyDeviation = roundTo2(bessChargedEnergy - bessEffectiveSetpointEnergyEquivalent);
        }
      }

      const priorityModeCustom = lastSlice.priorityModeCustom ?? null;
      const scheduleStatus = lastSlice.scheduleStatus ?? null;

      // Grid power setpoint for aggregated interval (sum of original PV + BESS setpoints)
      const gridPowerSetpointValue = sumValues([
        lastSlice.pvPowerSetpointOriginal,
        lastSlice.bessPowerSetpointOriginal,
      ]);

      // Grid energy equivalents (export if positive, import if negative)
      const gridExportEnergyEquivalent =
        gridPowerSetpointValue !== null && gridPowerSetpointValue >= 0
          ? roundTo2(gridPowerSetpointValue * intervalHours)
          : null;
      const gridImportEnergyEquivalent =
        gridPowerSetpointValue !== null && gridPowerSetpointValue <= 0
          ? roundTo2(Math.abs(gridPowerSetpointValue) * intervalHours)
          : null;

      const exportedEnergy = sumValues(slices.map((slice) => slice.exportedEnergy ?? null));
      const importedEnergy = sumValues(slices.map((slice) => slice.importedEnergy ?? null));

      // Grid energy deviation
      let gridEnergyDeviation: number | null = null;
      if (gridPowerSetpointValue !== null) {
        if (gridPowerSetpointValue >= 0 && gridExportEnergyEquivalent !== null) {
          // Exporting: compare exported energy with export equivalent
          if (exportedEnergy !== null) {
            gridEnergyDeviation = roundTo2(exportedEnergy - gridExportEnergyEquivalent);
          }
        } else if (gridPowerSetpointValue <= 0 && gridImportEnergyEquivalent !== null) {
          // Importing: compare imported energy with import equivalent
          if (importedEnergy !== null) {
            gridEnergyDeviation = roundTo2(importedEnergy - gridImportEnergyEquivalent);
          }
        }
      }

      return {
        interval: {
          start: intervalStart,
          end: intervalEnd,
        },
        zonedInterval: {
          start: utcToZonedTimeSafe(intervalStart, plant.timeZone),
          end: utcToZonedTimeSafe(intervalEnd, plant.timeZone),
        },
        pvPowerSetpoint: {
          value: pvPowerSetpointValue,
          valueAdjusted: pvPowerSetpointValueAdjusted,
        },
        pvPowerSetpointCustom:
          lastSlice.pvPowerSetpointCustom !== null &&
          pvPowerSetpointCustomValueAdjusted !== undefined
            ? {
                value: lastSlice.pvPowerSetpointCustom.value,
                valueAdjusted: pvPowerSetpointCustomValueAdjusted,
              }
            : null,
        pvEffectiveSetpointValue,
        pvEffectiveSetpointEnergyEquivalent,
        pvProduction,
        pvProductionDeviation,
        bessPowerSetpoint: {
          value: bessPowerSetpointValue,
          valueAdjusted: bessPowerSetpointValueAdjusted,
        },
        bessPowerSetpointCustom:
          lastSlice.bessPowerSetpointCustom !== null &&
          bessPowerSetpointCustomValueAdjusted !== undefined
            ? {
                value: lastSlice.bessPowerSetpointCustom.value,
                valueAdjusted: bessPowerSetpointCustomValueAdjusted,
              }
            : null,
        bessEffectiveSetpointValue,
        bessEffectiveSetpointEnergyEquivalent,
        bessChargedEnergy,
        bessDischargedEnergy,
        bessEnergyDeviation,
        priorityModeCustom,
        scheduleStatus,
        historyIntervals,
        gridPowerSetpoint: gridPowerSetpointValue,
        gridExportEnergyEquivalent,
        gridImportEnergyEquivalent,
        gridEnergyDeviation,
        exportedEnergy,
        importedEnergy,
      };
    },
  );

  // Determine integration period from intervals (assuming 15-minute intervals)
  const integrationPeriod = IntegrationPeriod.QuaterOfAnHour;

  // Derive schedule status history from intervals
  const scheduleStatusHistory = deriveScheduleStatusHistory(intervals);

  return {
    from: rangeStart,
    to: rangeEnd,
    plantId: dto.plantId,
    integrationPeriod,
    intervals,
    pvSetpointTargetCoefficient,
    bessSetpointTargetCoefficient,
    timeZone: plant.timeZone,
    scheduleStatusHistory,
  };
}

/**
 * Flattens intervals by extracting historyIntervals when available,
 * otherwise uses the interval itself.
 */
function flattenIntervals(
  intervals: PowerScheduleTrackingInterval[],
): PowerScheduleTrackingInterval[] {
  const flattened: PowerScheduleTrackingInterval[] = [];

  for (const interval of intervals) {
    if (interval.historyIntervals && interval.historyIntervals.length > 0) {
      // Use history intervals if available
      flattened.push(...interval.historyIntervals);
    } else {
      // Otherwise use the interval itself
      flattened.push(interval);
    }
  }

  return flattened;
}

/**
 * Derives schedule status history from intervals by grouping consecutive intervals
 * with the same schedule status (enabled/disabled).
 * First flattens intervals to get the actual time from history intervals.
 */
function deriveScheduleStatusHistory(
  intervals: PowerScheduleTrackingInterval[],
): Array<ScheduleStatusInterval> {
  // First flatten intervals to get the actual time from history intervals
  const flattenedIntervals = flattenIntervals(intervals);

  const history: Array<ScheduleStatusInterval> = [];
  let currentStatus: PowerScheduleStatus | null = null;
  let currentStart: Date | null = null;
  let lastValidIntervalEnd: Date | null = null;

  for (let i = 0; i < flattenedIntervals.length; i++) {
    const interval = flattenedIntervals[i];
    const status = interval.scheduleStatus;

    // Only process enabled/disabled status, ignore null/draft
    if (status !== 'enabled' && status !== 'disabled') {
      // If we had an active status, close it at the end of the last valid interval
      if (currentStatus !== null && currentStart !== null && lastValidIntervalEnd !== null) {
        history.push({
          interval: {
            start: currentStart,
            end: lastValidIntervalEnd,
          },
          status: currentStatus,
        });
        currentStatus = null;
        currentStart = null;
        lastValidIntervalEnd = null;
      }
      continue;
    }

    // If status changed, close previous and start new
    if (status !== currentStatus) {
      // Close previous status if exists
      if (currentStatus !== null && currentStart !== null && lastValidIntervalEnd !== null) {
        history.push({
          interval: {
            start: currentStart,
            end: lastValidIntervalEnd,
          },
          status: currentStatus,
        });
      }

      // Start new status
      currentStatus = status;
      currentStart = interval.interval.start;
      lastValidIntervalEnd = interval.interval.end;
    } else {
      // Same status, extend the range
      lastValidIntervalEnd = interval.interval.end;
    }
  }

  // Close any remaining open status at the end
  if (currentStatus !== null && currentStart !== null && lastValidIntervalEnd !== null) {
    history.push({
      interval: {
        start: currentStart,
        end: lastValidIntervalEnd,
      },
      status: currentStatus,
    });
  }

  return history;
}

function fixLastIntervalEndTime(intervalEnd: Date): Date {
  // NOTE:
  // This fixes the last incomplete interval.
  // This is caused by the fact that
  // intervals in power schedule are exclusive (end time is not included, e.g: 22:00:00.000),
  // but energy data requests use inclusive end times (E.g: 21:59:59.999).

  const milliseconds = intervalEnd.getMilliseconds();

  // E.g: '21:59:59.999'
  if (milliseconds === 999) {
    return addMilliseconds(intervalEnd, 1);
  }

  // E.g: '21:59:59'
  if (milliseconds === 0 && intervalEnd.getSeconds() === 59) {
    return addSeconds(intervalEnd, 1);
  }

  // No need to fix or a weird case
  // E.g: '21:59:59.123'

  return intervalEnd;
}
