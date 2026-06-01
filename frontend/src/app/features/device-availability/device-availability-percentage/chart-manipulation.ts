import {
  DeviceState,
  deviceStateColors,
  deviceStateColorsLight,
  deviceStateFullLabels,
  deviceStateStringValuesReversed,
} from '../../../constants';
import Highcharts from '../../../highcharts-global-config';
import { DevicesAvailability } from '../_data/models';

export const chartOptions: Highcharts.Options = {
  chart: {
    type: 'bar',
    zooming: {
      type: 'y',
      mouseWheel: false,
      resetButton: {
        position: {
          align: 'right',
          y: -36,
          x: 0,
        },
        theme: {
          zIndex: 8,
        },
      },
    },
    spacingBottom: 0,
  },
  xAxis: {
    categories: [],
    title: {
      text: null,
    },
    labels: {
      enabled: true,
    },
  },
  yAxis: {
    title: {
      text: undefined,
    },
    labels: {
      format: '{text}%',
    },
    min: 0,
    max: 100,
    opposite: true,
    scrollbar: {
      enabled: true,
      margin: 30,
    },
  },
  legend: {
    // TODO:
    // if legend is present,
    // then states should be filtered according to available states for device
    enabled: false,
  },
  tooltip: {
    valueDecimals: 2,
    valueSuffix: '%',
  },
  plotOptions: {
    bar: {
      pointWidth: 17,
      borderRadius: 0,
      stacking: 'percent',
    },
  },
  series: [],
};

export function updateChartData(chart: Highcharts.Chart, data: DevicesAvailability | undefined) {
  if (!data || data.values.length === 0) {
    chart.series.forEach((series) => series.setData([], false, false));
    return;
  }

  addSeriesIfNeeded(chart, data);

  const noDataSeriesValue: Highcharts.SeriesOptionsType = {
    type: 'bar',
    data: data.values.map(
      (deviceData) => (deviceData.durationByState['no-data'] / deviceData.fullDurationMs) * 100,
    ),
  };

  chart.series[0].update(noDataSeriesValue, false);

  deviceStateStringValuesReversed.forEach((deviceState, index) => {
    const seriesValue: Highcharts.SeriesOptionsType = {
      type: 'bar',
      data: data.values.map(
        (deviceData) =>
          (deviceData.durationByState[<DeviceState>deviceState] / deviceData.fullDurationMs) * 100,
      ),
    };

    chart.series[index + 1].update(seriesValue, false); // index + 1 because first index is for 'no-data'
  });
}

export function setCategories(chart: Highcharts.Chart, categories: string[]) {
  chart.xAxis[0].setCategories(categories, false);
  chart.xAxis[0].update({ min: 0, max: categories.length - 1 });
}

function addSeriesIfNeeded(chart: Highcharts.Chart, data: DevicesAvailability) {
  while (chart.series.length > 0) {
    chart.series[0].remove(false);
  }

  chart.addSeries({
    type: 'bar',
    name: 'No data',
    color: '#EDF0F3',
    // borderColor: '#D4DCE3',
    pointWidth: 1,
    states: {
      hover: {
        color: 'white',
        borderColor: '#EDF0F3',
        brightness: 1,
        opacity: 1,
      },
    },
    data: [],
    showInLegend: false,
  });

  deviceStateStringValuesReversed.forEach((deviceState: string) => {
    chart.addSeries({
      type: 'bar',
      name: deviceStateFullLabels[<DeviceState>deviceState],
      color: deviceStateColorsLight[<DeviceState>deviceState],
      states: {
        hover: {
          color: deviceStateColors[<DeviceState>deviceState],
          brightness: 1,
          opacity: 1,
        },
        select: {
          color: deviceStateColors[<DeviceState>deviceState],
        },
      },
      data: [],
    });
  });
}
