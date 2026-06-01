/**
 * Common code for deviation series (excess and shortage).
 */

import { formatNumber } from '@angular/common';
import { differenceInMinutes, isWithinInterval } from 'date-fns';
import { APP_LOCALE_ID } from 'src/app/app-locale';
import { multiplierForValue } from 'src/app/helpers';
import { PowerScheduleTrackingInterval } from '../_data/power-schedule-tracking.model';

export const deviationFromTargetTreshold = 100; // kWh

export function formatDataLabel(
  point: Highcharts.Point | Highcharts.PointLabelObject,
  options: Highcharts.DataLabelsOptions,
  deviationType: 'excess' | 'shortage',
): string | null {
  if (point.high === undefined || point.low === undefined || options.verticalAlign !== 'bottom') {
    return null;
  }

  const customData = (point as any).custom;

  if (
    customData &&
    customData.end &&
    customData.start &&
    differenceInMinutes(customData.end, customData.start) <= 15
  ) {
    // For 15 min intervals show data labels only when zoomed
    if ((point as any).pointWidth < 40) {
      return null;
    }
  }

  const now = new Date();

  const isCurrent = isWithinInterval(now, {
    start: (point as any).custom?.start,
    end: (point as any).custom?.end,
  });

  if (isCurrent) {
    return null;
  }

  let deviationValue: number | undefined = undefined;

  if (deviationType === 'excess') {
    deviationValue = point.high - point.low;
  } else if (deviationType === 'shortage') {
    deviationValue = point.low - point.high;
  }

  if (deviationValue === undefined) {
    return null;
  }

  if (
    deviationValue > deviationFromTargetTreshold ||
    deviationValue < -1 * deviationFromTargetTreshold
  ) {
    const sign = deviationValue > 0 ? '&uarr;' : '&darr;';
    const valueColor = '#d9343a';

    // Get the main series to determine multiplier
    const mainSeries = point.series.chart.series.find((s) => s.type === 'column');
    const dataMax = mainSeries?.dataMax;

    const multiplier = dataMax ? multiplierForValue(dataMax) : 1;

    const formattedDeviationValue = formatNumber(
      Math.abs(deviationValue) * multiplier,
      APP_LOCALE_ID,
      '1.0-0',
    );

    return `<div style='color: ${valueColor};'>${sign}${formattedDeviationValue}</div>`;
  }

  return null;
}

export function calculatePVDeviationPoints(
  intervals: PowerScheduleTrackingInterval[],
  deviationType: 'excess' | 'shortage',
): Highcharts.PointOptionsType[] {
  const seriesData: Highcharts.PointOptionsType[] = intervals
    .map((dataPoint) => {
      if (dataPoint.pvProduction === null) {
        return null;
      }

      // Use pre-calculated energy equivalent (prefer custom, then original, then effective)
      const setpointEquivalent = dataPoint.pvEffectiveSetpointEnergyEquivalent;

      if (setpointEquivalent === null) {
        return null;
      }

      if (deviationType === 'excess') {
        // Excess: actual production > setpoint equivalent
        if (setpointEquivalent >= dataPoint.pvProduction) {
          return null;
        }

        return {
          x: dataPoint.interval.start.getTime(),
          low: setpointEquivalent,
          high: dataPoint.pvProduction,
          custom: {
            start: dataPoint.interval.start,
            end: dataPoint.interval.end,
            dataPoint,
          },
          labelrank: 2,
        };
      }

      if (deviationType === 'shortage') {
        // Shortage: actual production < setpoint equivalent
        if (setpointEquivalent <= dataPoint.pvProduction) {
          return null;
        }

        return {
          x: dataPoint.interval.start.getTime(),
          low: dataPoint.pvProduction,
          high: setpointEquivalent,
          custom: {
            start: dataPoint.interval.start,
            end: dataPoint.interval.end,
            dataPoint,
          },
          labelrank: 2,
        };
      }

      return null;
    })
    .filter((p) => p !== null) as Highcharts.PointOptionsType[];

  return seriesData;
}

export function calculateBESSChargedDeviationPoints(
  intervals: PowerScheduleTrackingInterval[],
  deviationType: 'excess' | 'shortage',
): Highcharts.PointOptionsType[] {
  const seriesData: Highcharts.PointOptionsType[] = intervals
    .map((dataPoint) => {
      // Get effective setpoint to check if charging (negative)
      const bessPowerSetpointEffective =
        dataPoint.bessPowerSetpointCustom?.valueAdjusted ??
        dataPoint.bessPowerSetpoint.valueAdjusted ??
        dataPoint.bessPowerSetpointCustom?.value ??
        dataPoint.bessPowerSetpoint.value;

      // Charging occurs when setpoint is negative
      if (
        bessPowerSetpointEffective === null ||
        bessPowerSetpointEffective >= 0 ||
        dataPoint.bessChargedEnergy === null
      ) {
        return null;
      }

      // Use pre-calculated energy equivalent (prefer custom, then original, then effective)
      const setpointEquivalent = dataPoint.bessEffectiveSetpointEnergyEquivalent;

      if (setpointEquivalent === null) {
        return null;
      }

      if (deviationType === 'excess') {
        // Excess: actual charged > setpoint equivalent
        if (setpointEquivalent >= dataPoint.bessChargedEnergy) {
          return null;
        }

        return {
          x: dataPoint.interval.start.getTime(),
          // Negate both values to show below zero line
          low: -1 * dataPoint.bessChargedEnergy,
          high: -1 * setpointEquivalent,
          custom: {
            start: dataPoint.interval.start,
            end: dataPoint.interval.end,
            dataPoint,
          },
          labelrank: 2,
        };
      }

      if (deviationType === 'shortage') {
        // Shortage: actual charged < setpoint equivalent
        if (setpointEquivalent <= dataPoint.bessChargedEnergy) {
          return null;
        }

        return {
          x: dataPoint.interval.start.getTime(),
          // Negate both values to show below zero line
          low: -1 * setpointEquivalent,
          high: -1 * dataPoint.bessChargedEnergy,
          custom: {
            start: dataPoint.interval.start,
            end: dataPoint.interval.end,
            dataPoint,
          },
          labelrank: 2,
        };
      }

      return null;
    })
    .filter((p) => p !== null) as Highcharts.PointOptionsType[];

  return seriesData;
}

export function calculateBESSDischargedDeviationPoints(
  intervals: PowerScheduleTrackingInterval[],
  deviationType: 'excess' | 'shortage',
): Highcharts.PointOptionsType[] {
  const seriesData: Highcharts.PointOptionsType[] = intervals
    .map((dataPoint) => {
      // Get effective setpoint to check if discharging (positive)
      const bessPowerSetpointEffective =
        dataPoint.bessPowerSetpointCustom?.valueAdjusted ??
        dataPoint.bessPowerSetpoint.valueAdjusted ??
        dataPoint.bessPowerSetpointCustom?.value ??
        dataPoint.bessPowerSetpoint.value;

      // Discharging occurs when setpoint is positive
      if (
        bessPowerSetpointEffective === null ||
        bessPowerSetpointEffective <= 0 ||
        dataPoint.bessDischargedEnergy === null
      ) {
        return null;
      }

      // Use pre-calculated energy equivalent (prefer custom, then original, then effective)
      const setpointEquivalent = dataPoint.bessEffectiveSetpointEnergyEquivalent;

      if (setpointEquivalent === null) {
        return null;
      }

      if (deviationType === 'excess') {
        // Excess: actual discharged > setpoint equivalent
        if (setpointEquivalent >= dataPoint.bessDischargedEnergy) {
          return null;
        }

        return {
          x: dataPoint.interval.start.getTime(),
          low: setpointEquivalent,
          high: dataPoint.bessDischargedEnergy,
          custom: {
            start: dataPoint.interval.start,
            end: dataPoint.interval.end,
            dataPoint,
          },
          labelrank: 2,
        };
      }

      if (deviationType === 'shortage') {
        // Shortage: actual discharged < setpoint equivalent
        if (setpointEquivalent <= dataPoint.bessDischargedEnergy) {
          return null;
        }

        return {
          x: dataPoint.interval.start.getTime(),
          low: dataPoint.bessDischargedEnergy,
          high: setpointEquivalent,
          custom: {
            start: dataPoint.interval.start,
            end: dataPoint.interval.end,
            dataPoint,
          },
          labelrank: 2,
        };
      }

      return null;
    })
    .filter((p) => p !== null) as Highcharts.PointOptionsType[];

  return seriesData;
}
