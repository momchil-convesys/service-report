import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

const fullDayInMs = 1000 * 60 * 60 * 24;

@Pipe({
  name: 'relativeDate',
  pure: true,
})
export class RelativeDatePipe extends DatePipe implements PipeTransform {
  override transform(
    value: Date | string | number,
    format?: string,
    timezone?: string,
    locale?: string,
  ): string | null;
  override transform(
    value: null | undefined,
    format?: string,
    timezone?: string,
    locale?: string,
  ): null;
  override transform(
    value: Date | string | number | null | undefined,
    format?: string,
    timezone?: string,
    locale?: string,
  ): string | null {
    if (value === null || value === undefined) {
      // Let default pipe handle this
      return super.transform(value, format, timezone, locale);
    }

    const date = new Date(value);
    date.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayInMs = today.getTime();
    if (todayInMs === date.getTime()) {
      return $localize`Today`;
    }

    const yesterdayInMs = todayInMs - fullDayInMs;
    if (yesterdayInMs === date.getTime()) {
      return $localize`Yesterday`;
    }

    return super.transform(value, format, timezone, locale);
  }
}
