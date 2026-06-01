export const chartOptions: Highcharts.Options = {
  chart: {
    type: 'column',
    zooming: {
      mouseWheel: {
        enabled: false,
      },
    },
  },
  xAxis: {
    type: 'category',
    crosshair: true,
  },
  title: {
    align: 'left',
  },
  tooltip: {
    shared: true,
    outside: true,
    positioner: function (labelWidth, labelHeight, point) {
      const chart = this.chart;

      return {
        x: point.plotX + chart.plotLeft - labelWidth / 2,
        y: chart.plotTop - labelHeight - 5,
      };
    },
  },
  plotOptions: {
    column: {
      crisp: false,
      dataLabels: {
        enabled: true,
        inside: false,
      },
    },
  },
};
