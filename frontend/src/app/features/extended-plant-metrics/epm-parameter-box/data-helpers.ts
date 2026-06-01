import {
  BaseUnit,
  decimalsPrecisionForMultiplier,
  energyUnitForMultiplier,
  multiplierForValue,
  nullOrNumber,
  powerUnitForMultiplier,
  prependBaseUnitForMultiplier,
  reactiveEnergyUnitForMultiplier,
  reactivePowerUnitForMultiplier,
} from '../../../helpers';
import { LevelOfMeasurementMetadata_DTO } from '../_data/dto';
import { PlantMetricsCurrentValuesData, PowerMetersCumulativeDataPointsSum } from '../_data/models';
import { EpmParameterBoxInput } from './epm-parameter-box.component';

export function getParameterBoxInputFor_ActivePower(
  data: PlantMetricsCurrentValuesData,
  metadata: LevelOfMeasurementMetadata_DTO | undefined,
  key: 'activePower_Generated' | 'activePower_Consumed',
): EpmParameterBoxInput {
  const result: EpmParameterBoxInput = {
    totalForPlant: null,
    valuesPerSubLevel: [],
    unit: powerUnitForMultiplier(1),
    format: '1.0-1',
    metadata,
  };

  let multiplier = 1;

  const rawValueForPlant = data.totalForPlant ? nullOrNumber(data.totalForPlant[key]) : null;
  if (rawValueForPlant !== null) {
    multiplier = multiplierForValue(rawValueForPlant);

    result.format = `1.0-${decimalsPrecisionForMultiplier(multiplier)}`;
    result.unit = powerUnitForMultiplier(multiplier);

    result.totalForPlant = multiplier * rawValueForPlant;
  }

  result.valuesPerSubLevel = data.valuesPerSubLevel.map((pmValue) => {
    const value: number | null = nullOrNumber(pmValue[key]);
    return value ? multiplier * value : value;
  });

  return result;
}

export function getParameterBoxInputFor_ReactivePower(
  data: PlantMetricsCurrentValuesData,
  metadata: LevelOfMeasurementMetadata_DTO | undefined,
  key: 'reactivePower_Generated' | 'reactivePower_Consumed',
): EpmParameterBoxInput {
  const result: EpmParameterBoxInput = {
    totalForPlant: null,
    valuesPerSubLevel: [],
    unit: reactivePowerUnitForMultiplier(1),
    format: '1.0-1',
    metadata,
  };

  let multiplier = 1;

  const rawValueForPlant = data.totalForPlant ? nullOrNumber(data.totalForPlant[key]) : null;
  if (rawValueForPlant !== null) {
    multiplier = multiplierForValue(rawValueForPlant);

    result.format = `1.0-${decimalsPrecisionForMultiplier(multiplier)}`;
    result.unit = reactivePowerUnitForMultiplier(multiplier);

    result.totalForPlant = multiplier * rawValueForPlant;
  }

  result.valuesPerSubLevel = data.valuesPerSubLevel.map((pmValue) => {
    const value: number | null = nullOrNumber(pmValue[key]);
    return value ? multiplier * value : value;
  });

  return result;
}

export function getParameterBoxInputFor_PowerFactor(
  data: PlantMetricsCurrentValuesData,
  metadata: LevelOfMeasurementMetadata_DTO | undefined,
): EpmParameterBoxInput {
  const result: EpmParameterBoxInput = {
    totalForPlant: null,
    valuesPerSubLevel: [],
    unit: '',
    format: '1.3-6',
    metadata,
  };

  const rawValueForPlant = data.totalForPlant ? nullOrNumber(data.totalForPlant.powerFactor) : null;
  if (rawValueForPlant !== null) {
    result.totalForPlant = rawValueForPlant;
  }

  result.valuesPerSubLevel = data.valuesPerSubLevel.map((pmValue) => pmValue.powerFactor);

  return result;
}

//----------------------------------------------------------------------------
// Counters

export function getParameterBoxInputFor_ActiveEnergy(
  data: PlantMetricsCurrentValuesData,
  metadata: LevelOfMeasurementMetadata_DTO | undefined,
  key: 'activeEnergy_Generated' | 'activeEnergy_Consumed',
  period: 'daily' | 'allTime',
): EpmParameterBoxInput {
  const result: EpmParameterBoxInput = {
    totalForPlant: null,
    valuesPerSubLevel: [],
    unit: energyUnitForMultiplier(1),
    format: '1.0-1',
    metadata,
  };

  const dataSourceTotal =
    period === 'allTime'
      ? data.allTime_totalForPlant
      : period === 'daily'
        ? data.daily_totalForPlant
        : null;
  const dataSourcePerPm =
    period === 'allTime'
      ? data.allTime_valuesPerSubLevel
      : period === 'daily'
        ? data.daily_valuesPerSubLevel
        : [];

  let multiplier = 1;

  const rawValueForPlant = dataSourceTotal ? nullOrNumber(dataSourceTotal[key]) : null;
  if (rawValueForPlant !== null) {
    multiplier = multiplierForValue(rawValueForPlant);

    result.format = `1.0-${decimalsPrecisionForMultiplier(multiplier)}`;
    result.unit = energyUnitForMultiplier(multiplier);

    result.totalForPlant = multiplier * rawValueForPlant;
  }

  result.valuesPerSubLevel = dataSourcePerPm.map((pmValue) => {
    const value: number | null = nullOrNumber(pmValue[key]);
    return value ? multiplier * value : value;
  });

  return result;
}

export function getParameterBoxInputFor_ReactiveEnergy(
  data: PlantMetricsCurrentValuesData,
  metadata: LevelOfMeasurementMetadata_DTO | undefined,
  key: 'reactiveEnergy_Generated' | 'reactiveEnergy_Consumed',
  period: 'daily' | 'allTime',
): EpmParameterBoxInput {
  const result: EpmParameterBoxInput = {
    totalForPlant: null,
    valuesPerSubLevel: [],
    unit: reactiveEnergyUnitForMultiplier(1),
    format: '1.0-1',
    metadata,
  };

  const dataSourceTotal =
    period === 'allTime'
      ? data.allTime_totalForPlant
      : period === 'daily'
        ? data.daily_totalForPlant
        : null;
  const dataSourcePerPm =
    period === 'allTime'
      ? data.allTime_valuesPerSubLevel
      : period === 'daily'
        ? data.daily_valuesPerSubLevel
        : [];

  let multiplier = 1;

  const rawValueForPlant = dataSourceTotal ? nullOrNumber(dataSourceTotal[key]) : null;
  if (rawValueForPlant !== null) {
    multiplier = multiplierForValue(rawValueForPlant);

    result.format = `1.0-${decimalsPrecisionForMultiplier(multiplier)}`;
    result.unit = reactiveEnergyUnitForMultiplier(multiplier);

    result.totalForPlant = multiplier * rawValueForPlant;
  }

  result.valuesPerSubLevel = dataSourcePerPm.map((pmValue) => {
    const value: number | null = nullOrNumber(pmValue[key]);
    return value ? multiplier * value : value;
  });

  return result;
}

//------------------------------------------------------------------------------
// Sum

export function getParameterBoxInputFor_Sum(
  data: PowerMetersCumulativeDataPointsSum | undefined,
  metadata: LevelOfMeasurementMetadata_DTO | undefined | undefined,
  key: keyof PowerMetersCumulativeDataPointsSum,
): EpmParameterBoxInput {
  let baseUnit: BaseUnit | undefined;

  switch (key) {
    case 'energy_Consumed':
    case 'energy_Generated':
      baseUnit = 'Wh';
      break;

    // case 'reactiveEnergy_Consumed':
    // case 'reactiveEnergy_Generated':
    // case 'calculated_reactiveEnergy_Consumed':
    // case 'calculated_reactiveEnergy_Generated':

    default:
      baseUnit = 'VARh';
  }

  const result: EpmParameterBoxInput = {
    totalForPlant: null,
    valuesPerSubLevel: [],
    unit: prependBaseUnitForMultiplier(baseUnit, 1),
    format: '1.0-1',
    metadata,
  };

  let multiplier = 1;

  const rawValueForPlant = data ? nullOrNumber(data[key]) : null;
  if (rawValueForPlant !== null) {
    multiplier = multiplierForValue(rawValueForPlant);

    result.format = `1.0-${decimalsPrecisionForMultiplier(multiplier)}`;
    result.unit = prependBaseUnitForMultiplier(baseUnit, multiplier);

    result.totalForPlant = multiplier * rawValueForPlant;
  }

  return result;
}
