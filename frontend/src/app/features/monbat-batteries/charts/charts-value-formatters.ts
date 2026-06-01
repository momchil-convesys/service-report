import {
  energyUnitForMultiplier,
  multiplierForValue,
  powerUnitForMultiplier,
} from '../../../helpers';
import Highcharts from '../../../highcharts-global-config';

export interface FormattedValue {
  valueAsString: string;
  unit: string;
  multiplier: number;
}

const nullValueString = '&mdash;';

export function formatEnergyValue(
  value: number | null | undefined,
  decimals: number,
  forceMultiplier: number | undefined,
): FormattedValue {
  if (value === null || value === undefined) {
    return {
      valueAsString: nullValueString,
      unit: '',
      multiplier: 1,
    };
  }
  const multiplier = forceMultiplier !== undefined ? forceMultiplier : multiplierForValue(value);
  const scaledValue = value * multiplier;
  const unit = energyUnitForMultiplier(multiplier);

  const stringValue = Highcharts.numberFormat(scaledValue, decimals);

  return {
    valueAsString: stringValue,
    unit,
    multiplier,
  };
}

export function formatPowerValue(
  value: number | null | undefined,
  decimals: number,
  forceMultiplier: number | undefined,
): FormattedValue {
  if (value === null || value === undefined) {
    return {
      valueAsString: nullValueString,
      unit: '',
      multiplier: 1,
    };
  }

  const multiplier = forceMultiplier !== undefined ? forceMultiplier : multiplierForValue(value);
  const scaledValue = value * multiplier;
  const unit = powerUnitForMultiplier(multiplier);

  const stringValue = Highcharts.numberFormat(scaledValue, decimals);

  return {
    valueAsString: stringValue,
    unit,
    multiplier,
  };
}

export function formatPercentageValue(
  value: number | null | undefined,
  decimals: number = 1,
): string {
  if (value === null || value === undefined) {
    return nullValueString;
  }

  const isHundredPercent = Highcharts.numberFormat(value, decimals).startsWith('100.');
  return `${Highcharts.numberFormat(value, isHundredPercent ? 0 : decimals)}%`;
}

export enum SourceString {
  ChargingBatteries = 'Charging<br>batteries',
  DirectConsumption = 'Direct<br>consumption',
  FromGrid = 'From<br>Grid',
  FromBatteries = 'From<br>Batteries',
}

export const dataLabelsFormatter = (point: Highcharts.Point, sourceString: SourceString) => {
  const formattedEnergy = formatEnergyValue(point.y, 1, undefined);
  const formattedPercentageValue = formatPercentageValue((point as any).custom.percentage);
  const color = point.color;

  return `<span style="color:${color}; font-size: 18px">${formattedPercentageValue}</span>
    <br>
    <span style="color:${color}; font-size: 12px">${sourceString}</span>
    <br>
    <span style="font-size: 12px; line-height: 20px;">${formattedEnergy.valueAsString} ${formattedEnergy.unit}</span>`;
};
