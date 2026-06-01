import { formatNumber } from '@angular/common';
import { APP_LOCALE_ID } from '../app-locale';
import { formatUnitSpacing } from './_unit-spacing-format';

export function formatValueForTooltip(
  value: number | null | undefined,
  unit: string,
  format = '1.0-3',
): string {
  const formattedValue =
    value !== undefined && value !== null
      ? formatNumber(value, APP_LOCALE_ID, format) + formatUnitSpacing(unit)
      : '&mdash;';

  return formattedValue;
}
