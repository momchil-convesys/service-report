import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

export function utcToZonedTimeSafe(
  timestamp: Date | number | string,
  timeZone: string | undefined,
): Date {
  if (!timeZone) {
    return new Date(timestamp);
  }
  // Returns a Date which will format as the local time of any time zone from a specific UTC time.
  return utcToZonedTime(timestamp, timeZone);
}

export function zonedTimeToUtcSafe(
  timestamp: Date | number | string,
  timeZone: string | undefined,
): Date {
  if (!timeZone) {
    return new Date(timestamp);
  }

  // Given a date and any time zone, returns a Date with the equivalent UTC time.
  return zonedTimeToUtc(timestamp, timeZone);
}
