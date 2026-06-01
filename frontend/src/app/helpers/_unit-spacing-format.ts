import { noSpaceUnits } from '../constants';

export function formatUnitSpacing(unit: string): string {
  const bareUnit = unit.trim();

  if (noSpaceUnits.indexOf(bareUnit) >= 0) {
    return bareUnit;
  }

  return ' ' + bareUnit;
}
