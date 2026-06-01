/**
 * Common code for production excess and shortage series.
 */

import { formatNumber } from '@angular/common';
import { differenceInMinutes, isWithinInterval, subSeconds } from 'date-fns';
import { APP_LOCALE_ID } from '../../../app-locale';
import { multiplierForValue, seriesById } from '../../../helpers';
import { PVProductionData } from './_data/pv-production';
import { deviationFromTargetTreshold } from './chart-common';
import { seriesId_EnergyProduction } from './chart-series-energy-production';

export function formatDataLabel(
  point: Highcharts.Point | Highcharts.PointLabelObject,
  options: Highcharts.DataLabelsOptions,
  deviationType: 'excess' | 'shortage',
): string | null {
  if (point.high === undefined || point.low === undefined || options.verticalAlign !== 'bottom') {
    return null;
  }

  const customData = (point as any).custom;

  if (
    customData &&
    customData.end &&
    customData.start &&
    differenceInMinutes(customData.end, customData.start) <= 15
  ) {
    // For 15 min intervals show data labels only when zoomed

    // const minRange = point.series.xAxis.options.minRange;
    // const extremes = point.series.xAxis.getExtremes();
    // if (minRange && extremes.max - extremes.min > minRange) {
    //   return null;
    // }

    // Show labels only if there is enough space

    if ((point as any).pointWidth < 40) {
      return null;
    }
  }

  const now = new Date();

  const isCurrent = isWithinInterval(now, {
    start: (point as any).custom?.start,
    end: (point as any).custom?.end,
  });

  if (isCurrent) {
    return null;
  }

  let deviationValue: number | undefined = undefined;

  if (deviationType === 'excess') {
    deviationValue = point.high - point.low;
  } else if (deviationType === 'shortage') {
    deviationValue = point.low - point.high;
  }

  if (deviationValue === undefined) {
    return null;
  }

  if (
    deviationValue > deviationFromTargetTreshold ||
    deviationValue < -1 * deviationFromTargetTreshold
  ) {
    const sign = deviationValue > 0 ? '&uarr;' : '&darr;';
    // const sign = deviationValue > 0 ? '&plus;' : '&minus;';
    const valueColor = '#d9343a';

    const productionSeries = seriesById(point.series.chart, seriesId_EnergyProduction);
    const dataMax = productionSeries?.dataMax;

    const multiplier = dataMax ? multiplierForValue(dataMax) : 1;

    const formattedDeviationValue = formatNumber(
      Math.abs(deviationValue) * multiplier,
      APP_LOCALE_ID,
      '1.0-1',
    );

    return `<div style='color: ${valueColor};'>${sign}${formattedDeviationValue}</div>`;
  }

  return null;
}

export function calculateDeviationPoints(
  data: PVProductionData,
  deviationType: 'excess' | 'shortage',
): Highcharts.PointOptionsType[] {
  const seriesData: Highcharts.PointOptionsType[] =
    data.productionDataPoints
      .map((point) => {
        const exactInterval: Interval = {
          start: point.applicableRange.from,
          end: subSeconds(point.applicableRange.to, 1),
        };

        const scheduleTargetAdjusted_Points =
          data.targetPowerLimitData
            ?.filter((p) => isWithinInterval(p.applicableRange.from, exactInterval))
            .slice(-1) || [];

        if (scheduleTargetAdjusted_Points.length <= 0) {
          return null;
        }

        const targetPowerLimitDataPoint = scheduleTargetAdjusted_Points[0];

        /**
         * If energyLimitEquivalent is defined, this means that the power limit type is 'power'
         * and we should use the calculated value in kWh.
         */
        const originalLimitPoint =
          targetPowerLimitDataPoint.energyLimitEquivalent?.targetLimitOriginal ||
          targetPowerLimitDataPoint.targetLimitOriginal;

        const adjustedTarget = originalLimitPoint.valueAdjusted;

        if (adjustedTarget === null || point.value === null || point.value < 0) {
          return null;
        }

        if (deviationType === 'excess') {
          if (adjustedTarget >= point.value) {
            return null;
          }

          return {
            x: point.applicableRange.from.getTime(),
            low: adjustedTarget,
            high: point.value,
            custom: exactInterval,
            labelrank: 2,
          };
        }

        if (deviationType === 'shortage') {
          if (adjustedTarget <= point.value) {
            return null;
          }

          return {
            x: point.applicableRange.from.getTime(),
            low: point.value,
            high: adjustedTarget,
            custom: exactInterval,
            labelrank: 2,
          };
        }

        return null;
      })
      .filter((p) => p !== null) || [];

  return seriesData;
}
