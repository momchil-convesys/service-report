/**
 * The following function is a replacement for Angular's formatNumber,
 * which does not use Intl API.
 *
 * The main difference is when formatting four digit numbers in Bulgarian locale.
 * E.g: 12345 should be formatted as "12 345", which works with both Angular and Intl,
 * but 1234 should be formatted as "1234", which works only with Intl.
 *
 * TODO: replace all usages of formatNumber with formatNumber_Intl
 */

export function formatNumber_Intl(value: number, locale: string, digitsInfo?: string): string {
  return new Intl.NumberFormat(locale, angularNumberFormatToIntlOptions(digitsInfo)).format(value);
}

/**
 * digitsInfo is in the format
 * {minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}
 * E.g: '1.1-1'
 */
function angularNumberFormatToIntlOptions(
  digitsInfo?: string,
): Intl.NumberFormatOptions | undefined {
  if (!digitsInfo) {
    return undefined;
  }

  const [integer, fraction] = digitsInfo.split('.');

  const minimumIntegerDigits = Number(integer);
  const [minimumFractionDigits, maximumFractionDigits] = fraction?.split('-').map(Number) || [
    undefined,
    undefined,
  ];

  return {
    minimumIntegerDigits,
    minimumFractionDigits,
    maximumFractionDigits,
  };
}
