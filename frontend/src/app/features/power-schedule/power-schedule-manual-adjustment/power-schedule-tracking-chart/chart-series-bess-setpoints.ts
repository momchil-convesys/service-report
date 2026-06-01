import {
  semanticColor_BESSSetpointCharging,
  semanticColor_BESSSetpointDischarging,
} from 'src/app/constants/_chart-series-colors';
import { seriesName_BESSSetpointEnergyEquivalent } from 'src/app/constants/_chart-series-titles';
import { seriesById } from 'src/app/helpers';
import { excludeSeriesFromCrossHairClassName } from 'src/app/highcharts-global-config';
import {
  PowerScheduleTracking,
  PowerScheduleTrackingInterval,
} from '../_data/power-schedule-tracking.model';

export interface ExtendedSetpointPoint {
  x: number;
  x2: number;
  y: number; // Energy equivalent in kWh
  color: string;
  custom: {
    dataPoint: PowerScheduleTrackingInterval;
    isCustom: boolean;
    isPV: boolean;
    powerValue: number | null; // Original power value in kW (for tooltip)
    powerValueAdjusted: number | null; // Adjusted power value in kW (for tooltip)
  };
}

export const seriesId_BESSSetpointAdjusted = 'seriesId_BESSSetpointAdjusted';

const sharedSeriesOptions: Highcharts.SeriesOptionsType = {
  type: 'xrange',
  colorByPoint: true,
  grouping: false,
  pointWidth: 1,
  className: excludeSeriesFromCrossHairClassName,
  borderWidth: 0,
  borderColor: '#ffffff00',
  borderRadius: 0,
  stickyTracking: false,
  states: {
    inactive: {
      opacity: 0.9,
    },
  },
  legendSymbol: 'lineMarker',
};

export const seriesOptions_BESSSetpoints: Highcharts.SeriesOptionsType[] = [
  {
    ...sharedSeriesOptions,
    id: seriesId_BESSSetpointAdjusted,
    visible: true,
    name: seriesName_BESSSetpointEnergyEquivalent,
  },
];

export function updateSeriesData_BESSSetpoints(
  chart: Highcharts.Chart,
  data: PowerScheduleTracking,
) {
  // BESS Setpoint Adjusted - use pre-calculated energy equivalent
  const bessSetpointAdjustedData: ExtendedSetpointPoint[] = data.intervals
    .filter((dataPoint) => {
      const setpoint = dataPoint.bessPowerSetpointCustom ?? dataPoint.bessPowerSetpoint;
      return setpoint.valueAdjusted !== null;
    })
    .map((dataPoint) => {
      const setpoint = dataPoint.bessPowerSetpointCustom ?? dataPoint.bessPowerSetpoint;
      const powerValueAdjusted = setpoint.valueAdjusted!;

      // Use pre-calculated energy equivalent (prefer custom, then original, then effective)
      const energyKWh = dataPoint.bessEffectiveSetpointEnergyEquivalent ?? 0;

      // Set color based on charge/discharge: negative = charging (darker cyan/blue), positive = discharging (darker green)
      const pointColor =
        powerValueAdjusted < 0
          ? semanticColor_BESSSetpointCharging + 'ff' // Charging: darker cyan/blue (@cyan-8)
          : semanticColor_BESSSetpointDischarging + 'ff'; // Discharging: darker green (@green-fresh-7)

      // For charging (negative power), negate the y value to show below zero line
      const isCharging = powerValueAdjusted < 0;
      const yValue = energyKWh > 0 ? energyKWh : 0;

      return {
        x: dataPoint.interval.start.getTime(),
        x2: dataPoint.interval.end.getTime(),
        y: isCharging ? -1 * yValue : yValue,
        color: pointColor,
        custom: {
          dataPoint,
          isCustom: dataPoint.bessPowerSetpointCustom !== null,
          isPV: false,
          powerValue: setpoint.value,
          powerValueAdjusted: powerValueAdjusted,
        },
      };
    });

  seriesById(chart, seriesId_BESSSetpointAdjusted)?.setData(bessSetpointAdjustedData, false, false);
}
