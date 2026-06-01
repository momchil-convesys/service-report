import Highcharts from '../../../../highcharts-global-config';

import { celsiusDegreeSymbol, semanticColor_ActivePower } from '../../../../constants';
import { InverterTemperatureSensorsData } from '../../_data/models';

import {
  updateTimeZoneSettings,
  utcToZonedTimeSafe,
  zonedTimeToUtcSafe,
} from '../../../../helpers';

export const seriesId_ActivePower = 'seriesId_ActivePower';

const temperatureExtremes = {
  min: 0,
  max: 80,
};

const activePowerExtremes = {
  min: 0,
  max: 400,
};

export const chartOptions: Highcharts.Options = {
  chart: {
    plotBorderColor: '#D4DCE3', // @border-color-base,
    zooming: {
      type: 'x',
      mouseWheel: false,
    },
    spacingTop: 18, // default is 10
    ignoreHiddenSeries: false, // keep axis always visible, even if no data
  },
  xAxis: {
    type: 'datetime',
    crosshair: true,
    zoomEnabled: true,
    minRange: 1000 * 60 * 1, // 1 minute zoom
    scrollbar: {
      enabled: true,
    },
  },
  yAxis: [
    {
      opposite: false,
      labels: {
        enabled: true,
        formatter: function () {
          return this.isFirst ? `${this.value} kW` : `${this.value}`;
        },
      },
      title: {
        text: undefined,
      },
    },
    {
      opposite: true,
      labels: {
        enabled: true,
        formatter: function () {
          return this.isFirst ? `${this.value}${celsiusDegreeSymbol}` : `${this.value}`;
        },
      },
      title: {
        text: undefined,
      },
    },
  ],
  plotOptions: {
    series: {
      dataGrouping: {
        enabled: true,
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
    // split: true,
    // shape: 'rect',
    // headerShape: 'rect',
    valueDecimals: 1,
    outside: true, // do not crop shadow
    // shadow: false,
    // borderWidth: 1,
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
  },
  series: [],
};

export function updateChartData(
  chart: Highcharts.Chart,
  data: InverterTemperatureSensorsData | undefined,
) {
  updateTimeZoneSettings(chart, data?.timeZone, false);

  if (!data || data.dataPoints.length === 0) {
    addSeriesIfNeeded(chart, data);

    chart.series.forEach((series) => series.setData([], false, false));

    chart.yAxis[1].update(temperatureExtremes);
    chart.yAxis[0].update(activePowerExtremes);

    updateDatetimeAxisRange(chart, chart.xAxis[0], data);

    return;
  }

  addSeriesIfNeeded(chart, data);

  setActivePowerData(chart, data);
  setTemperaturesData(chart, data);

  chart.redraw();

  // This should be done after setting series data,
  // else chart is zoomed according to provided series data
  updateDatetimeAxisRange(chart, chart.xAxis[0], data);
}

function addSeriesIfNeeded(
  chart: Highcharts.Chart,
  data: InverterTemperatureSensorsData | undefined,
) {
  // +1 for active power parameter
  const expectedSeriesCount = (data?.sensorLabels.length || 0) + 1;
  if (chart.series.length !== expectedSeriesCount) {
    while (chart.series.length > 0) {
      chart.series[0].remove(false);
    }

    data?.sensorLabels.forEach((label) => {
      chart.addSeries({
        name: label,
        type: 'line',
        yAxis: 1,
        tooltip: {
          valueDecimals: 1,
          valueSuffix: celsiusDegreeSymbol,
        },
        zIndex: 1,
      });
    });

    chart.addSeries({
      id: seriesId_ActivePower,
      name: $localize`Active power`,
      type: 'area',
      color: semanticColor_ActivePower,
      fillColor: semanticColor_ActivePower + '88',
      tooltip: {
        valueDecimals: 1,
        valueSuffix: ' kW',
      },
      yAxis: 0,
    });
  }
}

function updateDatetimeAxisRange(
  chart: Highcharts.Chart,
  axis: Highcharts.Axis,
  data: InverterTemperatureSensorsData | undefined,
) {
  let newMinDate = utcToZonedTimeSafe(data?.targetRange.from || new Date(), data?.timeZone);
  let newMaxDate = utcToZonedTimeSafe(data?.targetRange.to || new Date(), data?.timeZone);

  const newMin = zonedTimeToUtcSafe(newMinDate, chart.options.time?.timezone).getTime();
  const newMax = zonedTimeToUtcSafe(newMaxDate, chart.options.time?.timezone).getTime();

  axis.update(
    {
      min: data ? newMin : undefined,
      max: data ? newMax : undefined,
    },
    false,
  );

  chart.zoomOut();
}

function setActivePowerData(chart: Highcharts.Chart, data: InverterTemperatureSensorsData) {
  let min = activePowerExtremes.min;
  let max = activePowerExtremes.max;

  const activePowerSeriesData: Array<Highcharts.PointOptionsType[]> =
    data.activePowerDataPoints?.map((point) => {
      if (point.value !== null && point.value > max) {
        max = point.value;
      }

      return [point.timestamp.getTime(), point.value];
    }) || [];

  const series = chart.series.find((s) => seriesId_ActivePower === s.options.id);
  series?.setData(activePowerSeriesData, false, false);

  chart.yAxis[0].update({ min, max });
}

function setTemperaturesData(chart: Highcharts.Chart, data: InverterTemperatureSensorsData) {
  const seriesData: Array<Highcharts.PointOptionsType[]> = data.sensorLabels.map(() => []);
  let min: number = 1000;
  let max: number = -1000;

  data.dataPoints.map((point) => {
    const timestamp = point.timestamp.getTime();

    point.values.map((value, index) => {
      seriesData[index].push([timestamp, value]);

      // Set extremes according to data
      if (value !== null && !isNaN(value)) {
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
    });
  });

  min = Math.min(min, temperatureExtremes.min);
  max = Math.max(max, temperatureExtremes.max);

  // index + 1 as first series is active power
  seriesData.forEach((data, index) => chart.series[index].setData(data, false, false));

  chart.yAxis[1].update({ min, max });
}
