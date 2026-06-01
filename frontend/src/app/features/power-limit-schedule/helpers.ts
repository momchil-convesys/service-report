import { isAfter, isBefore } from 'date-fns';
import { utcToZonedTimeSafe } from '../../helpers';
import { PowerLimitSchedule } from './_data/models';

export type PositionInTime = 'past' | 'present' | 'future';

export function getPositionInTimeForInterval(
  timestampStart: Date | number,
  timestampEnd: Date | number,
): PositionInTime {
  return getPositionInTime(timestampStart, timestampEnd);
}

export function getZonedPositionInTime(
  timestampStart: Date | number,
  timestampEnd: Date | number,
  timeZone: string | undefined,
): PositionInTime {
  const now = utcToZonedTimeSafe(new Date(), timeZone);

  if (isBefore(now, timestampStart)) {
    return 'future';
  }

  if (isAfter(now, timestampEnd)) {
    return 'past';
  }

  return 'present';
}

export function getPositionInTime(
  timestampStart: Date | number,
  timestampEnd: Date | number,
): PositionInTime {
  const now = new Date();

  if (isBefore(now, timestampStart)) {
    return 'future';
  }

  if (isAfter(now, timestampEnd)) {
    return 'past';
  }

  return 'present';
}

export function positionInTime(item: PowerLimitSchedule): PositionInTime {
  if (item.applicableInterval) {
    return getPositionInTimeForInterval(
      new Date(item.applicableInterval.timestampWithTimezoneStart),
      new Date(item.applicableInterval.timestampWithTimezoneEnd),
    );
  }

  return 'future';
}
