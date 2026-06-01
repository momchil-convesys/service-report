import { addHours, subHours } from 'date-fns';
import { utcToZonedTimeSafe } from '../helpers';
import { DatetimeRangeModel } from '../shared/datetime-range-select/models';

export const DAYLIGHT_HOURS_START = 5; // 05:00
export const DAYLIGHT_HOURS_END = 22; // 22:00

export function daylightIntervalForDate(
  targetRange: DatetimeRangeModel,
  timeZone: string | undefined,
): Interval {
  let newMinDate = utcToZonedTimeSafe(targetRange.from, timeZone);
  let newMaxDate = utcToZonedTimeSafe(targetRange.to, timeZone);

  newMinDate = addHours(newMinDate, DAYLIGHT_HOURS_START);
  newMaxDate = subHours(newMaxDate, 24 - DAYLIGHT_HOURS_END);

  return {
    start: newMinDate,
    end: newMaxDate,
  };
}
