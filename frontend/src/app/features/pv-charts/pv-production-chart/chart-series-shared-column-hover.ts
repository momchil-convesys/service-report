import { integrationPeriodInMilliseconds, seriesById } from '../../../helpers';
import { PVProductionData } from './_data/pv-production';

import { addMilliseconds, isBefore } from 'date-fns';
import { IntegrationPeriod } from '../../../constants';
import Highcharts from '../../../highcharts-global-config';
import { fakeYAxisMaximum } from './chart-common';
import { seriesId_EnergyProduction } from './chart-series-energy-production';

export interface HoverablePointCustomData {
  applicableRange: {
    from: Date;
    to: Date;
  };
}

export interface HoverablePoint extends Highcharts.PointOptionsObject {
  custom: HoverablePointCustomData;
}

export const seriesId_SharedColumnHover = 'seriesId_SharedColumnHover';

export const seriesOptions_SharedColumnHover: Highcharts.SeriesOptionsType[] = [
  {
    id: seriesId_SharedColumnHover,
    type: 'column',
    name: $localize`Production Background For Hover and Tooltop`,
    states: {
      inactive: {
        opacity: 1,
      },
      hover: {
        opacity: 1,
      },
    },
    borderWidth: 1,
    borderColor: '#ffffff', // Altered later according to integration period
    color: '#ffffff00',
    opacity: 1,
    zIndex: 2,

    yAxis: 1,

    showInLegend: false,
    includeInDataExport: false,

    crisp: false, // Do not align to pixel grid

    point: {
      events: {
        mouseOver: function () {
          const point = this;
          const productionSeries = seriesById(this.series.chart, seriesId_EnergyProduction);

          // In case of cropping, the `data` array may contain `undefined` values, instead of points.
          (productionSeries?.data || []).forEach(function (p: Highcharts.Point | undefined) {
            if (p && p.x === point.x) {
              p.setState('hover');
            }
          });
        },
        mouseOut: function () {
          const point = this;
          const productionSeries = seriesById(this.series.chart, seriesId_EnergyProduction);

          // In case of cropping, the `data` array may contain `undefined` values, instead of points.
          (productionSeries?.data || []).forEach(function (p: Highcharts.Point | undefined) {
            if (p && p.x === point.x) {
              p.setState('');
            }
          });
        },
      },
    },
  },
];

export function updateSeriesData_SharedColumnHover(
  chart: Highcharts.Chart,
  data: PVProductionData,
) {
  const generatedIntervals: HoverablePointCustomData[] = [];

  const intervalDuration = integrationPeriodInMilliseconds(data.integrationPeriod);

  if (
    data.targetRange &&
    intervalDuration !== undefined &&
    (data.integrationPeriod === IntegrationPeriod.Hours ||
      data.integrationPeriod === IntegrationPeriod.QuaterOfAnHour)
  ) {
    let iterator = new Date(data.targetRange.from);
    const endOfTargetInterval = data.targetRange.to;

    while (isBefore(iterator, endOfTargetInterval)) {
      const intervalEnd = addMilliseconds(iterator, intervalDuration);

      generatedIntervals.push({
        applicableRange: {
          from: iterator,
          to: intervalEnd,
        },
      });

      iterator = intervalEnd;
    }
  } else {
    const intervalsFromProductionData: HoverablePointCustomData[] = data.productionDataPoints.map(
      (p) => ({
        applicableRange: p.applicableRange,
      }),
    );
    generatedIntervals.push(...intervalsFromProductionData);
  }

  // +1 avoids border overlaping the top y axis tick
  const yMax = fakeYAxisMaximum + 1;

  const seriesData: HoverablePoint[] =
    generatedIntervals.map((hoverablePoint) => ({
      x: hoverablePoint.applicableRange.from.getTime(),
      y: yMax,
      custom: hoverablePoint,
    })) || [];

  seriesById(chart, seriesId_SharedColumnHover)?.setData(seriesData, false, false);
}

export function updateSeriesOptions_SharedColumnHover(
  chart: Highcharts.Chart,
  data: PVProductionData,
) {
  /**
   * NOTE
   * Updating series conflicts with boost module and causes live updates hover/tooltip issue.
   * As a temporary fix we are updating only if needed.
   */
  const series = seriesById(chart, seriesId_SharedColumnHover);
  if (
    (series?.options as any).borderColor !== '#ffffff00' &&
    data.integrationPeriod === IntegrationPeriod.Months
  ) {
    series?.update(
      {
        type: 'column',
        borderColor: '#ffffff00',
      },
      false,
    );
  } else if (
    (series?.options as any).borderColor !== '#ffffff' &&
    data.integrationPeriod !== IntegrationPeriod.Months
  ) {
    series?.update(
      {
        type: 'column',
        borderColor: '#ffffff',
      },
      false,
    );
  }
}
