import { IntegrationPeriod } from '../../../../constants';
import { seriesById, updateTimeZoneSettings } from '../../../../helpers';
import {
  syncedChartsClassName,
  syncedChartsSeriesPointEvents,
  syncTooltipsOnDataUpdate,
  xAxisEvents,
} from '../../../../helpers/_charts-sync';
import Highcharts from '../../../../highcharts-global-config';
import { DataRequestWithContext } from '../_data/interfaces';
import { PVBESSHistoricalEnergyData, PVBESSHistoricalEnergyData_Point } from '../_data/models';
import { updatePointPlacement } from './chart-point-placement';
import { initializeSeries } from './chart-series';
import { tooltip } from './chart-tooltip';
import { updateXAxisRange, xAxisOptions } from './chart-x-axis';
import { initializeYAxis, yAxisOptions } from './chart-y-axis';

export const chartOptions: Highcharts.Options = {
  chart: {
    zooming: {
      type: 'x',
      mouseWheel: false,
    },
    // spacingBottom: 0,
    plotBorderWidth: 1,
  },
  syncGroupName: 'energy-chart-group',
  xAxis: xAxisOptions,
  yAxis: yAxisOptions,
  tooltip: tooltip,
  plotOptions: {
    series: {
      getExtremesFromAll: true,
    },
    column: {
      // stacking: 'normal',
      pointPadding: 0,
      groupPadding: 0.1,
      crisp: false,
      // borderWidth: 1,
      // borderColor: '#ffffff',
      borderRadius: 2,
    },
    area: {
      gapSize: 1,
      // connectNulls: false
    },
  },
};

export function getMainChartOptions(): Highcharts.Options {
  return {
    ...chartOptions,
    chart: {
      ...chartOptions.chart,
      className: syncedChartsClassName,
    },
    plotOptions: {
      ...chartOptions.plotOptions,
      series: {
        ...chartOptions.plotOptions?.series,
        point: {
          events: syncedChartsSeriesPointEvents,
        },
      },
    },
    xAxis: [
      {
        ...xAxisOptions[0],
        events: {
          ...xAxisEvents,
        },
      },
    ],
  };
}

export function getSubPlantChartOptions(title: string): Highcharts.Options {
  const subPlantTitleOptions: Highcharts.TitleOptions = {
    floating: true,
    align: 'left',
    y: 25,
    x: 10,
  };

  return {
    ...chartOptions,
    chart: {
      ...chartOptions.chart,
      className: syncedChartsClassName,
    },
    plotOptions: {
      ...chartOptions.plotOptions,
      series: {
        ...chartOptions.plotOptions?.series,
        point: {
          events: syncedChartsSeriesPointEvents,
        },
      },
    },
    xAxis: [
      {
        ...xAxisOptions[0],
        events: xAxisEvents,
        visible: false,
      },
    ],
    navigator: {
      enabled: false,
    },
    rangeSelector: {
      enabled: false,
    },
    scrollbar: {
      enabled: false,
    },
    legend: {
      enabled: false,
    },
    title: {
      text: title,
      ...subPlantTitleOptions,
    },
  };
}

export function initializeChart(
  chart: Highcharts.Chart,
  dataRequestWithContext: DataRequestWithContext<PVBESSHistoricalEnergyData>,
) {
  const plant = dataRequestWithContext.plant;
  const targetRange = dataRequestWithContext.targetRange;
  const data = dataRequestWithContext.dataRequest.data;

  updateTimeZoneSettings(chart, plant.timeZone, false);

  updateXAxisRange(chart, targetRange);

  chart.redraw(false);

  if (!data) {
    return;
  }

  initializeYAxis(chart);

  chart.redraw(false);

  initializeSeries(chart);

  chart.redraw(false);

  updatePointPlacement(chart, targetRange);

  chart.redraw(false);
}

export function updateChartData(
  chart: Highcharts.Chart,
  data: PVBESSHistoricalEnergyData | undefined,
  action: 'set' | 'patch' | 'append',
  collection: 'total' | 'subPlant1' | 'subPlant2' = 'total',
) {
  if (!data) {
    return;
  }

  let shouldRedraw = false;
  const showInterval = data.integrationPeriod !== IntegrationPeriod.Minutes;

  // Helper function to calculate interval end from timestamp
  const getIntervalEnd = (timestamp: string): string => {
    const timestampDate = new Date(timestamp);
    let intervalEnd: Date;

    switch (data.integrationPeriod) {
      case IntegrationPeriod.Seconds:
        intervalEnd = new Date(timestampDate.getTime() + 1000);
        break;
      case IntegrationPeriod.Minutes:
        intervalEnd = new Date(timestampDate.getTime() + 60 * 1000);
        break;
      case IntegrationPeriod.QuaterOfAnHour:
        intervalEnd = new Date(timestampDate.getTime() + 15 * 60 * 1000);
        break;
      case IntegrationPeriod.Hours:
        intervalEnd = new Date(timestampDate.getTime() + 60 * 60 * 1000);
        break;
      case IntegrationPeriod.Days:
        intervalEnd = new Date(timestampDate.getTime() + 24 * 60 * 60 * 1000);
        break;
      default:
        intervalEnd = new Date(timestampDate.getTime() + 15 * 60 * 1000);
    }

    return intervalEnd.toISOString();
  };

  const seriesDataMap: { [seriesId: string]: Highcharts.PointOptionsObject[] } = {
    'pv-production': [],
    'charged-energy': [],
    'discharged-energy': [],
    'exported-energy-mv': [],
    'imported-energy-mv': [],
    'exported-energy-hv': [],
    'imported-energy-hv': [],
    'imported-energy-loss': [],
    'exported-energy-loss': [],
  };

  data.dataPoints.map((point: PVBESSHistoricalEnergyData_Point) => {
    const timestamp = new Date(point.timestamp).getTime();

    const pointData = point[collection];

    seriesDataMap['pv-production'].push({
      x: timestamp,
      y: pointData.pvProduction,
      custom: showInterval
        ? {
            interval: {
              start: point.timestamp,
              end: getIntervalEnd(point.timestamp),
            },
          }
        : undefined,
    });

    seriesDataMap['charged-energy'].push({
      x: timestamp,
      y:
        pointData.chargedEnergy !== undefined && pointData.chargedEnergy !== null
          ? -pointData.chargedEnergy
          : null, // Negate to show below zero
      custom: showInterval
        ? {
            interval: {
              start: point.timestamp,
              end: getIntervalEnd(point.timestamp),
            },
          }
        : undefined,
    });

    seriesDataMap['discharged-energy'].push({
      x: timestamp,
      y: pointData.dischargedEnergy,
      custom: showInterval
        ? {
            interval: {
              start: point.timestamp,
              end: getIntervalEnd(point.timestamp),
            },
          }
        : undefined,
    });

    seriesDataMap['exported-energy-mv'].push({
      x: timestamp,
      y: pointData.exportedEnergyMV,
      custom: showInterval
        ? {
            interval: {
              start: point.timestamp,
              end: getIntervalEnd(point.timestamp),
            },
          }
        : undefined,
    });

    seriesDataMap['imported-energy-mv'].push({
      x: timestamp,
      y:
        pointData.importedEnergyMV !== undefined && pointData.importedEnergyMV !== null
          ? -pointData.importedEnergyMV
          : null, // Negate to show below zero
      custom: showInterval
        ? {
            interval: {
              start: point.timestamp,
              end: getIntervalEnd(point.timestamp),
            },
          }
        : undefined,
    });

    seriesDataMap['exported-energy-hv'].push({
      x: timestamp,
      y: pointData.exportedEnergyHV,
      custom: showInterval
        ? {
            interval: {
              start: point.timestamp,
              end: getIntervalEnd(point.timestamp),
            },
          }
        : undefined,
    });

    seriesDataMap['imported-energy-hv'].push({
      x: timestamp,
      y:
        pointData.importedEnergyHV !== undefined && pointData.importedEnergyHV !== null
          ? -pointData.importedEnergyHV
          : null, // Negate to show below zero
      custom: showInterval
        ? {
            interval: {
              start: point.timestamp,
              end: getIntervalEnd(point.timestamp),
            },
          }
        : undefined,
    });

    seriesDataMap['imported-energy-loss'].push({
      x: timestamp,
      y: pointData.importedEnergyLoss,
      custom: showInterval
        ? {
            interval: {
              start: point.timestamp,
              end: getIntervalEnd(point.timestamp),
            },
          }
        : undefined,
    });

    seriesDataMap['exported-energy-loss'].push({
      x: timestamp,
      y: pointData.exportedEnergyLoss,
      custom: showInterval
        ? {
            interval: {
              start: point.timestamp,
              end: getIntervalEnd(point.timestamp),
            },
          }
        : undefined,
    });
  });

  Object.keys(seriesDataMap).forEach((seriesId) => {
    let series: Highcharts.Series | undefined = seriesById(chart, seriesId);
    const seriesData = seriesDataMap[seriesId] || [];

    switch (action) {
      case 'set':
        // const seriesType: any = seriesOptions[seriesId].type;
        // series?.update({ type: seriesType, data: seriesData }, false);

        /**
         * NOTE:
         * Using setData instead of update to avoid the issue with hover points not being updated.
         * When using update() then chart.hoverPoints is reset, but we rely on it
         * to update the tooltips of the synced charts.
         */
        series?.setData(seriesData, false);

        shouldRedraw = true;
        break;

      case 'patch':
        seriesData.forEach((newPoint) => {
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

  if (chart.hoverPoints) {
    syncTooltipsOnDataUpdate(chart);
  }

  if (shouldRedraw) {
    chart.redraw(true);
  }
}
