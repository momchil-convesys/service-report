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
    text: 'Consumption',
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
      name: 'Total consumption',
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
  const total = data.accumulatedData?.consumption?.total;

  const seriesData_Accumulated: Highcharts.PointOptionsType[] = [
    {
      name: 'Total',
      y: 0,
      color: chartColors[0],
      custom: {
        totalConsumption: total,
      },
      dataLabels: {
        enabled: true,
        alignTo: undefined,
        distance: -(pieSize / 2),
        useHTML: true,
        style: {
          textAlign: 'center',
        },
        formatter: function (ctx) {
          const formatted = formatEnergyValue(
            ((this as any).point as any).custom?.totalConsumption,
            1,
            undefined,
          );
          return `<span style="font-size: 18px">${formatted.valueAsString}<br>${formatted.unit}</span>`;
        },
      },
    },
    {
      name: 'From grid',
      y: data.accumulatedData?.consumption?.fromGrid,
      color: chartColors[4], // from grid
      custom: {
        percentage: ((data.accumulatedData?.consumption?.fromGrid || 0) / (total || 0)) * 100,
      },
      dataLabels: [
        {
          useHTML: true,
          alignTo: 'connectors',
          formatter: function (ctx) {
            return dataLabelsFormatter((this as any).point, SourceString.FromGrid);
          },
          padding: 0,
          enabled: true,
          distance: 20,
        },
      ],
    },
    {
      name: 'From batteries',
      y: data.accumulatedData?.consumption?.fromBatteries,
      color: chartColors[6], // from grid
      custom: {
        percentage: ((data.accumulatedData?.consumption?.fromBatteries || 0) / (total || 0)) * 100,
      },
      dataLabels: [
        {
          useHTML: true,
          alignTo: 'connectors',
          formatter: function (ctx) {
            return dataLabelsFormatter((this as any).point, SourceString.FromBatteries);
          },
          padding: 0,
          enabled: true,
          distance: 20,
        },
      ],
    },
  ];
  seriesById(chart, seriesId_PieChart)?.setData(seriesData_Accumulated, false, false);
}
