import {
  addDays,
  addHours,
  addMonths,
  endOfDay,
  endOfMonth,
  startOfDay,
  startOfHour,
  startOfMonth,
  subDays,
} from 'date-fns';
import { PredefinedTimeRange } from '../constants';

export function getPredefinedRanges(): {
  [key in PredefinedTimeRange]: Date[];
} {
  const roundedMonth = addMonths(startOfMonth(new Date()), 1);
  const roundedDay = addDays(startOfDay(new Date()), 1);
  const roundedHour = addHours(startOfHour(new Date()), 1);
  return {
    [PredefinedTimeRange.RealTime]: [roundedHour, roundedHour],
    [PredefinedTimeRange.Last24Hours]: [subDays(roundedHour, 1), roundedHour],
    [PredefinedTimeRange.Last7Days]: [subDays(roundedDay, 7), endOfDay(new Date())],
    [PredefinedTimeRange.Last30Days]: [subDays(roundedDay, 30), endOfDay(new Date())],
    [PredefinedTimeRange.Last12Months]: [subDays(roundedMonth, 365), endOfMonth(new Date())],
  };
}

export function getPredefinedRangesNotRounded(): {
  [key in PredefinedTimeRange]: Date[];
} {
  const now = new Date();

  return {
    [PredefinedTimeRange.RealTime]: [now, now],
    [PredefinedTimeRange.Last24Hours]: [subDays(now, 1), now],
    [PredefinedTimeRange.Last7Days]: [subDays(now, 7), now],
    [PredefinedTimeRange.Last30Days]: [subDays(now, 30), now],
    [PredefinedTimeRange.Last12Months]: [subDays(now, 365), now],
  };
}

export function convertPredefinedRange(
  range: PredefinedTimeRange | Date[],
  roundPredefined: boolean = true,
): Date[] {
  if (range.constructor.name === 'String') {
    const ranges = roundPredefined ? getPredefinedRanges() : getPredefinedRangesNotRounded();
    return ranges[<PredefinedTimeRange>range];
  }

  return <Date[]>range;
}

export function isSameTimeRangeRequested(
  rangeA: PredefinedTimeRange | Date[] | undefined,
  rangeB: PredefinedTimeRange | Date[] | undefined,
): boolean {
  if (!rangeA || !rangeB) {
    return false;
  }

  if (rangeA.constructor.name !== rangeB.constructor.name) {
    return false;
  }

  if (rangeA.constructor.name === 'String' && rangeB.constructor.name === 'String') {
    return rangeA === rangeB;
  }

  return (
    (rangeA[0] as Date).getTime() === (rangeB[0] as Date).getTime() &&
    (rangeA[1] as Date).getTime() === (rangeB[1] as Date).getTime()
  );
}

export function copyTimeRange(
  range: PredefinedTimeRange | Date[] | undefined,
): PredefinedTimeRange | Date[] | undefined {
  if (!range || range.constructor.name === 'String') {
    return range;
  }

  return [new Date(range[0] as Date), new Date(range[1] as Date)];
}
