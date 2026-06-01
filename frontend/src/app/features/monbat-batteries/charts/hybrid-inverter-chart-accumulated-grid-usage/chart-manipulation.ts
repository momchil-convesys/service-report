import { chartColors } from '../../../../constants';
import Highcharts from '../../../../highcharts-global-config';
import { HybridInverterHistoricalData } from '../../_data/models';

import { SourceString, dataLabelsFormatter, formatEnergyValue } from '../charts-value-formatters';

const pieSize = 120;

const seriesId_PieChart = 'seriesId_PieChart';

function seriesById(chart: Highcharts.Chart, seriesId: string): Highcharts.Series | undefined {
  return chart.series.find((s) => s.options.id === seriesId);
}

export const chartOptions: Highcharts.Options = {
  title: {
    text: 'Energy used from grid',
    align: 'left',
  },
  legend: {
    enabled: true,
  },
  tooltip: {
    enabled: false,
  },
  series: [
    {
      id: seriesId_PieChart,
      type: 'pie',
      name: 'Total energy used from grid',
      center: ['50%', '50%'],
      size: pieSize,
      innerSize: '80%',
      showInLegend: false,
    },
  ],
};

export function updateChartData(
  chart: Highcharts.Chart,
  data: HybridInverterHistoricalData | undefined,
) {
  if (!data || data.dataPoints.length === 0) {
    chart.series.forEach((series) => series.setData([], false, false));
    chart.zoomOut();
    return;
  }

  setData(chart, data);
}

function setData(chart: Highcharts.Chart, data: HybridInverterHistoricalData) {
  const total = data.accumulatedData?.gridOut;

  const seriesData_Accumulated: Highcharts.PointOptionsType[] = [
    {
      name: 'Total energy used from grid',
      y: 0,
      color: chartColors[0],
      custom: {
        gridOut: total,
      },
      dataLabels: {
        enabled: true,
        alignTo: undefined,
        distance: -(pieSize / 2),
        useHTML: true,
        style: {
          textAlign: 'center',
        },
        formatter: function () {
          const formatted = formatEnergyValue(
            ((this as any).point as any).custom?.gridOut,
            1,
            undefined,
          );
          return `<span style="font-size: 18px">${formatted.valueAsString}<br>${formatted.unit}</span>`;
        },
      },
    },
    {
      name: 'Direct consumption',
      y: data.accumulatedData?.consumption?.fromGrid,
      color: chartColors[4],
      custom: {
        percentage: ((data.accumulatedData?.consumption?.fromGrid || 0) / (total || 0)) * 100,
      },
      dataLabels: {
        useHTML: true,
        alignTo: 'connectors',
        formatter: function (ctx) {
          return dataLabelsFormatter((this as any).point, SourceString.DirectConsumption);
        },
        padding: 0,
        enabled: true,
        distance: 20,
      },
    },
    {
      name: 'Charging batteries',
      y: data.accumulatedData?.batteryIn?.total,
      color: chartColors[0],
      custom: {
        percentage: ((data.accumulatedData?.batteryIn?.total || 0) / (total || 0)) * 100,
      },
      dataLabels: {
        useHTML: true,
        alignTo: 'connectors',
        formatter: function (ctx) {
          return dataLabelsFormatter((this as any).point, SourceString.ChargingBatteries);
        },
        padding: 0,
        enabled: true,
        distance: 20,
      },
    },
  ];
  seriesById(chart, seriesId_PieChart)?.setData(seriesData_Accumulated, false, false);
}
