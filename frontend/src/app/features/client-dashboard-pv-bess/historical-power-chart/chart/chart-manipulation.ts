import { ONE_MINUTE } from '../../../../constants/_time';
import { formatUnitSpacing, seriesById } from '../../../../helpers';
import {
  syncedChartsClassName,
  syncedChartsSeriesPointEvents_NoHover,
} from '../../../../helpers/_charts-sync';
import Highcharts from '../../../../highcharts-global-config';
import {
  PVBESSHistoricalPowerData_DataPoint,
  PVBESSHistoricalPowerData_Point,
} from '../_data/models';
import { chartSeriesOptions } from './chart-series';
import { tooltip } from './chart-tooltip';
import { xAxisOptions } from './chart-x-axis';
import { yAxisOptions } from './chart-y-axis';

export const mainChartOptions: Highcharts.Options = {
  chart: {
    className: syncedChartsClassName,
    zooming: {
      type: 'x',
      mouseWheel: false,
    },
    spacingBottom: 0,
    borderWidth: 0,
    plotBorderWidth: 1,
    alignThresholds: true,
  },
  syncGroupName: 'power-chart-group',
  xAxis: xAxisOptions,
  yAxis: yAxisOptions,
  tooltip: tooltip,
  plotOptions: {
    series: {
      /** This should be false, because if a point is added while zoomed in, the chart is rescaling. */
      getExtremesFromAll: false,
      cropThreshold: 0,
      boostThreshold: 0,
      gapSize: ONE_MINUTE, // TODO: decide based on zoom level maybe?
      gapUnit: 'value',
      dataGrouping: {
        enabled: false,
      },
      tooltip: {
        valueSuffix: formatUnitSpacing('kW'),
      },
      threshold: 0,
      point: {
        events: syncedChartsSeriesPointEvents_NoHover,
      },
      marker: {
        enabled: false,
      },
      states: {
        hover: {
          enabled: false,
        },
      },
    },
  },
  series: chartSeriesOptions,
  navigator: {
    enabled: true,
    adaptToUpdatedData: false,
    handles: {
      enabled: true,
    },
    series: {
      dataGrouping: {
        enabled: false,
      },
      threshold: 0,
    },
  },
  rangeSelector: {
    inputEnabled: false,
    buttons: [
      {
        type: 'all',
        text: 'All',
      },
    ],
  },
  scrollbar: {
    buttonsEnabled: true,
  },
  legend: {
    enabled: true,
    // events: {
    //   itemClick: syncedChartsLegendItemClick,
    // },
  },
};

export const subPlantChartOptions: Highcharts.Options = {
  chart: {
    className: syncedChartsClassName,
    zooming: {
      type: 'x',
      mouseWheel: false,
    },

    borderWidth: 0,
    plotBorderWidth: 1,
    alignThresholds: true,
  },
  syncGroupName: 'power-chart-group',
  xAxis: [
    {
      ...xAxisOptions[0],
      visible: false,
    },
  ],
  yAxis: yAxisOptions,
  tooltip: tooltip,
  plotOptions: {
    series: {
      /** This should be false, because if a point is added while zoomed in, the chart is rescaling. */
      getExtremesFromAll: false,
      cropThreshold: 1,
      boostThreshold: 0,
      gapSize: ONE_MINUTE, // TODO: decide based on zoom level maybe?
      gapUnit: 'value',
      dataGrouping: {
        enabled: false,
      },
      tooltip: {
        valueSuffix: formatUnitSpacing('kW'),
      },
      threshold: 0,
      point: {
        events: syncedChartsSeriesPointEvents_NoHover,
      },
      marker: {
        enabled: false,
      },
      states: {
        hover: {
          enabled: false,
        },
      },
    },
  },
  series: chartSeriesOptions,
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
    floating: true,
    align: 'left',
    y: 25,
    x: 10,
  },
};

export function updateChartData(
  chart: Highcharts.Chart | undefined,
  action: 'set' | 'append',
  newPoints: PVBESSHistoricalPowerData_Point[],
  timestampsToRemove: Date[],
  collection: 'total' | 'subPlant1' | 'subPlant2',
  affectNavigator: boolean = false,
) {
  if (!chart) {
    return undefined;
  }

  const seriesDataMap: { [seriesId: string]: Highcharts.PointOptionsObject[] } = {
    'pv-active-power': [],
    'charging-power': [],
    'discharging-power': [],
    'export-power-mv': [],
    'import-power-mv': [],
    'export-power-hv': [],
    'import-power-hv': [],
    'import-loss': [],
    'export-loss': [],
    'chargeable-energy': [],
    'dischargeable-energy': [],
  };

  newPoints.map((point) => {
    const timestamp = point.timestamp.getTime();

    const pointData: PVBESSHistoricalPowerData_DataPoint | undefined = point[collection];

    seriesDataMap['pv-active-power'].push([timestamp, pointData?.pvPower ?? null]);

    // bessPower is negative when charging - keep as negative to plot below zero line
    const chargingValue =
      pointData?.bessPower !== null &&
      pointData?.bessPower !== undefined &&
      pointData?.bessPower < 0
        ? pointData.bessPower
        : null;
    seriesDataMap['charging-power'].push([timestamp, chargingValue]);

    // bessPower is positive when discharging
    const dischargingValue =
      pointData?.bessPower !== null &&
      pointData?.bessPower !== undefined &&
      pointData?.bessPower > 0
        ? pointData.bessPower
        : null;
    seriesDataMap['discharging-power'].push([timestamp, dischargingValue]);

    const exportValueHV = pointData?.gridPowerExportHV ?? null;
    seriesDataMap['export-power-hv'].push([timestamp, exportValueHV]);

    const importValueHV = pointData?.gridPowerImportHV ?? null;
    seriesDataMap['import-power-hv'].push([timestamp, importValueHV]);

    const exportValueMV = pointData?.gridPowerExportMV ?? null;
    seriesDataMap['export-power-mv'].push([timestamp, exportValueMV]);

    const importValueMV = pointData?.gridPowerImportMV ?? null;
    seriesDataMap['import-power-mv'].push([timestamp, importValueMV]);

    const importLossValue = pointData?.gridPowerImportLoss ?? null;
    seriesDataMap['import-loss'].push([timestamp, importLossValue]);

    const exportLossValue = pointData?.gridPowerExportLoss ?? null;
    seriesDataMap['export-loss'].push([timestamp, exportLossValue]);

    // chargeableEnergy is positive number but we want to plot below zero line
    const chargeableEnergyValue =
      pointData?.chargeableEnergy !== null && pointData?.chargeableEnergy !== undefined
        ? -pointData.chargeableEnergy
        : null;
    seriesDataMap['chargeable-energy'].push([timestamp, chargeableEnergyValue]);

    // dischargeableEnergy is positive number
    const dischargeableEnergyValue = pointData?.dischargeableEnergy ?? null;
    seriesDataMap['dischargeable-energy'].push([timestamp, dischargeableEnergyValue]);
  });

  let shouldRedraw = false;
  let shouldHoverAddedPoint = false;

  Object.keys(seriesDataMap).forEach((seriesId) => {
    let series: Highcharts.Series | undefined = seriesById(chart, seriesId);

    let relevantSeriesInNavigator: Highcharts.Series | undefined = undefined;
    if (affectNavigator) {
      relevantSeriesInNavigator = chart.series.find(
        (s) => (s as any).baseSeries?.options.id === seriesId,
      );
    }

    // It is important to do this before removing the points
    if (series?.data.length && series?.data.length > 0) {
      const lastPoint = series?.data.slice(-1)[0];
      if (chart.hoverPoint?.x === lastPoint?.x) {
        shouldHoverAddedPoint = true;
      }
    }

    timestampsToRemove.forEach((timestamp) => {
      const indexInData = series?.data.findIndex(
        // Cannot read properties of undefined (reading 'x')
        // Sometimes we get this runtime error, so we check for undefined point.
        (point: Highcharts.Point) => point?.x === timestamp.getTime(),
      );

      if (indexInData !== -1 && indexInData !== undefined) {
        series?.removePoint(indexInData, false);

        if (relevantSeriesInNavigator) {
          relevantSeriesInNavigator?.removePoint(indexInData, false);
        }

        shouldRedraw = true;
      }
    });
  });

  if (shouldRedraw) {
    chart.redraw(false);
  }

  Object.keys(seriesDataMap).forEach((seriesId) => {
    let series: Highcharts.Series | undefined = seriesById(chart, seriesId);

    const seriesData = seriesDataMap[seriesId] || [];

    let relevantSeriesInNavigator: Highcharts.Series | undefined = undefined;
    if (affectNavigator) {
      relevantSeriesInNavigator = chart.series.find(
        (s) => (s as any).baseSeries?.options.id === seriesId,
      );
    }

    switch (action) {
      case 'set':
        series?.setData(seriesData, false);
        relevantSeriesInNavigator?.setData(seriesData, false);
        shouldRedraw = true;
        break;

      case 'append':
        seriesData.forEach((newPoint) => {
          series?.addPoint(newPoint, false);
          relevantSeriesInNavigator?.addPoint(newPoint, false);
        });

        /**
         * If the chart is zoomed to a past range and a new point is added,
         * the y axis is rescaled automatically according to the new point,
         * but we want to prevent this, so we don't redraw the chart.
         */
        const addedPoint =
          newPoints.length > 0 ? newPoints[newPoints.length - 1].timestamp.getTime() : undefined;
        const ex = chart.xAxis[0].getExtremes(); // { min, max, userMin, userMax, ... }
        const isVisible = addedPoint && addedPoint >= ex.min && addedPoint <= ex.max;

        if (isVisible) {
          shouldRedraw = true;
        }

        break;
    }
  });

  if (shouldRedraw) {
    chart.redraw(false);
  }

  /**
   * NOTE:
   * The last added point is available after redraw!
   * Hovering will be handled by the caller.
   */
  if (shouldHoverAddedPoint) {
    const addedPoint = chart.series.find((s) => s.options.visible)?.data.slice(-1)[0];
    if (addedPoint) {
      return addedPoint;
    }
  }

  return undefined;
}
