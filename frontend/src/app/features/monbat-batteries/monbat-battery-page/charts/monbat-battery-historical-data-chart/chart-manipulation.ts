import { chartColors } from '../../../../../constants';
import Highcharts from '../../../../../highcharts-global-config';

import { seriesById, updateTimeZoneSettings } from '../../../../../helpers';
import {
  MonbatBatteryHistoricalData,
  MonbatBatteryHistoricalDataPoint,
} from '../../../_data/models';
import { seriesId_ElectricCurrent, seriesOptions_ElectricCurrent } from '../charts-series-current';
import { seriesId_SOC } from '../charts-series-soc';
import {
  seriesId_Temperature,
  seriesId_Temperature_Navigator,
  seriesOptions_Temperature,
} from '../charts-series-temperature';
import {
  seriesId_Voltage,
  seriesId_Voltage_Navigator,
  seriesOptions_Voltage,
  seriesOptions_Voltage_Navigator,
} from '../charts-series-voltage';
import { updateYAxisExtremes } from '../y-axis-extremes';

export const chartOptions: Highcharts.Options = {
  chart: {
    plotBorderWidth: 1,
    borderWidth: 0,
    zooming: {
      type: 'x',
      mouseWheel: false,
    },
    alignTicks: true,
    marginLeft: 100, // Reserve space for electric current axis
  },
  scrollbar: {
    enabled: true,
    liveRedraw: false,
  },
  navigator: {
    enabled: true,
    adaptToUpdatedData: false,
    series: [seriesOptions_Voltage_Navigator],
  },
  rangeSelector: {
    enabled: true,
    inputEnabled: false,
    // floating: true,
    // buttonPosition: {
    //   align: 'right',
    //   y: -35,
    // },
    buttons: [
      {
        count: 15,
        type: 'minute',
        text: '15M',
      },
      {
        count: 1,
        type: 'hour',
        text: '1H',
      },
      {
        type: 'all',
        text: 'All',
      },
    ],
  },
  navigation: {
    buttonOptions: {
      verticalAlign: 'top',
      y: -4,
    },
  },
  xAxis: {
    type: 'datetime',
    crosshair: true,
    ordinal: false,
    // xAsix events are handled in component
    // events: {},
    minRange: 1000 * 60 * 1, // 1 minute zoom
  },
  yAxis: [
    {
      minTickInterval: 0.01,
      gridLineWidth: 1,
      title: {
        // text: 'Voltage',
        text: undefined,
        style: {
          color: chartColors[0],
        },
      },
      labels: {
        format: '{value:.3f} V',
        style: {
          color: chartColors[0],
        },
        reserveSpace: true,
      },
      opposite: true,
      showEmpty: true,
      // tickPositioner: yAxisTickPositioner,
      // plotLines: [yAxisZeroLine],
    },
    {
      minTickInterval: 0.01,
      gridLineWidth: 1,
      title: {
        // text: 'Temperature',
        text: undefined,
        style: {
          color: chartColors[3],
        },
      },
      labels: {
        format: '{value:.2f}°C',
        style: {
          color: chartColors[3],
        },
        reserveSpace: true,
      },
      opposite: true,
      // min: 0,
      // max: 80,
      showEmpty: true,
      // tickPositioner: yAxisTickPositioner,
      // plotLines: [yAxisZeroLine],
    },
    {
      minTickInterval: 0.01,
      gridLineWidth: 1,
      title: {
        // text: 'SoC',
        text: undefined,
        style: {
          color: chartColors[6],
        },
      },
      labels: {
        format: '{value:.2f}%',
        style: {
          color: chartColors[6],
        },
        reserveSpace: true,
      },
      opposite: true,
      showEmpty: true,
      // tickPositioner: yAxisTickPositioner,
      // plotLines: [yAxisZeroLine],
    },
    {
      minTickInterval: 0.01,
      gridLineWidth: 1,
      title: {
        // text: 'Current',
        text: undefined,
        style: {
          color: chartColors[5],
        },
      },
      labels: {
        format: '{value:.2f} A',
        style: {
          color: chartColors[5],
        },
        reserveSpace: true,
      },
      opposite: false,
      showEmpty: true,
      // tickPositioner: yAxisTickPositioner,
      // plotLines: [yAxisZeroLine],
    },
  ],
  legend: {
    enabled: true,
  },
  tooltip: {
    shared: true,
    // split: true,
  },
  plotOptions: {
    series: {
      dataGrouping: {
        enabled: true,
      },
      showInNavigator: false,
      // marker: { enabledThreshold: 2 },
      gapSize: 1000 * 60 * 10, // 10 min
      gapUnit: 'value',
      events: {
        hide: function () {
          updateYAxisExtremes(this.chart);
        },
        show: function () {
          updateYAxisExtremes(this.chart);
        },
      },
    },
  },
  series: [
    seriesOptions_Voltage,
    seriesOptions_Temperature,
    // seriesOptions_SOC,
    seriesOptions_ElectricCurrent,
  ],
};

export function updateChartData(
  chart: Highcharts.Chart,
  data: MonbatBatteryHistoricalData | undefined,
  sameTimeRange: boolean,
) {
  if (!data) {
    chart.series.forEach((series) => series.setData([]));
    chart.zoomOut();
    return;
  }

  updateTimeZoneSettings(chart, data.timeZone, false);

  const points: MonbatBatteryHistoricalDataPoint[] = data.dataPoints || [];

  const voltagePoints: Highcharts.PointOptionsType[] = points.map((point) => [
    new Date(point.timestamp).getTime(),
    point.voltage,
  ]);
  seriesById(chart, seriesId_Voltage)?.setData(voltagePoints, false, false);

  const temperaturePoints: Highcharts.PointOptionsType[] = points.map((point) => [
    new Date(point.timestamp).getTime(),
    point.temperature,
  ]);
  seriesById(chart, seriesId_Temperature)?.setData(temperaturePoints, false, false);

  const socPoints: Highcharts.PointOptionsType[] = points.map((point) => [
    new Date(point.timestamp).getTime(),
    point.soc,
  ]);
  seriesById(chart, seriesId_SOC)?.setData(socPoints, false, false);

  const electricCurrentPoints: Highcharts.PointOptionsType[] = points.map((point) => [
    new Date(point.timestamp).getTime(),
    point.electricCurrent,
  ]);
  seriesById(chart, seriesId_ElectricCurrent)?.setData(electricCurrentPoints, false, false);

  // Do not update navigator on zoom with async data
  if (!sameTimeRange) {
    // Navigator series
    seriesById(chart, seriesId_Voltage_Navigator)?.setData(voltagePoints, false, false);
    seriesById(chart, seriesId_Temperature_Navigator)?.setData(temperaturePoints, false, false);
  }

  // Set extremes to requested time range

  if (!sameTimeRange) {
    chart.xAxis.forEach((axis) => {
      axis.update({ min: new Date(data.from).getTime(), max: new Date(data.to).getTime() });
    });
  }

  // If time range has changed, zoom out

  if (!sameTimeRange) {
    chart.zoomOut();
  }
}
