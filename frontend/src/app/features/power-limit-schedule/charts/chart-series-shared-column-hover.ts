/**
 * This is an extention for the series in PV production chart
 * in order to reuse the series options (and style).
 */

import { seriesById } from '../../../helpers';
import { fakeYAxisMaximum } from '../../pv-charts/pv-production-chart/chart-common';
import { seriesId_SharedColumnHover } from '../../pv-charts/pv-production-chart/chart-series-shared-column-hover';
import { PowerLimitSchedule } from '../_data/models';

export function updateSeriesData_SharedColumnHover(
  chart: Highcharts.Chart,
  data: PowerLimitSchedule | undefined,
) {
  if (!data) {
    seriesById(chart, seriesId_SharedColumnHover)?.setData([], false, false);
    return;
  }

  // +1 avoids border overlaping the top y axis tick
  const yMax = fakeYAxisMaximum + 1;

  const seriesData: Highcharts.PointOptionsType[] =
    data.parsedScheduleTable.map((row) => ({
      x: row.interval.start.getTime(),
      x2: row.interval.end.getTime(),
      y: yMax,
      custom: row,
    })) || [];

  seriesById(chart, seriesId_SharedColumnHover)?.setData(seriesData, false, false);
}
