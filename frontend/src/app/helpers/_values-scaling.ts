import { formatNumber } from '@angular/common';
import { APP_LOCALE_ID } from '../app-locale';

export function roundValue(value: number | null, precisionMultiplier: number): number | null {
  return value ? Math.round(value * precisionMultiplier) / precisionMultiplier : value;
}

export function multiplierForValue(value: number) {
  let multiplier = 1;

  const absoluteValue = Math.abs(value);
  if (absoluteValue >= 1000000000) {
    multiplier = 0.000000001;
  } else if (absoluteValue >= 1000000) {
    multiplier = 0.000001;
  } else if (absoluteValue >= 1000) {
    multiplier = 0.001;
  }

  return multiplier;
}

export function precisionFormatForMultiplier(multiplier: number): string {
  if (multiplier === 0.000000001) {
    return '1.0-3';
  } else if (multiplier === 0.000001) {
    return '1.0-2';
  } else if (multiplier === 0.001) {
    return '1.0-1';
  } else if (multiplier === 1) {
    return '1.0-1';
  }

  return '1.0-0';
}

export function roundedValueForMultiplier(multiplier: number, value: number): number {
  if (multiplier === 0.000000001) {
    return Math.round(value * 1000) / 1000;
  } else if (multiplier === 0.000001) {
    return Math.round(value * 100) / 100;
  } else if (multiplier === 0.001) {
    return Math.round(value * 10) / 10;
  }

  return Math.round(value);
}

export function formattedStackLabelForUnit(unit: string, value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (unit === 'TWh') {
    return formatNumber(value, APP_LOCALE_ID, '1.1-1');
  } else if (unit === 'GWh') {
    return formatNumber(value, APP_LOCALE_ID, '1.1-1');
  } else if (unit === 'MWh') {
    return formatNumber(value, APP_LOCALE_ID, '1.1-1');
  }

  return formatNumber(value, APP_LOCALE_ID, '1.0-0');
}

export function decimalsPrecisionForMultiplier(multiplier: number): number {
  if (multiplier === 0.000000001) {
    return 3;
  } else if (multiplier === 0.000001) {
    return 2;
  } else if (multiplier === 0.001) {
    return 1;
  } else if (multiplier === 1) {
    return 0;
  }

  return 0;
}

export const BaseUnits = ['W', 'Wh', 'VAR', 'VARh'] as const;
export type BaseUnit = (typeof BaseUnits)[number];

/**
 * baseUnit = W, Wh, VAR, VARh
 * multiplier = 1 for kilo
 */
export function prependBaseUnitForMultiplier(
  baseUnit: BaseUnit,
  multiplier: number | undefined,
): string {
  let unit = '';

  if (multiplier === 0.000000001) {
    unit = 'T' + baseUnit;
  } else if (multiplier === 0.000001) {
    unit = 'G' + baseUnit;
  } else if (multiplier === 0.001) {
    unit = 'M' + baseUnit;
  } else if (multiplier === 1) {
    unit = 'k' + baseUnit;
  }

  return unit;
}

export function powerUnitForMultiplier(multiplier: number): string {
  return prependBaseUnitForMultiplier('W', multiplier);
}

export function energyUnitForMultiplier(multiplier: number): string {
  return prependBaseUnitForMultiplier('Wh', multiplier);
}

export function reactivePowerUnitForMultiplier(multiplier: number): string {
  return prependBaseUnitForMultiplier('VAR', multiplier);
}

export function reactiveEnergyUnitForMultiplier(multiplier: number): string {
  return prependBaseUnitForMultiplier('VARh', multiplier);
}
