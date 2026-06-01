import { TargetLimit_PreCalc } from './pv-production';

export function preCalcTargetLimitValue(
  value_DTO: number | null,
  scheduleAdjustmentCoefficient: number,
): TargetLimit_PreCalc {
  const value: null | number = value_DTO ? value_DTO * 1000 : value_DTO;

  const valueAdjusted: null | number = value
    ? Math.round(value * (scheduleAdjustmentCoefficient || 1))
    : value;

  const value_Mega: null | number = value ? value / 1000 : value;

  const valueAdjusted_Mega: null | number = valueAdjusted ? valueAdjusted / 1000 : valueAdjusted;

  const result: TargetLimit_PreCalc = {
    value,
    valueAdjusted,
    value_Mega,
    valueAdjusted_Mega,
  };

  return result;
}
