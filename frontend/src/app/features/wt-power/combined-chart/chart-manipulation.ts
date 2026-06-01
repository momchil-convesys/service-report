import { chartColors } from '../../../constants';
import { WTCombinedChartDataPointDTO } from '../../../data/dtos';
import { WTCombinedChartData } from '../../../data/models';
import Highcharts from '../../../highcharts-global-config';

export const chartOptions: Highcharts.Options = {
  time: { timezoneOffset: -2 * 60 },
  chart: {
    className: 'wt-synced-chart',
    plotBorderColor: '#EDF0F3', // @border-color-split,
    plotBorderWidth: 0,
    backgroundColor: 'white',
    zooming: {
      type: 'x',
      mouseWheel: false,
    },
    marginLeft: 100, // Keep all charts left aligned
    marginRight: 300, // Keep all charts right aligned
    // spacingTop: 0,
    // spacingBottom: 5,
    borderWidth: 0,
    borderColor: '#EDF0F3', // @border-color-split,
  },
  scrollbar: {
    enabled: true,
  },
  navigator: {
    enabled: true,
    series: {
      className: 'navigator-series',
      dataGrouping: {
        enabled: true,
      },
      lineWidth: 1,
      marker: {
        enabled: false,
      },
    },
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
        type: 'all',
        text: 'All',
      },
    ],
  },
  tooltip: {
    shared: true,
    valueDecimals: 1,
    // split: true,
    // outside: true,
    // positioner: function (labelWidth, labelHeight, point) {
    //   return {
    //     x: point.plotX + labelWidth,
    //     y: -1 * labelHeight + 30,
    //   };
    // },
  },
  xAxis: {
    type: 'datetime',
    crosshair: true,
    zoomEnabled: true,
    lineColor: '#99acbd',
  },
  yAxis: [
    {
      labels: {
        format: '{value} kW',
        style: {
          // color: '#FFE200',
        },
      },
      title: {
        text: 'Power Grid',
        style: {
          // color: '#FFE200',
        },
      },
      opposite: false,
    },
    {
      // gridLineWidth: 0,
      title: {
        text: 'Speed',
        style: {
          color: chartColors[1],
        },
      },
      labels: {
        format: '{value} RPM',
        style: {
          color: chartColors[1],
        },
      },
      opposite: true,
    },
    {
      // gridLineWidth: 0,
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
      opposite: true,
    },
    {
      // gridLineWidth: 0,
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
      opposite: true,
    },
  ],
  series: [
    {
      name: 'Power Grid',
      type: 'areaspline',
      yAxis: 0,
      data: [],
      tooltip: {
        valueSuffix: ' kW',
      },
      color: chartColors[8],
      fillOpacity: 0.3,
      // threshold: 0
    },
    {
      name: 'Speed',
      type: 'spline',
      yAxis: 1,
      data: [],
      tooltip: {
        valueSuffix: ' RPM',
      },
      // threshold: 0
      color: chartColors[1],
    },
    {
      name: 'V LSC (Grid)',
      type: 'spline',
      yAxis: 2,
      data: [],
      tooltip: {
        valueSuffix: ' V',
      },
      // threshold: 0
      visible: false,
      color: chartColors[0],
    },
    {
      name: 'I LSC (Grid)',
      type: 'spline',
      yAxis: 3,
      data: [],
      tooltip: {
        valueSuffix: ' A',
      },
      // threshold: 0
      visible: false,
      color: chartColors[3],
    },
    {
      name: 'V1 Line phase-to-phase',
      type: 'spline',
      yAxis: 2,
      data: [],
      tooltip: {
        valueSuffix: ' V',
      },
      visible: false,
      marker: { symbol: 'circle' },
    },
    {
      name: 'V2 Line phase-to-phase',
      type: 'spline',
      yAxis: 2,
      data: [],
      tooltip: {
        valueSuffix: ' V',
      },
      visible: false,
      marker: { symbol: 'square' },
    },
    {
      name: 'V3 Line phase-to-phase',
      type: 'spline',
      yAxis: 2,
      data: [],
      tooltip: {
        valueSuffix: ' V',
      },
      visible: false,
      marker: { symbol: 'triangle' },
    },
    {
      name: 'I Stator',
      type: 'spline',
      yAxis: 3,
      data: [],
      tooltip: {
        valueSuffix: ' A',
      },
      color: chartColors[5],
      marker: { symbol: 'diamond' },
      visible: false,
    },
    {
      name: 'V1 MSC',
      type: 'spline',
      yAxis: 2,
      data: [],
      tooltip: {
        valueSuffix: ' V',
      },
      visible: false,
      color: chartColors[0],
      marker: { symbol: 'circle' },
    },
    {
      name: 'V2 MSC',
      type: 'spline',
      yAxis: 2,
      data: [],
      tooltip: {
        valueSuffix: ' V',
      },
      visible: false,
      color: chartColors[6],
      marker: { symbol: 'square' },
    },
    {
      name: 'V3 MSC',
      type: 'spline',
      yAxis: 2,
      data: [],
      tooltip: {
        valueSuffix: ' V',
      },
      visible: false,
      color: chartColors[7],
      marker: { symbol: 'triangle' },
    },

    {
      name: 'I1 MSC',
      type: 'spline',
      yAxis: 3,
      data: [],
      tooltip: {
        valueSuffix: ' A',
      },
      visible: false,
      color: chartColors[3],
      marker: { symbol: 'circle' },
    },
    {
      name: 'I2 MSC',
      type: 'spline',
      yAxis: 3,
      data: [],
      tooltip: {
        valueSuffix: ' A',
      },
      visible: false,
      color: chartColors[4],
      marker: { symbol: 'square' },
    },
    {
      name: 'I3 MSC',
      type: 'spline',
      yAxis: 3,
      data: [],
      tooltip: {
        valueSuffix: ' A',
      },
      visible: false,
      color: chartColors[5],
      marker: { symbol: 'triangle' },
    },
  ],
  legend: {
    enabled: true,
    // margin: -10,
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

export function updateChartData(
  chart: Highcharts.Chart,
  chartData: WTCombinedChartData | undefined,
) {
  chart.zoomOut();

  if (!chartData || !chartData.data || chartData.data.length === 0) {
    chart.series.map((series) => series.setData([], false, false));
    return;
  }

  chartData.data.map((dataForDevice) => {
    chart.series.map((series, index) => {
      chart.series[index].setData(
        dataForDevice.data.map((point) => [
          new Date(point.timestamp).getTime(),
          dataPointValueForSeriesIndex(index, point),
        ]),
        false,
        false,
      );
    });
  });
}

function dataPointValueForSeriesIndex(
  index: number,
  point: WTCombinedChartDataPointDTO,
): number | null {
  switch (index) {
    case 0:
      return point.powerGrid;
    case 1:
      return point.speed;
    case 2:
      return point.v_LSC_Grid;
    case 3:
      return point.i_LSC_Grid;
    case 4:
      return point.v1_Line_phase_to_phase;
    case 5:
      return point.v2_Line_phase_to_phase;
    case 6:
      return point.v3_Line_phase_to_phase;
    case 7:
      return point.i_Stator;
    case 8:
      return point.v1_MSC;
    case 9:
      return point.v2_MSC;
    case 10:
      return point.v3_MSC;
    case 11:
      return point.i1_MSC;
    case 12:
      return point.i2_MSC;
    case 13:
      return point.i3_MSC;
  }

  return null;
}
