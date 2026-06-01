import { isAfter, isBefore } from 'date-fns';
import { utcToZonedTimeSafe } from '../../helpers';

export type PositionInTime = 'past' | 'present' | 'future';

export function calculatePositionInTimeRelativeToInterval(
  interval: Interval,
  timeZone: string | undefined,
): PositionInTime {
  const nowInPlantTimeZone = utcToZonedTimeSafe(new Date(), timeZone);

  const timestampStart = utcToZonedTimeSafe(interval.start, undefined);
  const timestampEnd = utcToZonedTimeSafe(interval.end, undefined);

  if (isBefore(nowInPlantTimeZone, timestampStart)) {
    return 'future';
  }

  if (isAfter(nowInPlantTimeZone, timestampEnd)) {
    return 'past';
  }

  return 'present';
}
