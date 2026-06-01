import { NzTableSortFn, NzTableSortOrder } from 'ng-zorro-antd/table';
import { DeviceState, deviceStatesOrdered } from '../../../../constants';
import { InverterMetricsTableItem } from './models';

import { getMostSignificantAlarm } from '../../alarms-page/_data/utils';

interface ColumnItem {
  name: string;

  showSort: boolean;

  nzSortOrder: NzTableSortOrder | null;
  nzSortDirections: NzTableSortOrder[];
  nzSortFn: NzTableSortFn<InverterMetricsTableItem> | null;

  colspan: number;
  nzAlign: 'left' | 'right' | 'center' | null;
}

export const inverterMetricsListOfColumns: ColumnItem[] = [
  {
    name: $localize`Inverter`,
    showSort: true,
    nzSortOrder: null,
    nzSortDirections: ['ascend', 'descend', null],
    nzSortFn: (a: InverterMetricsTableItem, b: InverterMetricsTableItem) =>
      a.inverter.displayIndex && b.inverter.displayIndex
        ? a.inverter.displayIndex - b.inverter.displayIndex
        : 0,
    colspan: 1,
    nzAlign: 'left',
  },
  {
    name: $localize`Timestamp`,
    showSort: true,
    nzSortOrder: null,
    nzSortDirections: ['ascend', 'descend', null],
    nzSortFn: (a: InverterMetricsTableItem, b: InverterMetricsTableItem) =>
      a.data?.timestamp && b.data?.timestamp
        ? new Date(a.data?.timestamp).getTime() - new Date(b.data?.timestamp).getTime()
        : 0,

    colspan: 1,
    nzAlign: 'left',
  },
  {
    name: $localize`State`,
    showSort: true,
    nzSortOrder: null,
    nzSortDirections: ['ascend', 'descend', null],
    nzSortFn: (a: InverterMetricsTableItem, b: InverterMetricsTableItem) => {
      const aState = a.data?.state;
      const bState = b.data?.state;

      const aStateIndex = deviceStatesOrdered.indexOf(aState ?? ('unknown' as DeviceState));
      const bStateIndex = deviceStatesOrdered.indexOf(bState ?? ('unknown' as DeviceState));

      // If state not found, push to end
      const aStateOrder = aStateIndex === -1 ? Number.MAX_SAFE_INTEGER : aStateIndex;
      const bStateOrder = bStateIndex === -1 ? Number.MAX_SAFE_INTEGER : bStateIndex;

      if (aStateOrder !== bStateOrder) {
        return aStateOrder - bStateOrder;
      }

      // Same state — sort by intermediate state code
      const aIntermediate = a.data?.intermediateStateCode;
      const bIntermediate = b.data?.intermediateStateCode;

      if (aIntermediate == null && bIntermediate == null) return 0;
      if (aIntermediate == null) return 1; // Nulls last
      if (bIntermediate == null) return -1;

      return aIntermediate - bIntermediate;
    },
    colspan: 1,
    nzAlign: 'center',
  },
  {
    name: $localize`Active power`,
    showSort: true,
    nzSortOrder: null,
    nzSortDirections: ['ascend', 'descend', null],
    nzSortFn: (a: InverterMetricsTableItem, b: InverterMetricsTableItem) =>
      (a.data?.activePower || 0) - (b.data?.activePower || 0),
    colspan: 2,
    nzAlign: 'center',
  },
  {
    name: $localize`Reactive power`,
    showSort: true,
    nzSortOrder: null,
    nzSortDirections: ['ascend', 'descend', null],
    nzSortFn: (a: InverterMetricsTableItem, b: InverterMetricsTableItem) =>
      (a.data?.reactivePower || 0) - (b.data?.reactivePower || 0),
    colspan: 2,
    nzAlign: 'center',
  },
  {
    name: $localize`Accumulated energy`,
    showSort: true,
    nzSortOrder: null,
    nzSortDirections: ['ascend', 'descend', null],
    nzSortFn: (a: InverterMetricsTableItem, b: InverterMetricsTableItem) =>
      (a.data?.accumulatedEnergy || 0) - (b.data?.accumulatedEnergy || 0),
    colspan: 2,
    nzAlign: 'center',
  },
  {
    name: $localize`Accumulated energy for day`,
    showSort: true,
    nzSortOrder: null,
    nzSortDirections: ['ascend', 'descend', null],
    nzSortFn: (a: InverterMetricsTableItem, b: InverterMetricsTableItem) =>
      (a.data?.accumulatedEnergyForDay || 0) - (b.data?.accumulatedEnergyForDay || 0),
    colspan: 2,
    nzAlign: 'center',
  },
  {
    name: $localize`Active alarms`,
    showSort: true,
    nzSortOrder: null,
    nzSortDirections: ['ascend', 'descend', null],
    nzSortFn: (a: InverterMetricsTableItem, b: InverterMetricsTableItem) => {
      const aAlarms = a.data?.alarms || [];
      const bAlarms = b.data?.alarms || [];

      // Sort by alarm count first, then by most significant alarm severity
      if (aAlarms.length !== bAlarms.length) {
        return bAlarms.length - aAlarms.length; // More alarms first
      }

      if (aAlarms.length === 0 && bAlarms.length === 0) {
        return 0;
      }

      // Sort by most significant alarm severity
      const aMostSignificant = getMostSignificantAlarm(aAlarms);
      const bMostSignificant = getMostSignificantAlarm(bAlarms);

      if (!aMostSignificant && !bMostSignificant) return 0;
      if (!aMostSignificant) return 1; // No alarms last
      if (!bMostSignificant) return -1;

      const severityOrder = ['major', 'warning', 'minor', 'info'];
      const aIndex = severityOrder.indexOf(aMostSignificant.severity);
      const bIndex = severityOrder.indexOf(bMostSignificant.severity);

      return aIndex - bIndex; // More severe first
    },
    colspan: 1,
    nzAlign: 'center',
  },
];
