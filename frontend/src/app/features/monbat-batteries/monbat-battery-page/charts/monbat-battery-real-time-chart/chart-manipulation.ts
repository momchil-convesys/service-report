import { chartColors, ONE_MINUTE } from '../../../../../constants';
import { seriesById, updateTimeZoneSettings } from '../../../../../helpers';
import Highcharts from '../../../../../highcharts-global-config';
import {
  MonbatBatteryHistoricalData,
  MonbatBatteryHistoricalDataPoint,
} from '../../../_data/models';
import { seriesId_ElectricCurrent, seriesOptions_ElectricCurrent } from '../charts-series-current';
import { seriesId_SOC } from '../charts-series-soc';
import { seriesId_Temperature, seriesOptions_Temperature } from '../charts-series-temperature';
import { seriesId_Voltage, seriesOptions_Voltage } from '../charts-series-voltage';
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
    liveRedraw: true,
  },
  navigator: {
    enabled: true,
    adaptToUpdatedData: true,
    // stickToMax: true,
    handles: {
      enabled: true,
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
        count: 1,
        type: 'minute',
        text: '1M',
      },
      {
        count: 5,
        type: 'minute',
        text: '5M',
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
    endOnTick: false,
    startOnTick: false,
    minRange: ONE_MINUTE,
    minPadding: 0,
    maxPadding: 0,
    // events: {
    //   afterSetExtremes: function () {
    //     updateYAxisExtremes(this.chart, true);
    //   },
    // },
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
      // marker: {
      //   enabled: true,
      //   enabledThreshold: 2,
      // },
      turboThreshold: 0,
      // dataGrouping: {
      // enabled: true,
      // },
      // showInNavigator: true,
      gapSize: 1000 * 60 * 10, // 10 min
      gapUnit: 'value',
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
  seriesById(chart, seriesId_Voltage)?.setData(voltagePoints, false);

  const temperaturePoints: Highcharts.PointOptionsType[] = points.map((point) => [
    new Date(point.timestamp).getTime(),
    point.temperature,
  ]);
  seriesById(chart, seriesId_Temperature)?.setData(temperaturePoints, false);

  const socPoints: Highcharts.PointOptionsType[] = points.map((point) => [
    new Date(point.timestamp).getTime(),
    point.soc,
  ]);
  seriesById(chart, seriesId_SOC)?.setData(socPoints, false);

  const electricCurrentPoints: Highcharts.PointOptionsType[] = points.map((point) => [
    new Date(point.timestamp).getTime(),
    point.electricCurrent,
  ]);
  seriesById(chart, seriesId_ElectricCurrent)?.setData(electricCurrentPoints, false);

  // We need to redraw here, so the extremes are set correctly
  chart.redraw(false);

  updateYAxisExtremes(chart, false);
}

// export function appendChartData(chart: Highcharts.Chart, data: BatteryHistoricalData | undefined) {
//   if (!data) {
//     chart.series.forEach((series) => series.setData([]));
//     chart.zoomOut();
//     return;
//   }

//   const points: MonbatBatteryHistoricalDataPoint[] = data.dataPoints || [];

//   const voltagePoints: Highcharts.PointOptionsType[] = points.map((point) => [
//     new Date(point.timestamp).getTime(),
//     point.voltage,
//   ]);
//   voltagePoints.forEach((p) => seriesById(chart, seriesId_Voltage)?.addPoint(p, false));

//   const temperaturePoints: Highcharts.PointOptionsType[] = points.map((point) => [
//     new Date(point.timestamp).getTime(),
//     point.temperature,
//   ]);
//   temperaturePoints.forEach((p) => seriesById(chart, seriesId_Temperature)?.addPoint(p, false));

//   const socPoints: Highcharts.PointOptionsType[] = points.map((point) => [
//     new Date(point.timestamp).getTime(),
//     point.soc,
//   ]);
//   socPoints.forEach((p) => seriesById(chart, seriesId_SOC)?.addPoint(p, false));

//   const electricCurrentPoints: Highcharts.PointOptionsType[] = points.map((point) => ({
//     x: new Date(point.timestamp).getTime(),
//     y: point.electricCurrent,
//   }));
//   electricCurrentPoints.forEach((p) =>
//     seriesById(chart, seriesId_ElectricCurrent)?.addPoint(p, false)
//   );
// }
