import { seriesName_PVSetpointEnergyEquivalent } from 'src/app/constants/_chart-series-titles';
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

const seriesColor_PVSetpointAdjusted = '#b3222c';

export const seriesId_PVSetpointAdjusted = 'seriesId_PVSetpointAdjusted';

const sharedSeriesOptions: Highcharts.SeriesOptionsType = {
  type: 'xrange',
  colorByPoint: false,
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

export const seriesOptions_PVSetpoints: Highcharts.SeriesOptionsType[] = [
  {
    ...sharedSeriesOptions,
    id: seriesId_PVSetpointAdjusted,
    color: seriesColor_PVSetpointAdjusted,
    visible: true,
    name: seriesName_PVSetpointEnergyEquivalent,
  },
];

export function updateSeriesData_PVSetpoints(chart: Highcharts.Chart, data: PowerScheduleTracking) {
  // PV Setpoint Adjusted - use pre-calculated energy equivalent
  const pvSetpointAdjustedData: ExtendedSetpointPoint[] = data.intervals
    .filter((dataPoint) => {
      const setpoint = dataPoint.pvPowerSetpointCustom ?? dataPoint.pvPowerSetpoint;
      return setpoint.valueAdjusted !== null;
    })
    .map((dataPoint) => {
      const setpoint = dataPoint.pvPowerSetpointCustom ?? dataPoint.pvPowerSetpoint;
      const powerValueAdjusted = setpoint.valueAdjusted!;

      // Use pre-calculated energy equivalent (prefer custom, then original, then effective)
      const energyKWh = dataPoint.pvEffectiveSetpointEnergyEquivalent ?? 0;

      return {
        x: dataPoint.interval.start.getTime(),
        x2: dataPoint.interval.end.getTime(),
        y: energyKWh > 0 ? energyKWh : 0,
        color: seriesColor_PVSetpointAdjusted + 'ff',
        custom: {
          dataPoint,
          isCustom: dataPoint.pvPowerSetpointCustom !== null,
          isPV: true,
          powerValue: setpoint.value,
          powerValueAdjusted: powerValueAdjusted,
        },
      };
    });

  seriesById(chart, seriesId_PVSetpointAdjusted)?.setData(pvSetpointAdjustedData, false, false);
}
