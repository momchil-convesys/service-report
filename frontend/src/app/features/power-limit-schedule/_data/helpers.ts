import {
  TargetLimit_DataPoint,
  TargetLimit_PreCalc,
} from '../../pv-charts/pv-production-chart/_data/pv-production';
import { PowerLimitScheduleParsedTableRow } from './models';

export type EnergyLimitEquivalent = TargetLimit_DataPoint['energyLimitEquivalent'];

export function calcEnergyLimitEquivalent_forProductionChart(
  targetLimit: TargetLimit_PreCalc,
  targetLimitOriginal: TargetLimit_PreCalc,
  limitType: 'power' | 'energy',
  integrationPeriodMinutes: number,
): null | EnergyLimitEquivalent {
  if (limitType !== 'power') {
    return null;
  }

  return {
    targetLimit: calcEnergyLimitEquivalent(targetLimit, integrationPeriodMinutes),
    targetLimitOriginal: calcEnergyLimitEquivalent(targetLimitOriginal, integrationPeriodMinutes),
  };
}

export function calcEnergyLimitEquivalentObject_forSchedulePreview(
  targetLimit: TargetLimit_PreCalc,
  limitType: 'power' | 'energy',
  integrationPeriodMinutes: number,
): null | PowerLimitScheduleParsedTableRow['energyLimitEquivalent'] {
  if (limitType !== 'power') {
    return null;
  }

  const equivallent = calcEnergyLimitEquivalent(targetLimit, integrationPeriodMinutes);

  return {
    targetLimit_Mega: equivallent.value_Mega,
    targetLimitAdjusted_Mega: equivallent.valueAdjusted_Mega,
  };
}

export function calcEnergyLimitEquivalent(
  target: TargetLimit_PreCalc,
  integrationPeriodMinutes: number,
): TargetLimit_PreCalc {
  /**
   * E.g: If target limit is set to 1000 MW for a 15 min interval,
   * this would result in 250 kWh produced for 15 min at maximum power.
   */
  const partFromHour = 60 / integrationPeriodMinutes;

  const value_Wh = target.value_Mega
    ? Math.round((target.value_Mega / partFromHour) * 1000)
    : target.value_Mega;

  const valueAdjusted_Wh = target.valueAdjusted_Mega
    ? Math.round((target.valueAdjusted_Mega / partFromHour) * 1000)
    : target.valueAdjusted_Mega;

  const result: TargetLimit_PreCalc = {
    value: value_Wh,
    value_Mega: value_Wh ? value_Wh / 1000 : value_Wh,

    valueAdjusted: valueAdjusted_Wh,
    valueAdjusted_Mega: valueAdjusted_Wh ? valueAdjusted_Wh / 1000 : valueAdjusted_Wh,
  };

  return result;
}
