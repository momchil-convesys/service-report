import {
  chartColors,
  chartColorsExclude,
  ONE_MINUTE,
  semanticColor_ActivePower,
  semanticColor_Irradiance,
} from '../../../../constants';
import {
  multiplierForValue,
  powerUnitForMultiplier,
  seriesById,
  updateTimeZoneSettings,
  yAxisFormatter_ScaleValue,
} from '../../../../helpers';
import Highcharts from '../../../../highcharts-global-config';
import { BaseChartContext } from '../../../../shared/base-chart-component/base-chart-component.component';
import { MasterGwScheduledPowerLimitDataPoint } from '../../../power-limit-schedule/_data/dto';
import {
  seriesId_ScheduledPowerLimit_RequestedSet,
  seriesId_ScheduledPowerLimit_RequestedSet_Adjusted,
  seriesId_ScheduledPowerLimit_RequestedSet_External,
  seriesId_ScheduledPowerLimit_RequestedSet_Manual,
} from '../../../power-limit-schedule/charts/chart-common-definitions';
import { selectionEventHandler } from '../../_shared/pv-charts-column-datetime-axis';
import {
  dataLabelOptions_Irradiance,
  seriesId_DeviceActivePowerGroup,
  seriesId_Irradiance,
  tooltipOptions_Irradiance,
  yAxis_Irradiance,
  yAxisId_Irradiance,
} from '../../_shared/pv-charts-common-settings';
import { powerLimitSeriesColor } from '../../pv-plant-metrics/chart-constants';
import { PVPowerDataForPlant_NEW } from '../_data/pv-power';
import { updateDatetimeAxisRange } from './chart-datetime-axis';
import { tooltip } from './chart-tooltip';

export const chartOptions: Highcharts.Options = {
  chart: {
    plotBorderColor: '#D4DCE3', // @border-color-base,
    zooming: {
      type: 'x',
      mouseWheel: false,
    },
    spacingTop: 18, // default is 10
    spacingBottom: 5, // compensate for legend bottom spacing
    events: {
      selection: function (event: Highcharts.SelectEventObject) {
        return selectionEventHandler(this, event);
      },
    },
    ignoreHiddenSeries: false, // keep y axis always visible
  },
  navigation: {
    buttonOptions: {
      enabled: true,
    },
  },
  xAxis: {
    type: 'datetime',
    crosshair: true,
    minRange: 1000 * 60 * 10, // 10 minute zoom
    scrollbar: {
      enabled: true,
    },
    showFirstLabel: true,
    showLastLabel: true,
    startOnTick: true,
    endOnTick: true,
  },
  yAxis: [
    {
      // opposite: true,
      labels: {
        enabled: true,
        formatter: function (context) {
          const activePowerSeries = this.chart.series.length > 0 ? this.chart.series[0] : undefined;

          return yAxisFormatter_ScaleValue(context, 'W', activePowerSeries?.dataMax);
        },
      },
      title: {
        text: undefined,
      },
      softMin: 0,
      min: 0,
      minPadding: 0.1,
      tickAmount: 4,
    },
    yAxis_Irradiance,
  ],
  plotOptions: {
    series: {
      dataGrouping: {
        enabled: false,
      },
      marker: { enabledThreshold: 4 },
      gapSize: ONE_MINUTE * 5,
      gapUnit: 'value',
    },
  },
  legend: {
    enabled: true,
  },
  tooltip: tooltip,
  series: [],
  responsive: {
    rules: [
      {
        condition: {
          maxWidth: 400,
        },
        chartOptions: {
          yAxis: [
            {
              tickAmount: 2,
              showFirstLabel: false,
              tickPositioner: undefined, // overwrite the custom positioner
              labels: {
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
            {
              visible: false,
            },
          ],
          tooltip: {
            outside: true,
            positioner: function (labelWidth, labelHeight, point) {
              const useDefaultPositioner = this.chart.series.filter((s) => s.visible).length < 3;
              const defaultPosition = this.getPosition(labelWidth, labelHeight, point);
              if (useDefaultPositioner) {
                return defaultPosition;
              }

              // Show tooltip above the chart

              return { x: defaultPosition.x, y: -1 * labelHeight + 15 };
            },
          },
        },
      },
    ],
  },
};

export function updateChartData(
  chart: Highcharts.Chart,
  pvPowerData: PVPowerDataForPlant_NEW | undefined,
  context: BaseChartContext | null,
) {
  if (!pvPowerData || pvPowerData.dataPoints.length === 0) {
    chart.xAxis[0].update(
      {
        min: undefined,
        max: undefined,
      },
      false,
    );

    chart.zoomOut();

    while (chart.series.length > 0) {
      chart.series[0].remove(false);
    }

    return;
  }

  updateTimeZoneSettings(chart, context?.plant.timeZone, false);

  chart.update(
    {
      plotOptions: {
        series: {
          dataGrouping: {
            enabled: pvPowerData.dataPoints.length > 5000,
          },
        },
      },
    },
    false,
  );

  // Remove series when switching between plants and devices
  const shouldRemoveSeries = !chart.series.find((s) => s.options.id === pvPowerData.plantId);

  if (shouldRemoveSeries) {
    chart.zoomOut();

    while (chart.series.length > 0) {
      chart.series[0].remove(false);
    }

    addSeriesForPlantChart(chart, pvPowerData);
  }

  // Set y maximum before setting data to avoid series scale animation

  const maxPowerValues: number[] =
    (context?.plant.devices || [])
      .map((device) => device.deviceSpecificMetadata.deviceMaxPower)
      .filter((x): x is number => x !== undefined && x !== null) || [];
  const maxPowerValueForPlant = maxPowerValues.reduce((partialSum, a) => partialSum + a, 0);

  /**
   * TODO: do not check against HARDCODED plant ids!
   * This condition ensures that the irradiance line is properly aligned with active power.
   */
  if (pvPowerData.plantId === '17') {
    chart.yAxis[0]?.update({ max: 100000, minPadding: 0, tickAmount: 2 }, false);
  } else {
    chart.yAxis[0]?.update({ max: maxPowerValueForPlant || undefined }, false);
  }

  setDataForPlantChart(
    chart,
    pvPowerData,
    context?.plant.plantSpecificMetadata?.hasPowerMeter || false,
  );

  updateDatetimeAxisRange(chart, context, 0);
}

/**
 * ============================================================================
 * Plant chart specifics
 */

function addSeriesForPlantChart(chart: Highcharts.Chart, pvPowerData: PVPowerDataForPlant_NEW) {
  const inverterSeriesColors = chartColorsExclude([
    semanticColor_ActivePower,
    semanticColor_Irradiance,
  ]);

  chart.addSeries(
    {
      id: pvPowerData.plantId,
      type: 'areaspline',
      name: $localize`Plant active power`,
      color: semanticColor_ActivePower,
      fillColor: semanticColor_ActivePower + '88',
      zIndex: 1,
      states: {
        inactive: {
          opacity: 0.8,
        },
      },
    },
    false,
  );

  // Show single item in legend for all device series (linked to this one)
  chart.addSeries(
    {
      id: seriesId_DeviceActivePowerGroup,
      type: 'spline',
      name: $localize`Devices active power`,
      color: chartColors[1],
      visible: false,
    },
    false,
  );

  /**
   * TODO: do not check against HARDCODED plant ids!
   */
  let irradianceSeriesName = $localize`Irradiance`;
  if (pvPowerData.plantId === '26') {
    irradianceSeriesName = $localize`GTI Irradiance`;
  }

  chart.addSeries(
    {
      id: seriesId_Irradiance,
      type: 'areaspline',
      name: irradianceSeriesName,
      dataLabels: dataLabelOptions_Irradiance,
      tooltip: tooltipOptions_Irradiance,
      yAxis: yAxisId_Irradiance,
      color: semanticColor_Irradiance,
      fillOpacity: 0,
      zIndex: 2,
    },
    false,
  );

  pvPowerData.extraSeriesLabels.forEach((label, index) => {
    chart.addSeries(
      {
        id: label,
        linkedTo: seriesId_DeviceActivePowerGroup,
        type: 'spline',
        name: label,
        zIndex: 3,
        // index + 1 to start from chartColors[1]
        color: inverterSeriesColors[(index + 1) % inverterSeriesColors.length],
      },
      false,
    );
  });

  // Scheduled power limit

  addScheduledPowerLimitSeries(chart, pvPowerData.showOriginalLimitData);
}

function setDataForPlantChart(
  chart: Highcharts.Chart,
  pvPowerData: PVPowerDataForPlant_NEW,
  hasPowerMeter: boolean,
) {
  const dataPoints = pvPowerData.dataPoints;
  const irradianceDataPoints = pvPowerData.irradianceDataPoints;

  const seriesDataPlantActivePower: Highcharts.PointOptionsType[] =
    dataPoints.map((point) => {
      let value =
        hasPowerMeter && point.activePowerPM !== undefined && point.activePowerPM !== null
          ? point.activePowerPM
          : point.activePower;

      /**
       * Reset negative active power values to zero.
       * Negative power values are either unexpected
       * or measure energy consumption.
       * TODO: maybe fix at backend
       */

      if (value && value < 0) {
        value = 0;
      }

      return [point.timestamp.getTime(), value];
    }) || [];

  seriesById(chart, pvPowerData.plantId)?.setData(seriesDataPlantActivePower, false, false);

  const seriesDataIrradiance: Highcharts.PointOptionsType[] =
    irradianceDataPoints.map((point) => [point.timestamp.getTime(), point.irradiance]) || [];

  seriesById(chart, seriesId_Irradiance)?.setData(seriesDataIrradiance, false, false);
  seriesById(chart, seriesId_Irradiance)?.update(
    {
      type: 'line',
      showInLegend: seriesDataIrradiance.length > 0,
    },
    false,
  );

  pvPowerData.extraSeriesLabels.forEach((label, index) => {
    const seriesData: Highcharts.PointOptionsType[] =
      dataPoints.map((point) => [point.timestamp.getTime(), point.extraSeriesValues[index]]) || [];
    seriesById(chart, label)?.setData(seriesData, false, false);
  });

  // Scheduled power limit

  setScheduledPowerLimitData(chart, pvPowerData.scheduledPowerLimitDataPoints);
  setScheduledPowerLimitData_Adjusted(chart, pvPowerData.scheduledPowerLimitDataPoints_Adjusted);
  setScheduledPowerLimitData_External(chart, pvPowerData.scheduledPowerLimitDataPoints_Adjusted);
  setScheduledPowerLimitData_Manual(chart, pvPowerData.scheduledPowerLimitDataPoints_Adjusted);
}

//==============================================================================
// Scheduled power limit (common for both plant and device chart)

export function addScheduledPowerLimitSeries(
  chart: Highcharts.Chart,
  showOriginalLimitData: boolean,
) {
  if (showOriginalLimitData) {
    chart.addSeries({
      id: seriesId_ScheduledPowerLimit_RequestedSet,
      name: $localize`Scheduled power limit (original)`,
      type: 'areaspline',
      color: '#B2C1CD', // powerLimitSeriesColor,
      fillColor: '#ffdb8c00', //'#ffdb8c33',
      threshold: Infinity,
      zIndex: 4,
      // states: {
      //   inactive: {
      //     enabled: false,
      //   },
      // },
      marker: {
        symbol: 'square',
        radius: 3,
        enabledThreshold: 4,
      },
    });
  }

  chart.addSeries({
    id: seriesId_ScheduledPowerLimit_RequestedSet_Adjusted,
    name: $localize`Scheduled power limit`,
    type: 'areaspline',
    color: powerLimitSeriesColor,
    fillColor: '#ffdb8c33',
    threshold: Infinity,
    zIndex: 4,
    states: {
      inactive: {
        enabled: false,
      },
    },
    marker: {
      symbol: 'square',
      radius: 3,
      enabledThreshold: 4,
    },
  });

  chart.addSeries({
    id: seriesId_ScheduledPowerLimit_RequestedSet_External,
    name: $localize`Power limit (external system)`,
    type: 'areaspline',
    color: '#000000', // Black color
    fillColor: '#00000011',
    threshold: Infinity,
    zIndex: 4,
    states: {
      inactive: {
        enabled: false,
      },
    },
    marker: {
      symbol: 'square',
      radius: 3,
      enabledThreshold: 4,
    },
  });

  chart.addSeries({
    id: seriesId_ScheduledPowerLimit_RequestedSet_Manual,
    name: $localize`Power limit (manual)`,
    type: 'areaspline',
    color: '#0063A6', // Blueish
    fillColor: '#0063A611',
    threshold: Infinity,
    zIndex: 4,
    states: {
      inactive: {
        enabled: false,
      },
    },
    marker: {
      symbol: 'square',
      radius: 3,
      enabledThreshold: 4,
    },
  });
}

export function setScheduledPowerLimitData(
  chart: Highcharts.Chart,
  scheduledPowerLimitPoints: MasterGwScheduledPowerLimitDataPoint[],
) {
  const series_ScheduledPowerLimit_RequestedSet = seriesById(
    chart,
    seriesId_ScheduledPowerLimit_RequestedSet,
  );

  series_ScheduledPowerLimit_RequestedSet?.setData(
    scheduledPowerLimitPoints.map((point) => [
      new Date(point.timestamp).getTime(),
      point.requestedPowerLimitSet,
    ]),
    false,
  );

  series_ScheduledPowerLimit_RequestedSet?.update(
    {
      type: 'areaspline',
      showInLegend: scheduledPowerLimitPoints.length > 0,
    },
    false,
  );
}

export function setScheduledPowerLimitData_Adjusted(
  chart: Highcharts.Chart,
  scheduledPowerLimitPoints_Adjusted: MasterGwScheduledPowerLimitDataPoint[],
) {
  const series_ScheduledPowerLimit_RequestedSet_Adjusted = seriesById(
    chart,
    seriesId_ScheduledPowerLimit_RequestedSet_Adjusted,
  );

  // Filter points where controlledByExternalSystem is false or null
  // and controlledManually is false or null

  const filteredPoints = scheduledPowerLimitPoints_Adjusted.filter(
    (point) => !point.controlledByExternalSystem && !point.controlledManually,
  );

  series_ScheduledPowerLimit_RequestedSet_Adjusted?.setData(
    filteredPoints.map((point) => [
      new Date(point.timestamp).getTime(),
      point.requestedPowerLimitSet,
    ]),
    false,
  );

  series_ScheduledPowerLimit_RequestedSet_Adjusted?.update(
    {
      type: 'areaspline',
      showInLegend: scheduledPowerLimitPoints_Adjusted.length > 0,
    },
    false,
  );
}

export function setScheduledPowerLimitData_External(
  chart: Highcharts.Chart,
  scheduledPowerLimitPoints_Adjusted: MasterGwScheduledPowerLimitDataPoint[],
) {
  const series_ScheduledPowerLimit_RequestedSet_External = seriesById(
    chart,
    seriesId_ScheduledPowerLimit_RequestedSet_External,
  );

  // Filter points where controlledByExternalSystem is true

  const externalSystemPoints = scheduledPowerLimitPoints_Adjusted.filter(
    (point) => point.controlledByExternalSystem === true,
  );

  series_ScheduledPowerLimit_RequestedSet_External?.setData(
    externalSystemPoints.map((point) => [
      new Date(point.timestamp).getTime(),
      point.requestedPowerLimitSet,
    ]),
    false,
  );

  series_ScheduledPowerLimit_RequestedSet_External?.update(
    {
      type: 'areaspline',
      showInLegend: externalSystemPoints.length > 0,
    },
    false,
  );
}

export function setScheduledPowerLimitData_Manual(
  chart: Highcharts.Chart,
  scheduledPowerLimitPoints_Adjusted: MasterGwScheduledPowerLimitDataPoint[],
) {
  const series_ScheduledPowerLimit_RequestedSet_Manual = seriesById(
    chart,
    seriesId_ScheduledPowerLimit_RequestedSet_Manual,
  );

  // Filter points where controlledManually is true

  const manualControlPoints = scheduledPowerLimitPoints_Adjusted.filter(
    (point) => point.controlledManually === true,
  );

  series_ScheduledPowerLimit_RequestedSet_Manual?.setData(
    manualControlPoints.map((point) => [
      new Date(point.timestamp).getTime(),
      point.requestedPowerLimitSet,
    ]),
    false,
  );

  series_ScheduledPowerLimit_RequestedSet_Manual?.update(
    {
      type: 'areaspline',
      showInLegend: manualControlPoints.length > 0,
    },
    false,
  );
}
