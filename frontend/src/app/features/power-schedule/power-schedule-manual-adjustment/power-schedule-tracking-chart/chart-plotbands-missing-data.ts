import Highcharts from 'src/app/highcharts-global-config';
import {
  PowerScheduleTracking,
  PowerScheduleTrackingInterval,
} from '../_data/power-schedule-tracking.model';

const plotBandIdPrefix_MissingData = 'plotBandId_MissingData_';

/**
 * Updates plotbands to visualize missing energy data in past periods.
 * Only shows plotbands for intervals that are in the past and have null energy data.
 */
export function updatePlotBandsForMissingData(
  chart: Highcharts.Chart,
  data: PowerScheduleTracking | undefined,
  isEnergyDataNull: (interval: PowerScheduleTrackingInterval) => boolean,
) {
  // Remove all existing missing data plotbands
  const storedPlotBandIds = (chart as any).missingDataPlotBandIds as string[] | undefined;
  if (storedPlotBandIds) {
    storedPlotBandIds.forEach((id) => {
      try {
        chart.xAxis[0].removePlotBand(id);
      } catch {
        // Ignore errors when plotband doesn't exist
      }
    });
  }
  (chart as any).missingDataPlotBandIds = [];

  if (!data || data.intervals.length === 0) {
    return;
  }

  const plotBands: Highcharts.XAxisPlotBandsOptions[] = [];
  const plotBandIds: string[] = [];
  let missingDataStart: Date | null = null;
  let missingDataEnd: Date | null = null;
  const now = Date.now();
  let plotBandIdCounter = 0;

  // Find consecutive intervals with missing data in the past
  for (const interval of data.intervals) {
    const isPast = interval.interval.end.getTime() < now;
    const hasNullEnergy = isEnergyDataNull(interval);

    if (isPast && hasNullEnergy) {
      // Start or continue a missing data period
      if (!missingDataStart) {
        missingDataStart = interval.interval.start;
      }
      missingDataEnd = interval.interval.end;
    } else {
      // End of missing data period - create plotband if we have one
      if (missingDataStart && missingDataEnd) {
        const plotBandId = `${plotBandIdPrefix_MissingData}${plotBandIdCounter++}`;
        plotBands.push({
          id: plotBandId,
          color: '#b2c1cd' + '33', // @gray-5 + opacity
          from: missingDataStart.getTime(),
          to: missingDataEnd.getTime(),
          zIndex: 2,
        });
        plotBandIds.push(plotBandId);
        missingDataStart = null;
        missingDataEnd = null;
      }
    }
  }

  // Handle case where missing data extends to the end of the data
  if (missingDataStart && missingDataEnd) {
    const plotBandId = `${plotBandIdPrefix_MissingData}${plotBandIdCounter++}`;
    plotBands.push({
      id: plotBandId,
      color: '#b2c1cd' + '33', // @gray-5 + opacity
      from: missingDataStart.getTime(),
      to: missingDataEnd.getTime(),
      zIndex: 2,
    });
    plotBandIds.push(plotBandId);
  }

  // Add all plotbands and store their IDs
  plotBands.forEach((plotBand) => {
    chart.xAxis[0].addPlotBand(plotBand);
  });
  (chart as any).missingDataPlotBandIds = plotBandIds;
}

/**
 * Check if PV production energy data is null for an interval
 */
export function isPVProductionNull(interval: PowerScheduleTrackingInterval): boolean {
  return interval.pvProduction === null || interval.pvProduction === undefined;
}

/**
 * Check if BESS energy data is null for an interval (either charged or discharged)
 */
export function isBESSEnergyNull(interval: PowerScheduleTrackingInterval): boolean {
  return (
    (interval.bessChargedEnergy === null || interval.bessChargedEnergy === undefined) &&
    (interval.bessDischargedEnergy === null || interval.bessDischargedEnergy === undefined)
  );
}

/**
 * Check if Grid energy data is null for an interval (either exported or imported)
 */
export function isGridEnergyNull(interval: PowerScheduleTrackingInterval): boolean {
  return (
    (interval.exportedEnergy === null || interval.exportedEnergy === undefined) &&
    (interval.importedEnergy === null || interval.importedEnergy === undefined)
  );
}
