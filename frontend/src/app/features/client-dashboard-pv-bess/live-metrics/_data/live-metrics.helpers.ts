import {
  decimalsPrecisionForMultiplier,
  energyUnitForMultiplier,
  multiplierForValue,
  powerUnitForMultiplier,
} from '../../../../helpers';
import { LiveMetricsParameterBoxInput } from '../live-metrics-parameter-box/live-metrics-parameter-box.component';
import { PvBessLiveMetricValues } from './models';

export type LiveMetricUnitKind = 'power' | 'energy';

export function buildLiveMetricsBoxInput(
  values: PvBessLiveMetricValues,
  subPlantLabels: string[],
  kind: LiveMetricUnitKind,
): LiveMetricsParameterBoxInput {
  const rawValues = [values.total, values.subPlant1, values.subPlant2].filter(
    (value): value is number => value !== null && value !== undefined,
  );
  const rawMax = rawValues.length ? Math.max(...rawValues.map((value) => Math.abs(value))) : null;
  const multiplier = rawMax !== null ? multiplierForValue(rawMax) : 1;

  const unit =
    kind === 'power' ? powerUnitForMultiplier(multiplier) : energyUnitForMultiplier(multiplier);
  const format = `1.0-${decimalsPrecisionForMultiplier(multiplier)}`;

  return {
    total: values.total !== null && values.total !== undefined ? values.total * multiplier : null,
    perSubPlant: [values.subPlant1, values.subPlant2].map((value) =>
      value !== null && value !== undefined ? value * multiplier : null,
    ),
    unit,
    format,
    subPlantLabels,
  };
}
