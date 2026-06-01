export const chartOptions: Highcharts.Options = {
  chart: {
    type: 'areaspline',
  },
  title: {
    text: '',
  },
  credits: {
    enabled: false,
  },
  legend: {
    enabled: false,
  },
  xAxis: {
    type: 'datetime',
    crosshair: true,
  },
  yAxis: [
    {
      title: { text: undefined },
    },
  ],
  tooltip: {
    shared: true,
  },
  plotOptions: {
    areaspline: {
      animation: false,
    },
  },
  series: [],
};
