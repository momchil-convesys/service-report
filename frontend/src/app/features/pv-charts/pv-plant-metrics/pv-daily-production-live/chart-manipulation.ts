import Highcharts from '../../../../highcharts-global-config';

import { differenceInMinutes } from 'date-fns';
import { chartColors, semanticColor_Irradiance } from '../../../../constants';
import {
  energyUnitForMultiplier,
  multiplierForValue,
  nullOrNumber,
  scaleAndFormatEnergyValue,
  seriesById,
  updateTimeZoneSettings,
  yAxisFormatter_ScaleValue,
} from '../../../../helpers';
import { BaseChartContext } from '../../../../shared/base-chart-component/base-chart-component.component';
import {
  PVPlantEssentialMetrics,
  PVPlantEssentialMetricsPoint,
} from '../_data/pv-plant-metrics.model';
import {
  seriesId_DeviceDailyProduction,
  seriesId_Irradiation,
  seriesId_PerformanceRatio,
  seriesId_PlantDailyProduction,
  seriesId_PlantDailyProductionPM,
  seriesId_PlantDailyProductionPM_ById,
  yScaleOptions_MaxPadding,
} from '../chart-constants';
import { renderNulls } from '../chart-null-renderer';
import { updatePlotLinesAndBands } from '../chart-plot-bands';
import { dataLabelsFormatter_Energy } from './chart-data-labels';
import { PointOptionsWithCustomDataForTooltip, tooltip } from './chart-tooltip';

const categoryLabel_Irradiation = $localize`Irradiation`;
const categoryLabel_DailyPerformance = $localize`Performance`;
const categoryLabel_PowerMeter = $localize`Power meter`;

export const chartOptions: Highcharts.Options = {
  chart: {
    plotBorderColor: '#D4DCE3', // @border-color-base,
    zooming: {
      mouseWheel: false,
    },
    spacingTop: 18, // default is 10

    events: {
      render: function () {
        renderInvalid(this);
        renderNulls(this);
      },
    },
  },
  xAxis: {
    crosshair: true,
    zoomEnabled: false,
    categories: [],
    plotLines: [],
    labels: {
      autoRotationLimit: 60,
    },
  },
  yAxis: [
    {
      // Daily production for device

      tickAmount: 4,
      labels: {
        enabled: true,
        formatter: function (context) {
          const dataMax = seriesById(this.chart, seriesId_DeviceDailyProduction)?.dataMax;

          return yAxisFormatter_ScaleValue(context, 'Wh', dataMax);
        },
      },
      title: {
        text: undefined,
      },
      maxPadding: yScaleOptions_MaxPadding,
      min: 0,
    },
    {
      // Daily production for plant

      visible: false,
      tickAmount: 2, // prevent multiple tick alignment with primary y axis
      maxPadding: yScaleOptions_MaxPadding,
      min: 0,
    },
    {
      // Performance ratio scale

      visible: false,
      tickAmount: 2, // prevent multiple tick alignment with primary y axis
      softMax: 200,
      maxPadding: yScaleOptions_MaxPadding,
      min: 0,
    },
    {
      // Daily irradiation scale

      softMax: 10, // TODO: max daily irradiation for the particular location
      softMin: 0,
      min: 0,
      visible: false,
      tickAmount: 2, // prevent multiple tick alignment with primary y axis

      maxPadding: yScaleOptions_MaxPadding,
    },
  ],
  legend: {
    enabled: false,
  },
  tooltip: tooltip,
  plotOptions: {
    column: {
      grouping: false,
      // groupPadding: 0,
      pointPadding: 0,
      states: {
        inactive: {
          opacity: 1,
        },
      },
    },
  },
  series: [
    {
      id: seriesId_DeviceDailyProduction,
      type: 'column',
      name: $localize`Daily production`,
      color: chartColors[4],
      data: [],
      stacking: 'normal',
      dataLabels: {
        enabled: true,
        inside: false,
        padding: 0,
        borderWidth: 1,
        formatter: function () {
          return scaleAndFormatEnergyValue(this.y, this.series.dataMax, false);
        },
      },
    },
    {
      id: seriesId_PlantDailyProduction,
      type: 'column',
      name: $localize`Daily production`,
      color: chartColors[4],
      data: [],
      yAxis: 1,
      groupPadding: 0,
      pointPadding: 0.1,
      stacking: 'normal',
      dataLabels: {
        enabled: true,
        inside: false,
        formatter: dataLabelsFormatter_Energy,
      },
      tooltip: {
        distance: 42,
      },
    },
    {
      id: seriesId_Irradiation,
      type: 'column',
      name: $localize`Irradiation`,
      color: semanticColor_Irradiance,
      data: [],
      yAxis: 3,
      stacking: 'normal',
      borderWidth: 0,
      groupPadding: 0,
      pointPadding: 0.1,
      dataLabels: {
        enabled: true,
        padding: 0,
        format: '{y:.1f}<br>kWh<br>/m2',
        inside: false,
      },
      tooltip: {
        valueSuffix: ' kWh/m2',
        valueDecimals: 3,
        distance: 42,
      },
    },
    {
      id: seriesId_PerformanceRatio,
      type: 'column',
      name: $localize`Performance ratio`,
      color: chartColors[6],
      data: [],
      yAxis: 2,
      groupPadding: 0,
      pointPadding: 0.1,
      stacking: 'normal',
      dataLabels: {
        enabled: true,
        format: '{y:.1f}%',
        inside: false,
        padding: 0,
        borderWidth: 1,
      },
      tooltip: {
        valueSuffix: '%',
        valueDecimals: 1,
      },
    },
  ],
  responsive: {
    rules: [
      {
        condition: {
          maxWidth: 400,
        },
        // Make the labels less space demanding on mobile
        chartOptions: {
          tooltip: {
            positioner: undefined,
          },
          xAxis: {
            labels: {
              rotation: -90,
            },
          },
          yAxis: [
            {
              tickAmount: 2,
              showFirstLabel: false,
              labels: {
                // enabled: false,
                align: 'left',
                x: 0,
                y: -5,
                formatter: function () {
                  const dataMax = seriesById(this.chart, seriesId_DeviceDailyProduction)?.dataMax;

                  const multiplier = dataMax ? multiplierForValue(dataMax) : 1;
                  const unit = energyUnitForMultiplier(multiplier);

                  return unit;
                },
              },
            },
            {},
            {},
            {},
          ],
          // series: [
          //   { type: 'column' },
          //   {
          //     type: 'column',
          //     dataLabels: {
          //       borderColor: chartColors[4],
          //       backgroundColor: '#ffffff',
          //     },
          //   },
          // ],
        },
      },
    ],
  },
};

export function handleContextChange(chart: Highcharts.Chart, context: BaseChartContext | null) {
  const seriesToRemove = chart.series.filter((s) =>
    s.options.id?.startsWith(seriesId_PlantDailyProductionPM),
  );

  seriesToRemove.forEach((s) => s.remove(false));
}

export function updateChartData(
  chart: Highcharts.Chart,
  data: PVPlantEssentialMetrics | undefined,
  context: BaseChartContext | null,
) {
  if (!data) {
    chart.series.forEach((s) => s.setData([], false, false));
    chart.xAxis[0].setCategories([], false);
    updatePlotLinesAndBands(chart, 0, 0);

    return;
  }

  updateTimeZoneSettings(chart, context?.plant.timeZone, false);

  const plantEssentialMetrics = data.plantEssentialMetrics as PVPlantEssentialMetricsPoint;
  const deviceEssentialMetrics = data.deviceEssentialMetrics || [];

  const devices = context?.plant.devices;

  const powerMeterCategories = context?.plant.plantSpecificMetadata?.hasPowerMeter
    ? [categoryLabel_PowerMeter]
    : [];

  const deviceNames: string[] = deviceEssentialMetrics.map(
    (dataForDevice) => devices?.find((device) => device.id === dataForDevice.deviceId)?.name || '',
  );

  const extraCategories = [
    '', // separator
    $localize`Production`,
    ...powerMeterCategories,
    categoryLabel_Irradiation,
    categoryLabel_DailyPerformance,
  ];

  const categories: string[] = [...deviceNames, ...extraCategories];

  const isInitialRender = chart.xAxis[0].categories.length === 0;

  chart.xAxis[0].setCategories(categories, false);

  addPowerMeterSeriesIfNeeded(chart, data, context);

  updatePlotLinesAndBands(chart, deviceNames.length, extraCategories.length);

  // Set y maximum before setting data to avoid series scale animation

  const productionCalcCoefficient = 6; // E.g: 6 hours per day at max power

  const maxPowerValues: number[] =
    context?.plant.devices
      .map((device) => device.deviceSpecificMetadata.deviceMaxPower)
      .filter((x): x is number => x !== undefined) || [];

  const maxDailyProductionForInverter: number | undefined =
    maxPowerValues.length > 0 ? Math.max(...maxPowerValues) * productionCalcCoefficient : undefined;
  chart.yAxis[0]?.update({ softMax: maxDailyProductionForInverter }, false);

  const maxDailyProductionForPlant = maxPowerValues.reduce(
    (partialSum, a) => partialSum + a * productionCalcCoefficient,
    0,
  );
  chart.yAxis[1]?.update({ softMax: maxDailyProductionForPlant }, false);

  if (context?.plant.plantSpecificMetadata?.hasPowerMeter) {
    setData_PlantPowerMeters(chart, data, context, categories.indexOf(categoryLabel_PowerMeter));
  }

  seriesById(chart, seriesId_DeviceDailyProduction)?.setData(
    [
      ...deviceEssentialMetrics.map((dataForDevice) => ({
        y: dataForDevice.dailyProduction,
        custom: {
          timestamp: dataForDevice.timestamp,
          valueSuffix: ' kWh',
          tooltipTitle: devices?.find((device) => device.id === dataForDevice.deviceId)?.name,
        },
        color: chartColors[4] + stalePointColorOpacityChange(dataForDevice.timestamp),
      })),
    ],
    false,
  );

  seriesById(chart, seriesId_PlantDailyProduction)?.setData(
    [
      ...new Array(deviceEssentialMetrics.length + 1).fill(null),
      {
        y: plantEssentialMetrics.dailyProduction,
        custom: {
          timestamp: plantEssentialMetrics.timestamp,
          valueSuffix: ' kWh',
          tooltipTitle: context?.plant.name,
        },
        color: chartColors[4] + stalePointColorOpacityChange(plantEssentialMetrics.timestamp),
        labelrank: 3,
      },
    ],
    false,
  );

  const categoryIndex_Irradiation = categories.indexOf(categoryLabel_Irradiation);
  if (categoryIndex_Irradiation < 0) {
    console.error('Missing category for irradiation series.');
  } else {
    seriesById(chart, seriesId_Irradiation)?.setData(
      [
        ...new Array(categoryIndex_Irradiation).fill(null),
        {
          // irradiation per square meter for current day up until current moment (kWh/m2)
          y: plantEssentialMetrics.accumulatedRadiation,
          custom: {
            timestamp: plantEssentialMetrics.timestamp,
            valueSuffix: ' kWh/m2',
            tooltipTitle: context?.plant.name,
          },
          color:
            semanticColor_Irradiance +
            stalePointColorOpacityChange(plantEssentialMetrics.timestamp),
          labelrank: 3,
        },
      ],
      false,
    );
  }

  const categoryIndex_DailyPerformance = categories.indexOf(categoryLabel_DailyPerformance);
  if (categoryIndex_DailyPerformance < 0) {
    console.error('Missing category for daily performance series.');
  } else {
    seriesById(chart, seriesId_PerformanceRatio)?.setData(
      [
        ...new Array(categoryIndex_DailyPerformance).fill(null),
        {
          y: plantEssentialMetrics.performanceRatioAverage,
          custom: {
            timestamp: plantEssentialMetrics.timestamp,
            valueSuffix: ' %',
            tooltipTitle: context?.plant.name,
          },
          color: chartColors[6] + stalePointColorOpacityChange(plantEssentialMetrics.timestamp),
          labelrank: 1,
        },
      ],
      false,
    );
  }

  /**
   * Force recalculate x axis labels after all data has been set
   */
  if (isInitialRender) {
    chart.redraw();
    chart.xAxis[0].setCategories(categories, false);
  }
}

function isPointStale(timestamp: string): boolean {
  return differenceInMinutes(new Date(timestamp), new Date()) < -60;
}

function stalePointColorOpacityChange(timestamp: string): string {
  return isPointStale(timestamp) ? '77' : '';
}

function renderInvalid(chart: Highcharts.Chart) {
  let invalidMarkers: Highcharts.SVGElement[] = [];

  (chart as any).invalidMarkers?.forEach((marker: Highcharts.SVGElement) => marker.destroy());

  chart.series.forEach((series: Highcharts.Series) => {
    if (series.visible) {
      series.points.forEach((point: any) => {
        if (point && point.y && point.y < 0) {
          const x = chart.plotLeft + point.barX;
          const y = point.isNull ? 0 : chart.plotTop;
          const width = point.isNull ? 0 : point.pointWidth;
          const height = point.isNull ? 0 : chart.plotHeight;

          const invalidMarker: Highcharts.SVGElement = chart.renderer
            .rect(x, y, width, height)
            .attr({
              fill: chartColors[5] + '22',
              zIndex: 2,
              opacity: 1,
            })
            .add();
          invalidMarkers.push(invalidMarker);
        }
      });
    }
  });

  (chart as any).invalidMarkers = invalidMarkers;
}

function addPowerMeterSeriesIfNeeded(
  chart: Highcharts.Chart,
  data: PVPlantEssentialMetrics,
  context: BaseChartContext | null,
) {
  if (!context?.plant.plantSpecificMetadata?.hasPowerMeter) {
    const seriesToRemove = chart.series.filter((s) =>
      s.options.id?.startsWith(seriesId_PlantDailyProductionPM),
    );

    seriesToRemove.forEach((s) => s.remove(false));

    return;
  }

  const series_PlantDailyProductionPM = seriesById(chart, seriesId_PlantDailyProductionPM);
  if (series_PlantDailyProductionPM) {
    // Already added
    return;
  }

  chart.addSeries({
    type: 'column',
    id: seriesId_PlantDailyProductionPM,
    name: $localize`Daily production from PM`,
    color: chartColors[4],
    yAxis: 1,
    borderWidth: 0,
    groupPadding: 0,
    pointPadding: 0.1,
    dataLabels: {
      enabled: true,
      inside: true,
      verticalAlign: 'top',
      formatter: dataLabelsFormatter_Energy,
    },
  });

  data.powerMetersData?.powerMetersData.forEach((pmData) => {
    const seriesId = seriesId_PlantDailyProductionPM_ById(pmData.id);
    const powerMeterSeries = seriesById(chart, seriesId);

    if (!powerMeterSeries) {
      chart.addSeries({
        id: seriesId,
        type: 'column',
        name: pmData.id,
        stacking: 'normal',
        yAxis: 1,
        borderWidth: 2,
        borderColor: chartColors[4],
        groupPadding: 0,
        pointPadding: 0.1,
        color: '#ffffff',
        dataLabels: {
          enabled: false,
        },
      });
    }
  });
}

function setData_PlantPowerMeters(
  chart: Highcharts.Chart,
  data: PVPlantEssentialMetrics,
  context: BaseChartContext | null,
  categoryIndex: number,
) {
  if (categoryIndex < 0) {
    console.error('Missing category for plant production from power meter series.');
    return;
  }

  const value: number | null = nullOrNumber(data.powerMetersData?.totalDailyProduction);

  const productionPM_Timestamp: string | undefined = data.powerMetersData?.timestamp;

  const chartPointForPlant: PointOptionsWithCustomDataForTooltip = {
    y: value,
    custom: {
      timestamp: productionPM_Timestamp,
      valueSuffix: ' kWh',
      tooltipTitle: context?.plant.name,
    },
    color:
      chartColors[4] +
      (productionPM_Timestamp ? stalePointColorOpacityChange(productionPM_Timestamp) : ''),
    labelrank: 3,
  };

  seriesById(chart, seriesId_PlantDailyProductionPM)?.setData(
    [...new Array(categoryIndex).fill(null), chartPointForPlant],
    false,
  );

  data.powerMetersData?.powerMetersData.forEach((pmData) => {
    const seriesId = seriesId_PlantDailyProductionPM_ById(pmData.id);
    const powerMeterSeries = seriesById(chart, seriesId);

    powerMeterSeries?.setData(
      [
        ...new Array(categoryIndex).fill(null),
        {
          y: pmData.dailyProduction,
          custom: {
            timestamp: productionPM_Timestamp,
            valueSuffix: ' kWh', // Value in tooltip is not scaled, it is always in kWh
            tooltipTitle: context?.plant.name || $localize`Plant`,
          },
          color:
            (powerMeterSeries.options as Highcharts.SeriesBarOptions).color +
            (productionPM_Timestamp ? stalePointColorOpacityChange(productionPM_Timestamp) : ''),
        },
      ],
      false,
    );
  });
}
