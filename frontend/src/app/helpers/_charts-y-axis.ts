import { formatNumber } from '@angular/common';
import { APP_LOCALE_ID } from '../app-locale';
import {
  BaseUnit,
  multiplierForValue,
  precisionFormatForMultiplier,
  prependBaseUnitForMultiplier,
  roundedValueForMultiplier,
} from './_values-scaling';

import Highcharts from 'highcharts';

export const yAxisFormatter_ScaleValue = (
  ctx: Highcharts.AxisLabelsFormatterContextObject,
  baseUnit: BaseUnit,
  dataMax: number | undefined,
  getUnitOnly?: boolean,
) => {
  const multiplier = dataMax ? multiplierForValue(dataMax) : 1;
  const unit = prependBaseUnitForMultiplier(baseUnit, multiplier);

  if (getUnitOnly) {
    return unit;
  }

  const scaledValue = Number(ctx.value) * multiplier;
  const roundedValue = roundedValueForMultiplier(multiplier, scaledValue);
  const precisionFormat = precisionFormatForMultiplier(multiplier);
  const formattedValue = formatNumber(roundedValue, APP_LOCALE_ID, precisionFormat);

  if (ctx.isFirst) {
    return `${formattedValue} ${unit}`;
  }

  return formattedValue;
};

export const yAxisFormatter_ScaleValue_v2 = (
  ctx: Highcharts.AxisLabelsFormatterContextObject,
  baseUnit: BaseUnit,
  dataMax: number | undefined,
  includeUnit: boolean,
) => {
  const multiplier = dataMax ? multiplierForValue(dataMax) : 1;
  const unit = prependBaseUnitForMultiplier(baseUnit, multiplier);
  const scaledValue = Number(ctx.value) * multiplier;
  const roundedValue = roundedValueForMultiplier(multiplier, scaledValue);
  const precisionFormat = precisionFormatForMultiplier(multiplier);
  const formattedValue = formatNumber(roundedValue, APP_LOCALE_ID, precisionFormat);

  if (includeUnit) {
    return `${formattedValue} ${unit}`;
  }

  return formattedValue;
};
