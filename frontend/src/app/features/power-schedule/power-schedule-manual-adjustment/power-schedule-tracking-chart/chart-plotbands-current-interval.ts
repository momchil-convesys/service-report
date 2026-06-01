import { ClockService } from 'src/app/data/services/clock.service';
import Highcharts from 'src/app/highcharts-global-config';
import {
  PowerScheduleTracking,
  PowerScheduleTrackingInterval,
} from '../_data/power-schedule-tracking.model';

const plotBandId_CurrentInterval = 'plotBandId_CurrentInterval_PowerScheduleTracking';

const currentIntervalColor = '#fff9e6'; // @gold-1

/**
 * Updates plotband to highlight the current interval in the chart.
 * Similar to how the table highlights the current interval row.
 */
export function updatePlotBandsForCurrentInterval(
  chart: Highcharts.Chart,
  data: PowerScheduleTracking | undefined,
  clock: ClockService,
  timeZone: string | undefined,
) {
  // Remove existing plot band if it exists
  const axis = chart.xAxis.length > 0 ? chart.xAxis[0] : null;

  if (!axis) {
    return;
  }

  axis.removePlotBand(plotBandId_CurrentInterval);

  if (!data || data.intervals.length === 0) {
    return;
  }

  // Find the current interval (where positionInTime is 'present')
  let currentInterval: PowerScheduleTrackingInterval | null = null;

  for (const interval of data.intervals) {
    const position = clock.getZonedPositionInTimeForInterval(interval.zonedInterval, timeZone);

    if (position === 'present') {
      currentInterval = interval;
      // Once we find the current interval, we can stop (intervals are sorted)
      break;
    } else if (position === 'future') {
      // We've reached future intervals, stop processing
      break;
    }
  }

  // Add plot band for current interval
  if (currentInterval) {
    axis.addPlotBand({
      id: plotBandId_CurrentInterval,
      color: currentIntervalColor,
      zIndex: 2,
      from: currentInterval.interval.start.getTime(),
      to: currentInterval.interval.end.getTime(),
    });
  }
}
