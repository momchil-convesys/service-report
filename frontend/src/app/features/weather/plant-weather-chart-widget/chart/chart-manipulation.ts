import Highcharts from '../../../../highcharts-global-config';

import { IntegrationPeriod } from '../../../../constants';
import { seriesById, updateTimeZoneSettings } from '../../../../helpers';
import { PlantWeatherDataChartIdentifier, shouldFullSyncChart } from '../../_data/constants';
import { PlantWeather_HistoricalTimelineData_DTO } from '../../_data/dto';
import { ChartSpecifics, DataRequestWithContext } from '../../_data/interfaces';
import { initializeLegend } from './chart-legend';
import { updatePointPlacement } from './chart-point-placement';
import { initializeChartResponsiveRules } from './chart-responsive';
import { initializeSeries } from './chart-series';
import { updateChartSpecificMomentary } from './chart-specific-momentary';
import { initializeTooltipSpecifics, tooltip } from './chart-tooltip';
import { updateXAxisRange, xAxisOptions } from './chart-x-axis';
import { initializeYAxis, yAxisOptions } from './chart-y-axis';

export const chartOptions: Highcharts.Options = {
  chart: {
    zooming: {
      type: 'x',
      mouseWheel: false,
    },
    /**
     * Negative margin is applied to the container to compensate for the internal chat margin.
     * Internal chart margin is required because if set to 0 the scrollbar is cropped.
     */
    spacingLeft: 5,
    spacingRight: 5,
    plotBorderWidth: 1,
  },
  xAxis: xAxisOptions,
  yAxis: yAxisOptions,
  tooltip: tooltip,
  plotOptions: {
    series: {
      getExtremesFromAll: true,
    },
    bar: {
      crisp: false, // Do not align to pixel grid
      groupPadding: 0.1, // default is 0.2
      pointPadding: 0.05, // default is 0.1
    },
  },
  exporting: {
    // showTable: true,
  },
};

export function initializeChart(
  chart: Highcharts.Chart,
  dataRequestWithContext: DataRequestWithContext<PlantWeather_HistoricalTimelineData_DTO>,
) {
  const chartSpecifics: ChartSpecifics = dataRequestWithContext.chartSpecifics;

  const plant = dataRequestWithContext.plant;
  const targetRange = dataRequestWithContext.targetRange;
  const data = dataRequestWithContext.dataRequest.data;

  updateTimeZoneSettings(chart, plant.timeZone, false);

  updateXAxisRange(chart, targetRange, chartSpecifics);

  initializeLegend(chart, chartSpecifics.chartIdentifier);

  initializeTooltipSpecifics(chart, chartSpecifics);

  if (
    chartSpecifics.chartIdentifier === PlantWeatherDataChartIdentifier.MomentaryPerTS &&
    chartSpecifics.parameterName !== 'rain'
  ) {
    const fullSync = shouldFullSyncChart(dataRequestWithContext.chartSpecifics.parameterName);

    updateChartSpecificMomentary(chart, targetRange, fullSync);
  } else {
    updatePointPlacement(chart, targetRange);
  }

  chart.redraw(false);

  if (!data) {
    return;
  }

  initializeYAxis(chart, data.seriesConfigurations);

  chart.redraw(false);

  initializeSeries(chart, data);

  chart.redraw(false);

  initializeChartResponsiveRules(chart, chartSpecifics.chartIdentifier);

  chart.redraw(false);
}

export function updateChartData(
  chart: Highcharts.Chart,
  data: PlantWeather_HistoricalTimelineData_DTO | undefined,
  action: 'set' | 'patch' | 'append',
  chartSpecifics: ChartSpecifics | undefined,
) {
  if (!data) {
    return;
  }

  let shouldRedraw = false;

  Object.keys(data.seriesData).forEach((seriesId) => {
    let series: Highcharts.Series | undefined = seriesById(chart, seriesId);

    const dataPoints = data.seriesData[seriesId] || [];
    let seriesData: Highcharts.PointOptionsObject[] = [];

    if (chartSpecifics?.chartIdentifier === PlantWeatherDataChartIdentifier.MomentaryPerTS) {
      seriesData = dataPoints.map((point) => [
        new Date(point.interval.start).getTime(),
        point.value,
      ]);
    } else {
      const showInterval = data.integrationPeriod !== IntegrationPeriod.Minutes;
      seriesData = dataPoints.map((point) => ({
        x: new Date(point.interval.start).getTime(),
        y: point.value,
        custom: showInterval
          ? {
              interval: point.interval,
            }
          : undefined,
      }));
    }

    switch (action) {
      case 'set':
        const seriesType: any = series?.options.type || 'line';
        series?.update({ type: seriesType, data: seriesData }, false);
        shouldRedraw = true;

        break;

      case 'patch':
        seriesData.forEach((newPoint) => {
          // In case of cropping, the `data` array may contain `undefined` values, instead of points.
          const currentPoint = series?.data.find((point: Highcharts.Point | undefined) => {
            return point?.x === newPoint.x;
          });

          if (currentPoint?.y !== newPoint.y) {
            currentPoint?.update(newPoint, false);
            shouldRedraw = true;
          }
        });

        break;

      case 'append':
        seriesData.forEach((newPoint) => {
          series?.addPoint(newPoint, false);
        });

        shouldRedraw = true;

        break;
    }
  });

  if (shouldRedraw) {
    chart.redraw(true);
  }
}
