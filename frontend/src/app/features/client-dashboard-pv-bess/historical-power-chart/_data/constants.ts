import { differenceInMilliseconds } from 'date-fns';
import { ONE_DAY, ONE_HOUR, ONE_MINUTE, ONE_SECOND } from '../../../../constants';

export type DataResolutionPeriod = '1s' | '5s' | '15s' | '30s' | '1m' | '1h' | '1d';
export type DataAggregationFunction = 'avg' | 'last';

export function resolutionToMilliseconds(res: DataResolutionPeriod): number {
  switch (res) {
    case '1s':
      return ONE_SECOND;
    case '5s':
      return ONE_SECOND * 5;
    case '15s':
      return ONE_SECOND * 15;
    case '30s':
      return ONE_SECOND * 30;
    case '1m':
      return ONE_MINUTE;
    case '1h':
      return ONE_HOUR;
    case '1d':
      return ONE_DAY;
    default:
      throw new Error(`Unknown resolution period: ${res}`);
  }
}

export function resolutionForRange(start: number | Date, end: number | Date): DataResolutionPeriod {
  const rangeInMilliseconds = differenceInMilliseconds(end, start);

  if (rangeInMilliseconds > ONE_HOUR * 3) {
    return '1m';
  }

  if (rangeInMilliseconds > ONE_MINUTE * 60) {
    return '5s';
  }

  return '1s';
}

export function keepLastPerSecond<T extends { timestamp: Date }>(points: readonly T[]): T[] {
  const map = new Map<number, T>();

  for (const point of points) {
    const second = Math.floor(point.timestamp.getTime() / 1000);
    map.set(second, point); // overwrites earlier point in same second
  }

  return Array.from(map.values());
}

/**
 * Check for reverse order of points.
 * Sometimes points coming from the server are with the same timestamp.
 * This is not allowed and should be rejected.
 */

export function filterDuplicateTimestampPoints<T extends { timestamp: Date }>(
  points: readonly T[],
  lastKnownPoint: T | undefined,
): T[] {
  if (!points.length) return [];

  // Sort to avoid false "reverse order" when server sends a batch out of order
  const sorted = [...points].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  const baselineTimestamp = lastKnownPoint ? lastKnownPoint.timestamp.getTime() : -Infinity;

  let prev = baselineTimestamp;

  const goodPoints: T[] = [];
  for (const p of sorted) {
    const curr = p.timestamp.getTime();

    if (curr <= prev) {
      console.warn(
        'Application warning: Dropping non-increasing points in DATA_APPEND batch.',
        new Date(curr).toISOString(),
      );

      continue; // drop duplicates/out-of-order
    }

    goodPoints.push(p);
    prev = curr;
  }

  return goodPoints;
}
