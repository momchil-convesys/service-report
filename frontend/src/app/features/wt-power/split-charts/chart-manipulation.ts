import { chartColors } from '../../../constants';
import { WTCombinedChartData } from '../../../data/models';
import Highcharts from '../../../highcharts-global-config';

// declare module 'highcharts/highcharts' {
//   interface Point {
//     highlight(event: Highcharts.PointerEventObject): void;
//   }
// }
// Highcharts.Point.prototype.highlight = function (event: any): void {
//   event = this.series.chart.pointer.normalize(event);
//   this.onMouseOver(event);
//   this.series.chart.tooltip.refresh(this);
//   this.series.chart.xAxis[0].drawCrosshair(event, this);
// };

const commonChartOptions: Highcharts.Options = {
  time: { timezoneOffset: -2 * 60 },
  chart: {
    className: 'wt-synced-chart',
    plotBorderColor: '#EDF0F3', // @border-color-split,
    plotBorderWidth: 0,
    zooming: {
      type: 'x',
      mouseWheel: false,
    },
    marginLeft: 100, // Keep all charts left aligned
    marginRight: 300, // Keep all charts right aligned
    // spacingTop: 0,
    spacingBottom: 5,
    borderWidth: 0,
    borderColor: '#EDF0F3', // @border-color-split,
  },
  scrollbar: {
    enabled: true,
  },
  // navigator: {
  //   enabled: true,
  // },
  rangeSelector: {
    enabled: true,
    inputEnabled: false,
    floating: true,
    buttonPosition: {
      align: 'right',
      y: -35,
    },
    buttons: [
      {
        type: 'all',
        text: 'All',
      },
    ],
  },
  title: {
    align: 'left',
    x: 90,
    y: 20,
  },
  tooltip: {
    shared: true,
    valueDecimals: 2,
    // split: true,
    // animation: false,
    // useHTML: true,
  },
  xAxis: {
    type: 'datetime',
    crosshair: true,
    zoomEnabled: true,
    events: {
      // setExtremes: syncExtremes,
    },
    lineColor: '#99acbd',
  },
  yAxis: {
    opposite: true,
    title: {
      text: undefined,
    },
  },
  legend: {
    enabled: true,
    margin: -10,
  },
  plotOptions: {
    series: {
      dataGrouping: {
        enabled: true,
      },
      marker: { enabledThreshold: 5 },
    },
  },
};

export const chart1Options: Highcharts.Options = {
  ...commonChartOptions,
  title: {
    ...commonChartOptions.title,
    text: 'Voltage Line phase to phase',
  },
  yAxis: {
    ...commonChartOptions.yAxis,
    title: {
      text: 'Voltage',
      style: {
        color: chartColors[0],
      },
    },
    labels: {
      format: '{value} V',
      style: {
        color: chartColors[0],
      },
    },
  },
  tooltip: {
    ...commonChartOptions.tooltip,
    valueSuffix: ' V',
  },
  series: [
    {
      type: 'spline',
      name: 'V1 Line phase-to-phase',
      showInNavigator: true,
      // color: chartColors[3],
      marker: { symbol: 'circle' },
    },
    {
      type: 'spline',
      name: 'V2 Line phase-to-phase',
      showInNavigator: true,
      // color: chartColors[3],
      marker: { symbol: 'square' },
    },
    {
      type: 'spline',
      name: 'V3 Line phase-to-phase',
      showInNavigator: true,
      // color: chartColors[3],
      marker: { symbol: 'triangle' },
    },
  ],
};

export const chart2Options: Highcharts.Options = {
  ...commonChartOptions,
  title: {
    ...commonChartOptions.title,
    text: 'Voltage MSC',
  },
  yAxis: {
    ...commonChartOptions.yAxis,
    title: {
      text: 'Voltage',
      style: {
        color: chartColors[0],
      },
    },
    labels: {
      format: '{value} V',
      style: {
        color: chartColors[0],
      },
    },
  },
  tooltip: {
    ...commonChartOptions.tooltip,
    valueSuffix: ' V',
  },
  series: [
    {
      type: 'spline',
      name: 'V1 MSC',
      showInNavigator: true,
      color: chartColors[0],
      marker: { symbol: 'circle' },
    },
    {
      type: 'spline',
      name: 'V2 MSC',
      showInNavigator: true,
      color: chartColors[6],
      marker: { symbol: 'square' },
    },
    {
      type: 'spline',
      name: 'V3 MSC',
      showInNavigator: true,
      color: chartColors[7],
      marker: { symbol: 'triangle' },
    },
  ],
};

export const chart3Options: Highcharts.Options = {
  ...commonChartOptions,
  title: {
    ...commonChartOptions.title,
    text: 'Current MSC',
  },
  yAxis: {
    ...commonChartOptions.yAxis,
    title: {
      text: 'Current',
      style: {
        color: chartColors[5],
      },
    },
    labels: {
      format: '{value} A',
      style: {
        color: chartColors[5],
      },
    },
  },
  tooltip: {
    ...commonChartOptions.tooltip,
    valueSuffix: ' A',
  },
  series: [
    {
      type: 'spline',
      name: 'I1 MSC',
      showInNavigator: true,
      color: chartColors[3],
      marker: { symbol: 'circle' },
    },
    {
      type: 'spline',
      name: 'I2 MSC',
      showInNavigator: true,
      color: chartColors[4],
      marker: { symbol: 'square' },
    },
    {
      type: 'spline',
      name: 'I3 MSC',
      showInNavigator: true,
      color: chartColors[5],
      marker: { symbol: 'triangle' },
    },
  ],
};

export const chart4Options: Highcharts.Options = {
  ...commonChartOptions,
  title: {
    ...commonChartOptions.title,
    text: 'Speed',
  },
  yAxis: {
    ...commonChartOptions.yAxis,
    labels: {
      enabled: true,
      formatter: function () {
        return `${this.value} RPM`;
      },
    },
  },
  tooltip: {
    ...commonChartOptions.tooltip,
    valueSuffix: ' RPM',
  },
  series: [
    {
      type: 'spline',
      name: 'Speed',
      showInNavigator: true,
      color: chartColors[7],
    },
  ],
};

export function updateChartsData(
  chart1: Highcharts.Chart,
  chart2: Highcharts.Chart,
  chart3: Highcharts.Chart,
  chart4: Highcharts.Chart,
  chartData: WTCombinedChartData | undefined,
) {
  // chart1.xAxis[0].setExtremes(undefined, undefined);
  chart1.zoomOut();
  chart2.zoomOut();
  chart3.zoomOut();
  chart4.zoomOut();

  if (!chartData || !chartData.data || chartData.data.length === 0) {
    chart1.series.map((series) => series.setData([], false, false));
    chart2.series.map((series) => series.setData([], false, false));
    chart3.series.map((series) => series.setData([], false, false));
    chart4.series.map((series) => series.setData([], false, false));
    return;
  }

  chartData.data.forEach((dataForDevice, index) => {
    chart1.series[0].setData(
      dataForDevice.data.map((point) => [
        new Date(point.timestamp).getTime(),
        point.v1_Line_phase_to_phase,
      ]),
      false,
      false,
    );
    chart1.series[1].setData(
      dataForDevice.data.map((point) => [
        new Date(point.timestamp).getTime(),
        point.v2_Line_phase_to_phase,
      ]),
      false,
      false,
    );
    chart1.series[2].setData(
      dataForDevice.data.map((point) => [
        new Date(point.timestamp).getTime(),
        point.v3_Line_phase_to_phase,
      ]),
      false,
      false,
    );

    chart2.series[0].setData(
      dataForDevice.data.map((point) => [new Date(point.timestamp).getTime(), point.v1_MSC]),
      false,
      false,
    );
    chart2.series[1].setData(
      dataForDevice.data.map((point) => [new Date(point.timestamp).getTime(), point.v2_MSC]),
      false,
      false,
    );
    chart2.series[2].setData(
      dataForDevice.data.map((point) => [new Date(point.timestamp).getTime(), point.v3_MSC]),
      false,
      false,
    );

    chart3.series[0].setData(
      dataForDevice.data.map((point) => [new Date(point.timestamp).getTime(), point.i1_MSC]),
      false,
      false,
    );
    chart3.series[1].setData(
      dataForDevice.data.map((point) => [new Date(point.timestamp).getTime(), point.i2_MSC]),
      false,
      false,
    );
    chart3.series[2].setData(
      dataForDevice.data.map((point) => [new Date(point.timestamp).getTime(), point.i3_MSC]),
      false,
      false,
    );

    // chart4.series[0].setData(
    //   dataForDevice.data.map((point) => [
    //     new Date(point.timestamp).getTime(),
    //     point.speedGenerator,
    //   ]),
    //   false,
    //   false
    // );
  });
}
