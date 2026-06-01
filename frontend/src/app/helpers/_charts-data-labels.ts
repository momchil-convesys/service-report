import { formatNumber } from '@angular/common';
import { APP_LOCALE_ID } from '../app-locale';
import { BaseUnit, multiplierForValue, prependBaseUnitForMultiplier } from './_values-scaling';

/**
 * Used for data labels.
 */
export function scaleAndFormatPowerValue(
  value: number | null | undefined,
  scaleBaseValue: number | undefined,
  options: {
    includeUnit: boolean;
    floorValue: boolean;
  },
): string {
  return scaleAndFormatValue(
    value,
    scaleBaseValue,
    options.includeUnit ? 'W' : undefined,
    options.floorValue,
  );
}

/**
 * Used for data labels.
 */
export function scaleAndFormatEnergyValue(
  value: number | null | undefined,
  scaleBaseValue: number | undefined,
  includeUnit: boolean,
): string {
  return scaleAndFormatValue(value, scaleBaseValue, includeUnit ? 'Wh' : undefined);
}

export function scaleAndFormatValue(
  value: number | null | undefined,
  scaleBaseValue: number | undefined,
  baseUnit: BaseUnit | undefined,
  floorValue: boolean = false,
): string {
  if (value === null || value === undefined) {
    return '—';
  }

  const multiplier = scaleBaseValue ? multiplierForValue(scaleBaseValue) : 1;
  const scaledValue = Number(value) * multiplier;

  // Show whole number in default unit if value is not scaled
  // Show one decimal after the point for scaled values
  const decimals = multiplier === 1 ? 0 : 1;

  let adjustedValue = scaledValue;
  if (floorValue && decimals) {
    const factor = Math.pow(10, decimals);
    adjustedValue = Math.floor(scaledValue * factor) / factor;
  }

  const formattedValue = formatNumber(adjustedValue, APP_LOCALE_ID, `0.0-${decimals}`);

  if (!baseUnit) {
    return formattedValue;
  }

  const unit = prependBaseUnitForMultiplier(baseUnit, multiplier);

  return `${formattedValue} ${unit}`;
}

export function scaleAndFormatValue_v2(
  value: number | null | undefined,
  scaleBaseValue: number | null | undefined,
  baseUnit: BaseUnit | undefined,
  extraDecimals?: number | undefined,
): { value: string | null; unit: string | undefined } {
  if (value === null || value === undefined || isNaN(value)) {
    return {
      value: '—',
      unit: undefined,
    };
  }

  const multiplier = scaleBaseValue ? multiplierForValue(scaleBaseValue) : 1;
  const scaledValue = Number(value) * multiplier;

  // Show whole number in default unit if value is not scaled
  // Show one decimal after the point for scaled values
  const decimals = multiplier === 1 ? 0 : 1 + (extraDecimals ?? 0);
  const formattedValue = formatNumber(scaledValue, APP_LOCALE_ID, `0.0-${decimals}`);

  if (!baseUnit) {
    return {
      value: formattedValue,
      unit: undefined,
    };
  }

  const unit = prependBaseUnitForMultiplier(baseUnit, multiplier);

  return {
    value: formattedValue,
    unit: unit,
  };
}
