import {
  addDays,
  addHours,
  addMinutes,
  addMonths,
  addSeconds,
  differenceInDays,
  differenceInHours,
  getDaysInMonth,
  isBefore,
  subDays,
  subHours,
  subMinutes,
  subMonths,
  subSeconds,
} from 'date-fns';
import { IntegrationPeriod, ONE_DAY, ONE_HOUR, ONE_MINUTE } from '../constants';

export function calculateIntegrationPeriodForTimeRange(range: Date[]): IntegrationPeriod {
  let diff = differenceInHours(range[1], range[0]);
  if (diff <= 72) {
    return IntegrationPeriod.Hours;
  }

  diff = differenceInDays(range[1], range[0]);
  if (diff <= 60) {
    return IntegrationPeriod.Days;
  }

  return IntegrationPeriod.Months;
}

export function iteratorForIntegrationPeriod(
  period: IntegrationPeriod,
): (date: Date | number, amount: number) => Date {
  switch (period) {
    case IntegrationPeriod.Hours:
      return addHours;

    case IntegrationPeriod.Days:
      return addDays;

    case IntegrationPeriod.Months:
      return addMonths;

    default:
      return addDays;
  }
}

export function shiftedIntegrationPeriod(date: Date, period: IntegrationPeriod): Date {
  switch (period) {
    case IntegrationPeriod.Hours:
      return subMinutes(date, 30);

    case IntegrationPeriod.Days:
      return subHours(date, 12);

    case IntegrationPeriod.Months: {
      return subDays(date, getDaysInMonth(date) / 2);
    }

    default:
      return date;
  }
}

export function integrationPeriodTicks(
  range: Date[],
  integrationPeriod: IntegrationPeriod,
): Date[] {
  const result: Date[] = [];
  const calcFunction = iteratorForIntegrationPeriod(integrationPeriod);

  let iterator = range[0];
  while (isBefore(iterator, range[1])) {
    result.push(iterator);
    iterator = calcFunction(iterator, 1);
  }

  return result;
}

export function subIntegrationPeriod(date: Date, integrationPeriod: IntegrationPeriod): Date {
  switch (integrationPeriod) {
    case IntegrationPeriod.QuaterOfAnHour:
      return subMinutes(date, 15);

    case IntegrationPeriod.Hours:
      return subHours(date, 1);

    case IntegrationPeriod.Days:
      return subDays(date, 1);

    case IntegrationPeriod.Months:
      return subMonths(date, 1);

    default:
      return date;
  }
}

export function addIntegrationPeriod(date: Date, integrationPeriod: IntegrationPeriod): Date {
  switch (integrationPeriod) {
    case IntegrationPeriod.QuaterOfAnHour:
      return addMinutes(date, 15);

    case IntegrationPeriod.Hours:
      return addHours(date, 1);

    case IntegrationPeriod.Days:
      return addDays(date, 1);

    case IntegrationPeriod.Months:
      return addMonths(date, 1);

    default:
      return date;
  }
}

export function integrationPeriodInMilliseconds(
  integrationPeriod: IntegrationPeriod,
): number | undefined {
  switch (integrationPeriod) {
    case IntegrationPeriod.Minutes:
      return ONE_MINUTE;

    case IntegrationPeriod.QuaterOfAnHour:
      return ONE_MINUTE * 15;

    case IntegrationPeriod.Hours:
      return ONE_HOUR;

    case IntegrationPeriod.Days:
      return ONE_DAY;

    case IntegrationPeriod.Months:

    default:
      return undefined;
  }
}

export function subHalfIntegrationPeriod(
  date: Date,
  integrationPeriod: IntegrationPeriod | undefined,
): Date {
  switch (integrationPeriod) {
    case IntegrationPeriod.Minutes:
      return subSeconds(date, 30);

    case IntegrationPeriod.QuaterOfAnHour:
      return subMinutes(date, 7.5);

    case IntegrationPeriod.Hours:
      return subMinutes(date, 30);

    case IntegrationPeriod.Days:
      return subHours(date, 12);

    case IntegrationPeriod.Months:
      const targetMonthDays = getDaysInMonth(date);
      return subDays(date, targetMonthDays / 2);

    default:
      return date;
  }
}

export function addHalfIntegrationPeriod(date: Date, integrationPeriod: IntegrationPeriod): Date {
  switch (integrationPeriod) {
    case IntegrationPeriod.Minutes:
      return addSeconds(date, 30);

    case IntegrationPeriod.QuaterOfAnHour:
      return addMinutes(date, 7.5);

    case IntegrationPeriod.Hours:
      return addMinutes(date, 30);

    case IntegrationPeriod.Days:
      return addHours(date, 12); // todo: 12 + tz offset

    case IntegrationPeriod.Months:
      return addDays(date, 15); // todo: hald of target month?

    default:
      return date;
  }
}
