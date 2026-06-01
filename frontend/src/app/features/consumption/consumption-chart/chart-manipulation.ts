import { chartColors, IntegrationPeriod } from '../../../constants';
import { ConsumptionWithIntegrationPeriod } from '../../../data/models';
import { iteratorForIntegrationPeriod, shiftedIntegrationPeriod } from '../../../helpers';
import Highcharts from '../../../highcharts-global-config';

const pvConsumptionColor = chartColors[2];
const gridConsumptionColor = chartColors[1];

export const chartOptions: Highcharts.Options = {
  chart: {
    plotBorderColor: '#D4DCE3', // @border-color-base,
    spacingLeft: 200,
  },
  xAxis: {
    type: 'datetime',
    crosshair: true,
  },
  yAxis: {
    opposite: true,
    labels: {
      enabled: true,
      formatter: function () {
        return `${this.value} kWh`;
      },
    },
    title: {
      text: undefined,
    },
  },
  legend: {
    enabled: true,
  },
  tooltip: {
    shared: true,
    // positioner: function (labelWidth, labelHeight, point) {
    //   return {
    //     x: point.plotX > 0 ? point.plotX : 0,
    //     y: 0,
    //   };
    // },
    valueDecimals: 0,
    valueSuffix: ' kWh',
  },
  plotOptions: {
    column: {
      stacking: 'normal',
    },
    pie: {
      dataLabels: {
        position: 'center',
        enabled: true,
        // format: '{point.percentage:.0f} %',
        formatter: function () {
          if (this.y) {
            return Highcharts.numberFormat((this as any).point?.percentage || 0, 1) + ' %';
          }

          return '';
        },
      },
    },
  },
  series: [
    {
      type: 'column',
      name: 'Consumption from grid',
      color: gridConsumptionColor,
      data: [],
      stack: 'consumption',
      pointPlacement: 0,
    },
    {
      type: 'column',
      name: 'Consumption from PV',
      color: pvConsumptionColor,
      data: [],
      stack: 'consumption',
      pointPlacement: 0,
    },
    {
      type: 'pie',
      name: 'Total consumption',
      data: [],
      center: [-120, '50%'],
      size: 140,
      colors: [pvConsumptionColor, gridConsumptionColor],
      dataLabels: {
        enabled: true,
        distance: -30,
      },
    },
  ],
};

export function updateChartData(
  chart: Highcharts.Chart,
  data: ConsumptionWithIntegrationPeriod | undefined,
) {
  const consumptionFromGrid: Highcharts.PointOptionsType[] =
    data?.values.map((chunk) => ({
      x: chunk.timestamp.getTime(),
      y: chunk.consumptionFromGridValue,
    })) || [];

  chart.series[0].setData(consumptionFromGrid, false, false);

  const consumptionFromPv: Highcharts.PointOptionsType[] =
    data?.values.map((chunk) => ({
      x: chunk.timestamp.getTime(),
      y: chunk.consumptionFromPvValue,
    })) || [];

  chart.series[1].setData(consumptionFromPv, false, false);

  const plotBands: Highcharts.XAxisPlotBandsOptions[] = [];
  const iterator = iteratorForIntegrationPeriod(data?.integrationPeriod || IntegrationPeriod.Days);

  if (data) {
    let lastNullValue;

    for (let i = 0; i < data.values.length; ++i) {
      const value = data.values[i];

      if (value.consumptionFromGridValue === null || value.consumptionFromPvValue === null) {
        if (!lastNullValue) {
          lastNullValue = data.values[i];
        }
      } else if (lastNullValue) {
        plotBands.push(
          definePlotBand(lastNullValue.timestamp, value.timestamp, data.integrationPeriod),
        );

        lastNullValue = undefined;
      }
    }

    if (lastNullValue && data.values.length > 0) {
      plotBands.push(
        definePlotBand(
          lastNullValue.timestamp,
          iterator(data.values[data.values.length - 1].timestamp, 1),
          data.integrationPeriod,
        ),
      );
    }
  }

  chart.xAxis[0].update({
    plotBands: plotBands,
  });

  let pieChartData;

  if (data && data.values.length > 0) {
    pieChartData = [
      {
        name: 'From PV',
        y:
          data?.values
            .map((value) => value.consumptionFromPvValue)
            .reduce((prev, current) => (prev || 0) + (current || 0), 0) || 0,
      },
      {
        name: 'From grid',
        y:
          data?.values
            .map((value) => value.consumptionFromGridValue)
            .reduce((prev, current) => (prev || 0) + (current || 0), 0) || 0,
      },
    ];
  }

  chart.series[2].update({
    data: pieChartData || [],
    type: 'pie',
  });

  // TODO: request data by calculated ticks instead of range
  // if (data) {
  //   const res = integrationPeriodTicks([data.from, data.to], data.integrationPeriod);
  //   for (let i = 0; i < Math.min(res.length, data.values.length); ++i) {
  //     console.log('HERE', res[i].toISOString(), data.values[i].timestamp.toISOString());
  //   }
  // }
}

function definePlotBand(
  from: Date,
  to: Date,
  integrationPeriod: IntegrationPeriod,
): Highcharts.XAxisPlotBandsOptions {
  return {
    id: from.toISOString(),
    color: '#fafbfc', // '#f5f7f8',
    from: shiftedIntegrationPeriod(from, integrationPeriod).getTime(),
    to: shiftedIntegrationPeriod(to, integrationPeriod).getTime(),
    zIndex: 2,
  };
}
