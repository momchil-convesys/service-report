import { addMilliseconds, isBefore, isWithinInterval, subSeconds } from 'date-fns';
import { ONE_MINUTE } from '../../../../constants';
import { nullOrNumber, utcToZonedTimeSafe } from '../../../../helpers';
import {
  PVProductionData,
  ScheduleStatusHistory_DataPoint,
  TargetLimit_DataPoint,
} from '../../../pv-charts/pv-production-chart/_data/pv-production';
import { deviationFromTargetTreshold } from '../../../pv-charts/pv-production-chart/chart-common';
import { TableRowBase, TableRowGroupBase } from '../../helpers-table-group-intervals';

export interface DeviationFromTarget {
  value: number | null;
  signHtml: string;
  isOverTreshold: boolean;
}

export interface TableRow extends TableRowBase {
  production_MWh?: number | null;

  targetLimitDetails: {
    activeRecord: TargetLimit_DataPoint | null;
    history: TargetLimit_DataPoint[];
    scheduleStatusDisabledRecords: ScheduleStatusHistory_DataPoint[];
  };

  deviationFromTarget: DeviationFromTarget;
  deviationFromOriginalTarget: DeviationFromTarget;
}

export interface TableRowGroup extends TableRowGroupBase<TableRow> {}

export function transformInputData(
  inputData: PVProductionData | undefined,
  timeZone: string | undefined,
): TableRow[] {
  const data: PVProductionData | undefined = inputData;

  if (!data || !data.targetRange) {
    return [];
  }

  const result: TableRow[] = [];

  let iterator = utcToZonedTimeSafe(new Date(data.targetRange.from), timeZone);
  const endOfTargetInterval = utcToZonedTimeSafe(data.targetRange.to, timeZone);

  while (isBefore(iterator, endOfTargetInterval)) {
    const intervalEnd = addMilliseconds(iterator, ONE_MINUTE * 15);

    const interval: Interval = {
      start: iterator,
      end: intervalEnd,
    };

    const exactInterval: Interval = {
      start: interval.start,
      end: subSeconds(interval.end, 1),
    };

    const productionDataPoint = data.productionDataPoints.find(
      (p) =>
        utcToZonedTimeSafe(p.applicableRange.from, timeZone).getTime() === iterator.getTime() &&
        utcToZonedTimeSafe(p.applicableRange.to, timeZone).getTime() === intervalEnd.getTime(),
    );

    let production: number | null = nullOrNumber(productionDataPoint?.value);
    let production_MWh: number | null = nullOrNumber(productionDataPoint?.value_Mega);

    const scheduleStatusDisabledRecords: ScheduleStatusHistory_DataPoint[] = [];

    data.scheduleStatusHistory?.forEach((p) => {
      if (
        p.statusChangedTo === 'disabled' &&
        isWithinInterval(utcToZonedTimeSafe(p.timestamp, timeZone), exactInterval)
      ) {
        scheduleStatusDisabledRecords.push({
          ...p,
          timestamp: utcToZonedTimeSafe(p.timestamp, timeZone),
          timestampEnd: utcToZonedTimeSafe(p.timestampEnd, timeZone),
        });
      }
    });

    const targetPowerLimit_History: TargetLimit_DataPoint[] = [];

    data.targetPowerLimitData?.forEach((p) => {
      if (isWithinInterval(utcToZonedTimeSafe(p.applicableRange.from, timeZone), exactInterval)) {
        targetPowerLimit_History.push({
          ...p,
          applicableRange: {
            from: utcToZonedTimeSafe(p.applicableRange.from, timeZone),
            to: utcToZonedTimeSafe(p.applicableRange.to, timeZone),
          },
        });
      }
    });

    let targetLimit_LastRecord: TargetLimit_DataPoint | null = null;

    if (targetPowerLimit_History.length > 0) {
      targetLimit_LastRecord = targetPowerLimit_History[targetPowerLimit_History.length - 1];
    }

    const deviationObjects = constructDeviationObjects(targetLimit_LastRecord, production);

    result.push({
      interval,
      production_MWh,
      targetLimitDetails: {
        activeRecord: targetLimit_LastRecord,
        history: targetPowerLimit_History,
        scheduleStatusDisabledRecords,
      },
      ...deviationObjects,
    });

    iterator = intervalEnd;
  }

  return result;
}

function constructDeviationObjects(
  targetLimit_Point: TargetLimit_DataPoint | null,
  production: number | null,
) {
  let targetLimitAdjusted: number | null = null;
  let originalTargetLimitAdjusted: number | null = null;

  if (targetLimit_Point) {
    /**
     * Use energy equivallent if available.
     */
    if (targetLimit_Point.energyLimitEquivalent) {
      targetLimitAdjusted = targetLimit_Point.energyLimitEquivalent.targetLimit.valueAdjusted;
      originalTargetLimitAdjusted =
        targetLimit_Point.energyLimitEquivalent.targetLimitOriginal.valueAdjusted;
    } else {
      targetLimitAdjusted = targetLimit_Point.targetLimit.valueAdjusted;
      originalTargetLimitAdjusted = targetLimit_Point.targetLimitOriginal.valueAdjusted;
    }
  }

  let deviationValue: number | null = null;
  if (production !== null && targetLimitAdjusted !== null) {
    deviationValue = production - targetLimitAdjusted;
  }

  const deviationFromTarget: DeviationFromTarget = constructDeviationObject(deviationValue);

  let deviationFromOriginal_Value: number | null = null;
  if (production !== null && originalTargetLimitAdjusted !== null) {
    deviationFromOriginal_Value = production - originalTargetLimitAdjusted;
  }

  const deviationFromOriginalTarget: DeviationFromTarget = constructDeviationObject(
    deviationFromOriginal_Value,
  );

  return {
    deviationFromTarget,
    deviationFromOriginalTarget,
  };
}

function constructDeviationObject(deviationValue: number | null): DeviationFromTarget {
  const result: DeviationFromTarget = {
    value: deviationValue,
    isOverTreshold:
      deviationValue !== null &&
      (deviationValue > deviationFromTargetTreshold ||
        deviationValue < -1 * deviationFromTargetTreshold),
    signHtml: deviationValue !== null ? (deviationValue > 0 ? '&uarr;' : '&darr;') : '',
  };

  return result;
}
