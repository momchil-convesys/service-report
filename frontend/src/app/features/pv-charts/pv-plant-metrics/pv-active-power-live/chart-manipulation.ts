import Highcharts from '../../../../highcharts-global-config';

import { chartColors, semanticColor_Irradiance } from '../../../../constants';
import {
  isEmptyArray,
  multiplierForValue,
  nullOrNumber,
  powerUnitForMultiplier,
  scaleAndFormatPowerValue,
  seriesById,
  updateTimeZoneSettings,
  yAxisFormatter_ScaleValue,
} from '../../../../helpers';
import { BaseChartContext } from '../../../../shared/base-chart-component/base-chart-component.component';
import {
  MasterGwScheduledPowerLimitDataPoint_ForDevice,
  MasterGwScheduledPowerLimitDataPoint_ForPlant,
} from '../../../power-limit-schedule/_data/dto';
import { PVPlantEssentialMetrics } from '../_data/pv-plant-metrics.model';
import {
  powerLimitSeriesColor,
  powerLimitSeriesMasterGwColor,
  seriesId_DeviceActivePower,
  seriesId_Irradiance,
  seriesId_PerformanceRatio,
  seriesId_PlantActivePower,
  seriesId_PlantActivePowerPM,
  seriesId_PlantActivePowerPM_ById,
  seriesId_PowerLimit,
  seriesId_ScheduledPowerLimitMasterGw_ForDevice,
  seriesId_ScheduledPowerLimitMasterGw_ForPlant,
  yScaleOptions_MaxPadding,
} from '../chart-constants';
import { renderNulls } from '../chart-null-renderer';
import { updatePlotLinesAndBands } from '../chart-plot-bands';
import { renderPowerLimitIndicators } from './chart-custom-rendering';
import { activePowerDataLabels, dataLabelsForDevicePowerLimit } from './chart-data-labels';
import { stalePointColorOpacityChange } from './chart-helpers';
import { PointOptionsWithCustomDataForTooltip, tooltip } from './chart-tooltip';

const categoryLabel_Irradiance = $localize`Irradiance`;
const categoryLabel_Performance = $localize`Performance`;
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
        renderPowerLimitIndicators(this);
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
      // Device active power scale

      softMin: 0,
      min: 0,
      showEmpty: true,
      tickAmount: 4,
      labels: {
        enabled: true,
        formatter: function (context) {
          const activePowerSeries = seriesById(this.chart, seriesId_DeviceActivePower);

          return yAxisFormatter_ScaleValue(context, 'W', activePowerSeries?.dataMax);
        },
      },
      title: {
        text: undefined,
      },
      maxPadding: yScaleOptions_MaxPadding,
    },
    {
      // Plant active power scale

      softMin: 0,
      min: 0,
      visible: false,
      tickAmount: 2, // prevent multiple tick alignment with primary y axis
      opposite: true,
      title: {
        text: undefined,
      },
      maxPadding: yScaleOptions_MaxPadding,
    },
    {
      // Performace Ratio Y Scale

      softMax: 200,
      softMin: 0,
      min: 0,
      visible: false,
      tickAmount: 2, // prevent multiple tick alignment with primary y axis
      opposite: true,
      title: {
        text: undefined,
      },
      maxPadding: yScaleOptions_MaxPadding,
      labels: {
        enabled: false,
      },
    },
    {
      // Radiation scale

      softMax: 2000,
      softMin: 0,
      min: 0,
      visible: false,
      tickAmount: 2, // prevent multiple tick alignment with primary y axis
      opposite: true,
      title: {
        text: undefined,
      },
      maxPadding: yScaleOptions_MaxPadding,
      labels: {
        enabled: false,
      },
    },
  ],
  legend: {
    enabled: false,
  },
  tooltip: tooltip,
  plotOptions: {
    column: {
      grouping: false,
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
      id: seriesId_DeviceActivePower,
      type: 'column',
      name: $localize`Active power`,
      data: [],
      borderWidth: 0,
      color: chartColors[8],
      dataLabels: {
        enabled: true,
        inside: false,
        crop: false,
        verticalAlign: 'top',
        padding: 5,
        borderWidth: 1,
        formatter: function () {
          return scaleAndFormatPowerValue(this.y, this.series.dataMax, {
            includeUnit: false,
            floorValue: true,
          });
        },
      },
    },
    {
      id: seriesId_PlantActivePower,
      type: 'column',
      name: $localize`Active power`,
      data: [],
      yAxis: 1,
      borderWidth: 0,
      groupPadding: 0,
      pointPadding: 0.1,
      color: chartColors[8],
      dataLabels: activePowerDataLabels,
      tooltip: {
        distance: 42,
      },
    },
    {
      id: seriesId_PowerLimit,
      type: 'column',
      name: $localize`Power limit`,
      data: [],
      pointPadding: 0,
      groupPadding: 0,
      // yAxis: 0,
      dataLabels: {
        enabled: true,
        inside: false,
        padding: 5,
        borderWidth: 1,
        color: powerLimitSeriesColor, // chartColors[5],
        style: {
          // textOutline: 'none',
        },
        crop: false,
        // x: 0,
        // y: -1000,
      },
      color: powerLimitSeriesColor, // + '00',
      borderRadius: 0,
      borderWidth: 0,
    },
    /**
     * Master Gateway data for Device
     *    -> on primary Y axis
     *    -> transparent bars over active power
     */
    {
      id: seriesId_ScheduledPowerLimitMasterGw_ForDevice,
      type: 'column',
      name: $localize`Scheduled power limit (for device)`,
      yAxis: 0,
      data: [],
      borderWidth: 0,
      groupPadding: 0,
      pointPadding: 0,
      dataLabels: {
        enabled: true,
        crop: false,
        verticalAlign: 'top',
        y: -1000,
        borderWidth: 1,
        padding: 5,
        color: powerLimitSeriesColor,
        style: {
          textOutline: 'none',
        },
        formatter: function () {
          const activePowerSeries = seriesById(this.series.chart, seriesId_DeviceActivePower);

          const string = scaleAndFormatPowerValue(this.y, activePowerSeries?.dataMax, {
            includeUnit: false,
            floorValue: false,
          });

          const color = (this as any).custom?.controlledByExternalSystem
            ? '#000000'
            : powerLimitSeriesColor;

          return `<div style="color: ${color}">${string}</div>`;
        },
      },
      color: powerLimitSeriesMasterGwColor, // + '00',
    },
    /**
     * Master Gateway data for Plant
     *    -> on same Y axis as plant active power
     *    -> transparent bar over plant active power
     */
    {
      id: seriesId_ScheduledPowerLimitMasterGw_ForPlant,
      type: 'column',
      name: $localize`Scheduled power limit (for Plant)`,
      yAxis: 1,
      data: [],
      borderWidth: 0,
      groupPadding: 0,
      pointPadding: 0,
      dataLabels: {
        enabled: true,
        crop: false,
        verticalAlign: 'top',
        y: -1000,
        padding: 5,
        borderWidth: 1,
        color: powerLimitSeriesColor, // chartColors[5],
        style: {
          textOutline: 'none',
        },
        formatter: function () {
          const activePowerSeries = seriesById(this.series.chart, seriesId_PlantActivePower);

          const color = (this as any).custom?.controlledByExternalSystem
            ? '#000000'
            : powerLimitSeriesColor;

          const string = scaleAndFormatPowerValue(this.y, activePowerSeries?.dataMax, {
            includeUnit: true,
            floorValue: false,
          });

          return `<div style="color: ${color}">${string}</div>`;
        },
      },
      color: powerLimitSeriesMasterGwColor, // + '00',
    },

    {
      id: seriesId_Irradiance,
      type: 'column',
      name: $localize`Irradiance`,
      data: [],
      yAxis: 3,
      borderWidth: 0,
      groupPadding: 0,
      pointPadding: 0.1,
      dataLabels: [
        {
          padding: 0,
          enabled: true,
          inside: false,
          format: '{y:,.1f}<br>W/m2',
        },
      ],
      tooltip: {
        valueSuffix: ' W/m2',
        valueDecimals: 1,
        distance: 42,
      },
      color: semanticColor_Irradiance,
    },
    {
      id: seriesId_PerformanceRatio,
      type: 'column',
      name: $localize`Performance ratio`,
      data: [],
      yAxis: 2,
      borderWidth: 0,
      groupPadding: 0,
      pointPadding: 0.1,
      dataLabels: {
        enabled: true,
        format: '{y:,.1f}%',
        inside: false,
        crop: false,
        overflow: 'allow',
        padding: 5,
        borderWidth: 1,
      },
      tooltip: {
        valueSuffix: '%',
        valueDecimals: 1,
      },
      color: chartColors[6],
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
            // use default positioner to avoid out of screen tooltips
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
              tickPositioner: undefined, // overwrite the custom positioner
              labels: {
                // enabled: false,
                align: 'left',
                formatter: function () {
                  const dataMax = this.chart.series[0].dataMax;

                  const multiplier = dataMax ? multiplierForValue(dataMax) : 1;
                  const unit = powerUnitForMultiplier(multiplier);

                  return unit;
                },
                x: 0,
                y: -5,
              },
            },
            {},
            {},
            {},
          ],
        },
      },
    ],
  },
};

export function handleContextChange(chart: Highcharts.Chart, context: BaseChartContext | null) {
  const seriesToRemove = chart.series.filter((s) =>
    s.options.id?.startsWith(seriesId_PlantActivePowerPM),
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

  const devices = context?.plant.devices;

  const powerMeterCategories = context?.plant.plantSpecificMetadata?.hasPowerMeter
    ? [categoryLabel_PowerMeter]
    : [];

  const deviceNames: string[] = data.deviceEssentialMetrics.map(
    (dataForDevice) => devices?.find((device) => device.id === dataForDevice.deviceId)?.name || '',
  );

  let categories: string[] = chart.xAxis[0].categories;

  const isInitialRender = categories.length === 0;

  if (isInitialRender) {
    const extraCategories = [
      '', // separator
      $localize`Active power`,
      ...powerMeterCategories,
      categoryLabel_Irradiance,
      categoryLabel_Performance,
    ];

    categories = [...deviceNames, ...extraCategories];

    chart.xAxis[0].setCategories(categories, false);

    updatePlotLinesAndBands(
      chart,
      deviceNames.length,
      extraCategories.length + powerMeterCategories.length,
    );
  }

  // Set y maximum before setting data to avoid series scale animation

  updateYAxisMaximum(chart, data, context);

  addPowerMeterSeriesIfNeeded(chart, data, context);

  setData_DevicesActivePower(chart, data, context);

  const someDeviceHasPowerLimit = setData_DevicesPowerLimit(chart, data);

  setData_PlantActivePowerAndLimit(chart, data, context);

  if (context?.plant.plantSpecificMetadata?.hasPowerMeter) {
    setData_PlantPowerMeters(chart, data, context, categories.indexOf(categoryLabel_PowerMeter));
  }

  setData_DevicesScheduledPowerLimitMasterGw(chart, data);
  setData_PlantScheduledPowerLimitMasterGw(chart, data);

  setData_Irradiance(chart, data, context, categories.indexOf(categoryLabel_Irradiance));
  setData_PerformanceRatio(chart, data, context, categories.indexOf(categoryLabel_Performance));

  // Update data labels to be rendered
  // inside bars if there will be power limit indicators on top
  // or above bars if there is no power limit

  const deviceWithPowerLimit =
    someDeviceHasPowerLimit || !isEmptyArray(data.deviceScheduledLimitDataPoints);

  const withLimit = deviceWithPowerLimit || !!data.plantScheduledLimitData;

  chart.update(
    {
      plotOptions: {
        column: {
          dataLabels: {
            inside: withLimit,
            verticalAlign: withLimit ? 'top' : undefined,
          },
        },
      },
    },
    false,
  );

  /**
   * Force recalculate x axis labels after all data has been set
   */
  if (isInitialRender) {
    chart.redraw();
    chart.xAxis[0].setCategories(categories, false);
  }
}

function updateYAxisMaximum(
  chart: Highcharts.Chart,
  data: PVPlantEssentialMetrics,
  context: BaseChartContext | null,
) {
  const maxPowerValues: number[] =
    context?.plant.devices
      ?.map((device) => device.deviceSpecificMetadata.deviceMaxPower)
      .filter((x): x is number => x !== undefined) || [];

  const maxPowerValueForInverter: number | undefined =
    maxPowerValues.length > 0 ? Math.max(...maxPowerValues) : undefined;
  chart.yAxis[0]?.update({ softMax: maxPowerValueForInverter }, false);

  const maxPowerValueForPlant = maxPowerValues.reduce((partialSum, a) => partialSum + a, 0);
  chart.yAxis[1]?.update({ softMax: maxPowerValueForPlant }, false);

  // Keep Y axis scale visible by setting max value
  if (data.plantEssentialMetrics.activePower === null) {
    chart.yAxis[0].update({ max: maxPowerValueForInverter }, false);
  } else {
    // When non null data is present,
    // do not limit the max value,
    // but rely on softMax instead.
    chart.yAxis[0].update({ max: undefined }, false);
  }
}

function setData_DevicesActivePower(
  chart: Highcharts.Chart,
  data: PVPlantEssentialMetrics,
  context: BaseChartContext | null,
) {
  const devices = context?.plant.devices;

  const series = seriesById(chart, seriesId_DeviceActivePower);
  series?.setData(
    [
      ...data.deviceEssentialMetrics.map((dataForDevice) => {
        let activePowerValue: number | null = dataForDevice.activePower;
        let activePowerTimestamp: string = dataForDevice.timestamp;
        let controlledByExternalSystem: boolean = false;

        /**
         * Reset negative active power values to zero
         * TODO: maybe fix at backend
         */
        if (activePowerValue && activePowerValue < 0) {
          activePowerValue = 0;
        }

        const deviceScheduledLimitDataPoint = data.deviceScheduledLimitDataPoints?.find(
          (p) => p.deviceId === dataForDevice.deviceId,
        );
        /**
         * If scheduled power limit data is present then
         * replace active power value with reported power limit
         * as it is considered more truthful and is more frequently updated.
         * Also in order to accurately compare active power against power limit,
         * values should have equal timestamps.
         */
        if (deviceScheduledLimitDataPoint) {
          activePowerValue = deviceScheduledLimitDataPoint.reportedPowerLimit;
          activePowerTimestamp = deviceScheduledLimitDataPoint.timestamp;
          controlledByExternalSystem =
            deviceScheduledLimitDataPoint.controlledByExternalSystem || false;
        }

        let overLimit = false;
        if (activePowerValue !== null) {
          const powerLimit = dataForDevice.powerLimit;
          if (powerLimit !== null && powerLimit) {
            overLimit = activePowerValue > powerLimit.value;
          } else {
            const scheduledLimitData: MasterGwScheduledPowerLimitDataPoint_ForDevice | undefined =
              data.deviceScheduledLimitDataPoints?.find(
                (point) => point.deviceId === dataForDevice.deviceId,
              );

            if (scheduledLimitData) {
              overLimit =
                scheduledLimitData.requestedPowerLimitSet !== null &&
                activePowerValue > scheduledLimitData.requestedPowerLimitSet;
            }
          }
        }

        const res: PointOptionsWithCustomDataForTooltip = {
          y: activePowerValue,
          custom: {
            timestamp: activePowerTimestamp,
            scheduledLimitForDevice: deviceScheduledLimitDataPoint,
            powerLimitForDevice: dataForDevice.powerLimit || undefined,
            valueSuffix: ' kW', // Value in tooltip is not scaled, it is always in kW
            tooltipTitle: devices?.find((device) => device.id === dataForDevice.deviceId)?.name,
            hasPowerMeter: context?.plant.plantSpecificMetadata?.hasPowerMeter,
            hasPermissionToSeeAllDetails: data.hasPermissionToSeeAllDetails,
            controlledByExternalSystem,
          },
          color:
            (controlledByExternalSystem ? '#b2c1cd' : overLimit ? chartColors[5] : chartColors[8]) +
            stalePointColorOpacityChange(activePowerTimestamp),
          labelrank: 2,
        };

        return res;
      }),
    ],
    false,
  );
}

function setData_DevicesScheduledPowerLimitMasterGw(
  chart: Highcharts.Chart,
  data: PVPlantEssentialMetrics,
) {
  seriesById(chart, seriesId_ScheduledPowerLimitMasterGw_ForDevice)?.setData(
    [
      // Iterate over deviceEssentialMetrics as categories are set based on this array
      // and deviceScheduledLimitDataPoints array is not yet clearly specified.
      ...data.deviceEssentialMetrics.map((dataForDevice) => {
        const scheduledLimitDataPoint: MasterGwScheduledPowerLimitDataPoint_ForDevice | undefined =
          data.deviceScheduledLimitDataPoints?.find(
            (point) => point.deviceId === dataForDevice.deviceId,
          );

        if (!scheduledLimitDataPoint) {
          return null;
        }

        const res: Highcharts.PointOptionsObject & { opacity: number } = {
          y: scheduledLimitDataPoint.requestedPowerLimitSet,
          opacity: 0, // keep column transparent
          custom: {
            controlledByExternalSystem: scheduledLimitDataPoint.controlledByExternalSystem || false,
          },
        };
        return res;
      }),
    ],
    false,
  );
}

function setData_PlantScheduledPowerLimitMasterGw(
  chart: Highcharts.Chart,
  data: PVPlantEssentialMetrics,
) {
  const scheduledLimitDataPoint: MasterGwScheduledPowerLimitDataPoint_ForPlant | null =
    data.plantScheduledLimitData;

  seriesById(chart, seriesId_ScheduledPowerLimitMasterGw_ForPlant)?.setData(
    [
      ...new Array(data.deviceEssentialMetrics.length + 1).fill(null),
      scheduledLimitDataPoint
        ? {
            y: scheduledLimitDataPoint.requestedPowerLimitSet,
            opacity: 0, // keep column transparent
            custom: {
              controlledByExternalSystem:
                scheduledLimitDataPoint.controlledByExternalSystem || false,
            },
          }
        : null,
    ],
    false,
  );
}

function setData_DevicesPowerLimit(
  chart: Highcharts.Chart,
  data: PVPlantEssentialMetrics,
): boolean {
  let hasPowerLimit = false;

  const defaultPowerLimitValue = null;
  const devicesPowerLimits = data.deviceEssentialMetrics.map(
    (dataForDevice) => dataForDevice.powerLimit?.value || defaultPowerLimitValue,
  );

  const sameLimitForAllInvertors =
    devicesPowerLimits.length === data.deviceEssentialMetrics.length &&
    devicesPowerLimits.length > 1 &&
    devicesPowerLimits.findIndex((x) => x !== devicesPowerLimits[0]) < 0;

  seriesById(chart, seriesId_PowerLimit)?.setData(
    [
      ...data.deviceEssentialMetrics.map((dataForDevice, index) => {
        let dataLabels: Highcharts.PlotColumnDataLabelsOptions = dataLabelsForDevicePowerLimit(
          sameLimitForAllInvertors,
          index,
        );

        const powerLimitValue: number | null = nullOrNumber(dataForDevice.powerLimit?.value);

        if (powerLimitValue !== null) {
          hasPowerLimit = true;
        }

        const res: any | Highcharts.PointOptionsObject = {
          y: powerLimitValue,
          opacity: 0, // keep column transparent
          labelrank: 1,
          dataLabels,
        };
        return res;
      }),
    ],
    false,
  );

  // If any of the inverters is limited
  return hasPowerLimit;
}

function setData_PlantActivePowerAndLimit(
  chart: Highcharts.Chart,
  data: PVPlantEssentialMetrics,
  context: BaseChartContext | null,
) {
  let activePowerValue: number | null = data.plantEssentialMetrics.activePower;
  let activePowerTimestamp: string = data.plantEssentialMetrics.timestamp;
  let showingOriginalActivePowerValue = true;

  // /**
  //  * If scheduled power limit data is present then
  //  * replace active power value with reported power limit
  //  * as it is considered more truthful and is more frequently updated.
  //  * Also in order to accurately compare active power against power limit,
  //  * values should have equal timestamps.
  //  */
  // if (data.plantScheduledLimitData) {
  //   activePowerValue = data.plantScheduledLimitData.reportedPowerLimit;
  //   activePowerTimestamp = data.plantScheduledLimitData.timestamp;
  //   showingOriginalActivePowerValue = false;
  // }

  // /**
  //  * If plant has power meters and there is no active schedule,
  //  * then show active power from power meters instead of GW.
  //  * Reasoning: If power limit shcedule is disabled, the active power bar will start
  //  * showing greater values (reported from GW), which is misleading behaviour.
  //  */
  // if (!data.plantScheduledLimitData && data.powerMetersData) {
  //   activePowerValue = data.powerMetersData.totalActivePower;
  //   activePowerTimestamp = data.powerMetersData.timestamp;
  //   showingOriginalActivePowerValue = false;
  // }

  /**
   * Reset negative active power values to zero.
   * Negative power values are either unexpected
   * or measure energy consumption.
   * TODO: maybe fix at backend
   */
  if (activePowerValue && activePowerValue < 0) {
    activePowerValue = 0;
    showingOriginalActivePowerValue = false;
  }

  let overLimit = false;
  if (
    data.plantScheduledLimitData?.requestedPowerLimitSet !== undefined &&
    activePowerValue !== null
  ) {
    overLimit =
      data.plantScheduledLimitData.requestedPowerLimitSet !== null &&
      activePowerValue > data.plantScheduledLimitData.requestedPowerLimitSet;
  }

  const plantActivePowerSeries: Highcharts.Series | undefined = seriesById(
    chart,
    seriesId_PlantActivePower,
  );

  const controlledByExternalSystem =
    data.plantScheduledLimitData?.controlledByExternalSystem || false;

  const chartPointForPlant: PointOptionsWithCustomDataForTooltip = {
    y: activePowerValue,
    custom: {
      timestamp: activePowerTimestamp,
      scheduledLimitForPlant: data.plantScheduledLimitData || undefined,
      valueSuffix: ' kW', // Value in tooltip is not scaled, it is always in kW
      tooltipTitle: context?.plant.name || $localize`Plant`,
      hasPowerMeter: context?.plant.plantSpecificMetadata?.hasPowerMeter,
      activePowerFromGW:
        data.hasPermissionToSeeAllDetails && !showingOriginalActivePowerValue
          ? {
              value: data.plantEssentialMetrics.activePower,
              timestamp: data.plantEssentialMetrics.timestamp,
            }
          : undefined,
      hasPermissionToSeeAllDetails: data.hasPermissionToSeeAllDetails,
      controlledByExternalSystem,
    },
    color:
      (controlledByExternalSystem ? '#b2c1cd' : overLimit ? chartColors[5] : chartColors[8]) +
      stalePointColorOpacityChange(activePowerTimestamp),
    labelrank: 3,
  };

  plantActivePowerSeries?.setData(
    [...new Array(data.deviceEssentialMetrics.length + 1).fill(null), chartPointForPlant],
    false,
  );
}

function setData_Irradiance(
  chart: Highcharts.Chart,
  data: PVPlantEssentialMetrics,
  context: BaseChartContext | null,
  categoryIndex: number,
) {
  if (categoryIndex < 0) {
    console.error('Missing category for irradiance series.');
    return;
  }

  const staleOpacitySuffix = stalePointColorOpacityChange(data.plantEssentialMetrics.timestamp);

  const baseColor = semanticColor_Irradiance + staleOpacitySuffix;

  seriesById(chart, seriesId_Irradiance)?.setData(
    [
      ...new Array(categoryIndex).fill(null),
      {
        // Current irradiance (W/m2)
        y: data.plantEssentialMetrics.radiation,
        custom: {
          timestamp: data.plantEssentialMetrics.timestamp,
          valueSuffix: ' W/m2',
          tooltipTitle: context?.plant.name,
        },
        labelrank: 2,
        borderColor: baseColor,
        borderWidth: 1,
        color: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, baseColor],
            [1, '#ffffff'],
          ],
        },
      },
    ],
    false,
  );
}

function setData_PerformanceRatio(
  chart: Highcharts.Chart,
  data: PVPlantEssentialMetrics,
  context: BaseChartContext | null,
  categoryIndex: number,
) {
  if (categoryIndex < 0) {
    console.error('Missing category for performance ratio series.');
    return;
  }

  seriesById(chart, seriesId_PerformanceRatio)?.setData(
    [
      ...new Array(categoryIndex).fill(null),
      {
        y: data.plantEssentialMetrics.performanceRatio,
        custom: {
          timestamp: data.plantEssentialMetrics.timestamp,
          valueSuffix: '%',
          tooltipTitle: context?.plant.name,
        },
        color: chartColors[6] + stalePointColorOpacityChange(data.plantEssentialMetrics.timestamp),
        labelrank: 1,
      },
    ],
    false,
  );
}

function addPowerMeterSeriesIfNeeded(
  chart: Highcharts.Chart,
  data: PVPlantEssentialMetrics,
  context: BaseChartContext | null,
) {
  if (!context?.plant.plantSpecificMetadata?.hasPowerMeter) {
    const seriesToRemove = chart.series.filter((s) =>
      s.options.id?.startsWith(seriesId_PlantActivePowerPM),
    );

    seriesToRemove.forEach((s) => s.remove(false));

    return;
  }

  const series_PowerLimit = seriesById(chart, seriesId_PlantActivePowerPM);
  if (series_PowerLimit) {
    // Already added
    return;
  }

  chart.addSeries({
    type: 'column',
    id: seriesId_PlantActivePowerPM,
    name: $localize`Total active power from PM`,
    color: chartColors[8],
    yAxis: 1,
    borderWidth: 0,
    groupPadding: 0,
    pointPadding: 0.1,
    dataLabels: activePowerDataLabels,
  });

  data.powerMetersData?.powerMetersData.forEach((pmData) => {
    const seriesId = seriesId_PlantActivePowerPM_ById(pmData.id);
    const powerMeterSeries = seriesById(chart, seriesId);

    if (!powerMeterSeries) {
      chart.addSeries({
        id: seriesId,
        type: 'column',
        name: pmData.id,
        stacking: 'normal',
        yAxis: 1,
        borderWidth: 2,
        borderColor: chartColors[8],
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
    console.error('Missing category for plant power from power meter series.');
    return;
  }

  let activePowerPM_Value: number | null = nullOrNumber(data.powerMetersData?.totalActivePower);
  let activePowerPM_Timestamp: string | undefined = data.powerMetersData?.timestamp;

  const series_PlantActivePowerPM: Highcharts.Series | undefined = seriesById(
    chart,
    seriesId_PlantActivePowerPM,
  );

  const chartPointForPlant: PointOptionsWithCustomDataForTooltip = {
    y: activePowerPM_Value,
    custom: {
      timestamp: activePowerPM_Timestamp,
      valueSuffix: ' kW', // Value in tooltip is not scaled, it is always in kW
      tooltipTitle: context?.plant.name || 'Plant',
      hasPowerMeter: context?.plant.plantSpecificMetadata?.hasPowerMeter,
      hasPermissionToSeeAllDetails: data.hasPermissionToSeeAllDetails,
    },
    color:
      chartColors[8] +
      (activePowerPM_Timestamp ? stalePointColorOpacityChange(activePowerPM_Timestamp) : ''),
    labelrank: 3,
    dataLabels: {
      padding: 0,
    },
  };

  series_PlantActivePowerPM?.setData(
    [...new Array(categoryIndex).fill(null), chartPointForPlant],
    false,
  );

  data.powerMetersData?.powerMetersData.forEach((pmData) => {
    const seriesId = seriesId_PlantActivePowerPM_ById(pmData.id);
    const powerMeterSeries = seriesById(chart, seriesId);

    /**
     * Reset negative active power values to zero.
     * Negative power values are either unexpected
     * or measure energy consumption.
     * TODO: maybe fix at backend
     */
    let pmValue = pmData.activePower;
    if (pmValue && pmValue < 0) {
      pmValue = 0;
    }

    powerMeterSeries?.setData(
      [
        ...new Array(categoryIndex).fill(null),
        {
          y: pmValue,
          custom: {
            timestamp: activePowerPM_Timestamp,
            valueSuffix: ' kW', // Value in tooltip is not scaled, it is always in kW
            tooltipTitle: context?.plant.name || $localize`Plant`,
            hasPowerMeter: context?.plant.plantSpecificMetadata?.hasPowerMeter,
          },
          color:
            (powerMeterSeries.options as Highcharts.SeriesBarOptions).color +
            (activePowerPM_Timestamp ? stalePointColorOpacityChange(activePowerPM_Timestamp) : ''),
        },
      ],
      false,
    );
  });
}
