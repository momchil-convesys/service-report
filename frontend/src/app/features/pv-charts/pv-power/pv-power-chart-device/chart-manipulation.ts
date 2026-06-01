import Highcharts from '../../../../highcharts-global-config';

import {
  chartColors,
  semanticColor_ActivePower,
  semanticColor_Irradiance,
} from '../../../../constants';
import {
  seriesById,
  undefinedOrNumber,
  updateTimeZoneSettings,
  yAxisFormatter_ScaleValue,
} from '../../../../helpers';
import { BaseChartContext } from '../../../../shared/base-chart-component/base-chart-component.component';
import { selectionEventHandler } from '../../_shared/pv-charts-column-datetime-axis';
import { seriesId_Irradiance, yAxis_Irradiance } from '../../_shared/pv-charts-common-settings';
import { PVPowerDataForDevice_NEW } from '../_data/pv-power';
import { updateDatetimeAxisRange } from '../pv-power-chart-plant/chart-datetime-axis';
import {
  addScheduledPowerLimitSeries,
  setScheduledPowerLimitData,
  setScheduledPowerLimitData_Adjusted,
  setScheduledPowerLimitData_External,
  setScheduledPowerLimitData_Manual,
} from '../pv-power-chart-plant/chart-manipulation';

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
      tickAmount: 4,
    },
    yAxis_Irradiance,
  ],
  plotOptions: {
    series: {
      dataGrouping: {
        enabled: false,
      },
      marker: { enabledThreshold: 2 },
      gapSize: 1000 * 60 * 5, // 5 min
      gapUnit: 'value',
    },
  },
  legend: {
    enabled: true,
  },
  tooltip: {
    shared: true,
    valueDecimals: 1,
    valueSuffix: ' kW',
    useHTML: false,
    positioner: function (labelWidth, labelHeight, point) {
      const chartWidth = this.chart.chartWidth;

      // If tooltip is too wide
      // allow it to be displayed over y axis labels.
      const mayOverlapYAxis =
        labelWidth > chartWidth * 0.3 && labelHeight > this.chart.chartHeight * 0.2;

      const leftAnchor = mayOverlapYAxis ? 5 : this.chart.plotLeft;
      let x = leftAnchor;
      let y = 5;

      // Show tooltip near left or right edge of the chart
      if (this.chart.plotLeft + point.plotX < chartWidth * 0.5) {
        const rightAnchor = mayOverlapYAxis
          ? chartWidth - 5
          : this.chart.plotLeft + this.chart.plotWidth;
        x = rightAnchor - labelWidth;
      }

      return { x, y };
    },
    distance: 25,
  },
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
                  return `kW`;
                },
                x: 0,
                y: -5,
              },
            },
            {},
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
  pvPowerData: PVPowerDataForDevice_NEW | undefined,
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

  const shouldRemoveSeries = !seriesById(chart, pvPowerData.deviceId);

  if (shouldRemoveSeries) {
    chart.zoomOut();

    while (chart.series.length > 0) {
      chart.series[0].remove(false);
    }

    addSeriesForDeviceChart(chart, pvPowerData);
  }

  // Set y maximum before setting data to avoid series scale animation

  chart.yAxis[0]?.update({ softMax: undefinedOrNumber(pvPowerData.maxPowerValue) }, false);

  setDataForDeviceChart(chart, pvPowerData);

  updateDatetimeAxisRange(chart, context, 0);
}

function addSeriesForDeviceChart(chart: Highcharts.Chart, pvPowerData: PVPowerDataForDevice_NEW) {
  chart.addSeries(
    {
      id: pvPowerData.deviceId,
      type: 'areaspline',
      name: $localize`Active power`,
      color: semanticColor_ActivePower,
      fillColor: semanticColor_ActivePower + '88',
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
      dataLabels: {
        enabled: false,
      },
      tooltip: {
        valueSuffix: ' W/m²',
      },
      yAxis: 1,
      color: semanticColor_Irradiance,
      fillOpacity: 0,
      zIndex: 2,
    },
    false,
  );

  const extraSeriesColors = [
    chartColors[1],
    chartColors[2],
    chartColors[3],
    chartColors[4],
    chartColors[6],
    chartColors[7],
  ];

  pvPowerData.extraSeriesLabels.forEach((label, index) => {
    chart.addSeries(
      {
        id: label,
        type: 'spline',
        name: label,
        visible: true,
        color: extraSeriesColors[index],
      },
      false,
    );
  });

  // Scheduled power limit

  addScheduledPowerLimitSeries(chart, false);
}

function setDataForDeviceChart(chart: Highcharts.Chart, pvPowerData: PVPowerDataForDevice_NEW) {
  const dataPoints = pvPowerData.dataPoints;
  const irradianceDataPoints = pvPowerData.irradianceDataPoints;

  pvPowerData.extraSeriesLabels.forEach((label, index) => {
    const seriesData: Highcharts.PointOptionsType[] =
      dataPoints.map((point) => [point.timestamp.getTime(), point.extraSeriesValues[index]]) || [];
    seriesById(chart, label)?.setData(seriesData, false, false);
  });

  const seriesDataActivePower: Highcharts.PointOptionsType[] =
    dataPoints.map((point) => [point.timestamp.getTime(), point.activePower]) || [];

  seriesById(chart, pvPowerData.deviceId)?.setData(seriesDataActivePower, false, false);

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

  // Scheduled power limit

  setScheduledPowerLimitData(chart, pvPowerData.scheduledPowerLimitDataPoints);
  setScheduledPowerLimitData_Adjusted(chart, []); // Hide series from legend
  setScheduledPowerLimitData_External(chart, []); // Hide series from legend
  setScheduledPowerLimitData_Manual(chart, []); // Hide series from legend
}
