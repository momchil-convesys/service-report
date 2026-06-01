import { formatNumber } from '@angular/common';
import { differenceInMinutes } from 'date-fns';
import { APP_LOCALE_ID } from '../../../app-locale';
import { multiplierForValue, seriesById } from '../../../helpers';
import { excludeSeriesFromCrossHairClassName } from '../../../highcharts-global-config';
import { EnergyProduction_DataPoint, PVProductionData } from './_data/pv-production';

export const seriesColor_EnergyProduction = '#9d80bf'; // @purple-5
export const seriesId_EnergyProduction = 'seriesId_EnergyProduction';

export const seriesOptions_EnergyProduction: Highcharts.SeriesOptionsType[] = [
  {
    id: seriesId_EnergyProduction,
    type: 'column',
    name: $localize`Production`,
    className: excludeSeriesFromCrossHairClassName,
    color: seriesColor_EnergyProduction,
    enableMouseTracking: false,
    dataLabels: {
      style: {
        pointerEvents: 'none',
        // textOutline: '2px solid #ffffff',
      },
      formatter: function () {
        const customData: EnergyProduction_DataPoint = (this as any).custom;
        if (
          customData &&
          differenceInMinutes(customData.applicableRange.to, customData.applicableRange.from) <= 15
        ) {
          // For 15 min intervals show data labels only when zoomed

          // const minRange = this.point.series.xAxis.options.minRange;
          // const extremes = this.point.series.xAxis.getExtremes();

          // if (minRange && extremes.max - extremes.min > minRange) {
          //   return null;
          // }

          // Show labels only if there is enough space

          if ((this as any).pointWidth < 40) {
            return null;
          }
        }

        const dataMax = this.series.dataMax;
        const multiplier = dataMax ? multiplierForValue(dataMax) : 1;
        const scaledValue = Number(this.y) * multiplier;

        return formatNumber(scaledValue, APP_LOCALE_ID, scaledValue === 0 ? '1.0-0' : '1.0-1');
      },
    },
    events: {
      // Disable hide
      legendItemClick: function (e: Highcharts.SeriesLegendItemClickEventObject) {
        e.preventDefault();
        return false;
      },
    },
  },
];

export function updateSeriesData_EnergyProduction(chart: Highcharts.Chart, data: PVProductionData) {
  const seriesData: Highcharts.PointOptionsType[] =
    data.productionDataPoints.map((dataPoint) => ({
      x: dataPoint.applicableRange.from.getTime(),
      y: dataPoint.value,
      custom: dataPoint,
      labelrank: 1,
    })) || [];

  seriesById(chart, seriesId_EnergyProduction)?.setData(seriesData, false, false);
}

export function updateSeriesOptions_EnergyProduction(
  chart: Highcharts.Chart,
  data: PVProductionData,
) {
  const hasPowerLimitData = !!data.targetPowerLimitData;

  seriesById(chart, seriesId_EnergyProduction)?.update(
    {
      type: 'column',
      dataLabels: {
        enabled: true,
        inside: hasPowerLimitData,
        verticalAlign: hasPowerLimitData ? 'top' : undefined,
      },
    },
    false,
  );
}
