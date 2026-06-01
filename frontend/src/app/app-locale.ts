import { formatDate } from '@angular/common';
import { IntegrationPeriod } from './constants';
import { utcToZonedTimeSafe } from './helpers';

// Access locale id without injection
export let APP_LOCALE_ID: string = 'en-GB';

export function setAppLocaleId(localeId: string) {
  APP_LOCALE_ID = localeId;
}

const LOCAL_STORAGE_KEY_SELECTED_LOCALE_ID = 'cmsUserSelectedLocaleId';

function getUserSelectedLocaleId(): string | null {
  return localStorage.getItem(LOCAL_STORAGE_KEY_SELECTED_LOCALE_ID);
}

export function setUserSelectedLocaleId(localeId: string) {
  localStorage.setItem(LOCAL_STORAGE_KEY_SELECTED_LOCALE_ID, localeId);
}

export function appInitilizeLocale(injectedLocale: string) {
  setAppLocaleId(injectedLocale);

  // const userSelectedLocaleId = getUserSelectedLocaleId();
  // if (
  //   userSelectedLocaleId &&
  //   userSelectedLocaleId !== injectedLocale &&
  //   environment.production === true
  // ) {
  //   window.location.href = window.location.href.replace(injectedLocale, userSelectedLocaleId);
  // }
}

/**
 * Numbers format
 */

export function getDecimalSeparator(): string {
  const numberWithDecimalSeparator = 1.1;
  return (
    Intl.NumberFormat(APP_LOCALE_ID)
      .formatToParts(numberWithDecimalSeparator)
      .find((part) => part.type === 'decimal')?.value || '.'
  );
}

export function localizedNumber(value: string | number): number {
  const decimalPointSymbol = getDecimalSeparator();
  const replacedDecimalPoint = value.toString().replace(decimalPointSymbol, '.');
  const valueAsNumber: number = Number(replacedDecimalPoint);

  return valueAsNumber;
}

/**
 * Date formatting
 *
 * Generic date format:
 *    EEEE, d MMMM y, HH:mm:ss
 *
 * Examples:
 *    Monday, 18 November 2024, 13:40:33
 *    понеделник, 18 ноември 2024 г., 13:40:33
 */

export function getLocaleFormatForWeekStartInDatePicker() {
  // TODO: find alternative with Intl DateTimeFormat
  // "mediumDate" or other predefined formats do not work here
  return 'd MMM y';
}

export function formatTimestampForTooltip(
  timestamp: Date | number | string,
  timeZone: string | undefined,
  options?: {
    customFormat?: string;
  },
) {
  const convertedTimestamp = utcToZonedTimeSafe(timestamp, timeZone);
  return formatDate(
    convertedTimestamp,
    options?.customFormat || 'EEEE, d MMMM, HH:mm:ss',
    APP_LOCALE_ID,
  );
}

export function formatIntervalForTooltip(
  applicableRange: Interval,
  timeZone: string | undefined,
  showSeconds?: boolean,
): string {
  return formatIntervalForDataExport(applicableRange, timeZone, false, showSeconds);
}

export function formatPreciseIntervalForXRangeTooltip(
  applicableRange: Interval,
  timeZone: string | undefined,
): string {
  const convertedTimestampFrom = utcToZonedTimeSafe(applicableRange.start, timeZone);
  const convertedTimestampTo = utcToZonedTimeSafe(applicableRange.end, timeZone);

  const formattedDate =
    formatDate(convertedTimestampFrom, `'d MMM`, APP_LOCALE_ID) +
    ' ' +
    formatDate(convertedTimestampFrom, `HH:mm:ss`, APP_LOCALE_ID) +
    '–' +
    formatDate(convertedTimestampTo, 'HH:mm:ss', APP_LOCALE_ID);

  return formattedDate;
}

/**
 * Data export timestamps
 */

export function formatTimestampForDataExport(
  timestamp: Date | number | string,
  timeZone: string | undefined,
  integrationPeriod?: IntegrationPeriod,
  useSlashDelimiter?: boolean,
) {
  const convertedTimestamp = utcToZonedTimeSafe(timestamp, timeZone);

  let showTime = true;
  let dateFormat = 'd MMMM y';

  switch (integrationPeriod) {
    case IntegrationPeriod.Days:
      showTime = false;
      break;

    case IntegrationPeriod.Months:
      dateFormat = 'MMMM y';
      showTime = false;
      break;

    case IntegrationPeriod.Years:
      dateFormat = 'y';
      showTime = false;
      break;
  }

  let result = formatDate(convertedTimestamp, dateFormat, APP_LOCALE_ID);

  if (showTime) {
    const delimiter = useSlashDelimiter ? `  |  ` : `, `;
    result += delimiter;
    result += formatDate(convertedTimestamp, `HH:mm:ss`, APP_LOCALE_ID);
  }

  return result;
}

export function formatIntervalForDataExport(
  applicableRange: Interval,
  timeZone: string | undefined,
  useSlashDelimiter?: boolean,
  showSeconds?: boolean,
): string {
  const convertedTimestampFrom = utcToZonedTimeSafe(applicableRange.start, timeZone);
  const convertedTimestampTo = utcToZonedTimeSafe(applicableRange.end, timeZone);

  const delimiter = useSlashDelimiter ? `  |  ` : `, `;

  const timeFormat = showSeconds ? `HH:mm:ss` : `HH:mm`;

  const formattedDate =
    formatDate(convertedTimestampFrom, `'d MMMM`, APP_LOCALE_ID) +
    delimiter +
    formatDate(convertedTimestampFrom, timeFormat, APP_LOCALE_ID) +
    '–' +
    formatDate(convertedTimestampTo, timeFormat, APP_LOCALE_ID);

  return formattedDate;
}

export function formatIntervalForDataExportFileName(
  applicableRange: Interval,
  timeZone: string | undefined,
): string {
  const convertedTimestampFrom = utcToZonedTimeSafe(applicableRange.start, timeZone);
  const convertedTimestampTo = utcToZonedTimeSafe(applicableRange.end, timeZone);

  let formattedDate = formatDate(convertedTimestampFrom, `yyyy-MM-dd`, APP_LOCALE_ID);

  if (!isSameDate(convertedTimestampFrom, convertedTimestampTo)) {
    formattedDate += `_` + formatDate(convertedTimestampTo, `yyyy-MM-dd`, APP_LOCALE_ID);
  }

  return formattedDate;
}

/**
 * Date helpers
 */
function isSameDate(dateLeft: Date, dateRight: Date): boolean {
  if (
    dateLeft.getFullYear() === dateRight.getFullYear() &&
    dateLeft.getMonth() === dateRight.getMonth() &&
    dateLeft.getDay() === dateRight.getDay()
  ) {
    return true;
  }

  return false;
}
