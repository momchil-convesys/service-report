import { IntegrationPeriod } from '../../constants';

export type DatetimeRangeType = 'single-date' | 'date-range';

interface DatetimeRangeModelBase {
  pickerId: number;

  type: DatetimeRangeType;

  from: Date;
  to: Date;

  integrationPeriod: IntegrationPeriod;

  predefinedRangeTypeOption: RangeTypeOption;
}

export type DatetimeRangeModel = DatetimeRangeModelBase;

export function isSameDatetimeRange(
  v1: DatetimeRangeModel,
  v2: DatetimeRangeModel,
  compareIntegrationPeriod = true,
) {
  if (v1.type !== v2.type) {
    return false;
  }

  if (v1.from.getTime() !== v2.from.getTime()) {
    return false;
  }

  if (v1.to.getTime() !== v2.to.getTime()) {
    return false;
  }

  if (compareIntegrationPeriod && v1.integrationPeriod !== v2.integrationPeriod) {
    return false;
  }

  return true;
}

export function isSameDatetimeRangeIgnoreIntegrationPeriod(
  v1: DatetimeRangeModel,
  v2: DatetimeRangeModel,
) {
  return isSameDatetimeRange(v1, v2, false);
}

export function isSameDatetimeRange_Safe(
  v1: DatetimeRangeModel | undefined,
  v2: DatetimeRangeModel | undefined,
) {
  if (!v1 || !v2) {
    return false;
  }

  return isSameDatetimeRange(v1, v2);
}

export type RangeTypeOption = 'day' | 'week' | 'month' | 'year' | 'custom-range';

export const allRangeTypeOptions: { label: string; value: RangeTypeOption }[] = [
  {
    label: $localize`Day`,
    value: 'day',
  },
  {
    label: $localize`Week`,
    value: 'week',
  },
  {
    label: $localize`Month`,
    value: 'month',
  },
  {
    label: $localize`Year`,
    value: 'year',
  },
  {
    label: $localize`Custom range`,
    value: 'custom-range',
  },
];
