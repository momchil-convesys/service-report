import { isBefore } from 'date-fns';
import { Plant } from '../data/models';

/**
 * On 1st October 2025 a few plants changed their schedule format and limit types,
 * but historical data should be ajusted according to the old limit types.
 */
export function getLimitTypeForDateInThePast(
  plant: Plant,
  dateISOString: string,
): 'power' | 'energy' | undefined {
  const isBeforeTheBreakingChange = isBefore(
    new Date(dateISOString),
    new Date('2025-09-30T21:00:00.000Z'),
  );

  /**
   * TODO: do not check against HARDCODED ids!
   */

  if (isBeforeTheBreakingChange && plant.id === '17') {
    return 'energy';
  }

  if (isBeforeTheBreakingChange && plant.id === '22') {
    return 'energy';
  }

  return plant.plantSpecificMetadata?.powerLimitType;
}

/**
 * On 1st October 2025 a few plants changed their limit types,
 * and the coefficient was also changed.
 * Historical data should be ajusted according to the old coefficient value.
 */
export function getPowerLimitTargetCoefficientForDateInThePast(
  plant: Plant,
  dateISOString: string,
): number | undefined {
  const isBeforeTheBreakingChange = isBefore(
    new Date(dateISOString),
    new Date('2025-09-30T21:00:00.000Z'),
  );

  /**
   * TODO: do not check against HARDCODED ids!
   */

  if (isBeforeTheBreakingChange && plant.id === '17') {
    return 1.01;
  }

  if (isBeforeTheBreakingChange && plant.id === '22') {
    return 1.01;
  }

  return plant.plantSpecificMetadata?.powerLimitTargetCoefficient;
}

/**
 * Some plants contain devices with different software versions,
 * so their parameters appear duplicated in the device metrics.
 * This is because parameters have different ids when coming from different groups,
 * but essentially they represent the same thing.
 * As a quick and dirty fix, we group parameters by name in the frontend,
 * so they appear only once in the device metrics.
 * This is applied only for certain plants.
 */
export function getShouldUseParameterGroupingByName(plantId: string): boolean {
  /**
   * TODO: do not check against HARDCODED plant ids!
   */
  return ['15', '16', '35', '39', '40'].includes(plantId) || false;
}
