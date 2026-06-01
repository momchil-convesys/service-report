import { PlantWeatherDataChartIdentifier } from '../../_data/constants';

export function initializeChartResponsiveRules(
  chart: Highcharts.Chart,
  chartIdentifier: PlantWeatherDataChartIdentifier,
) {
  const yAxisOptions: Highcharts.YAxisOptions[] = [];
  const yAxesCount = chart.yAxis.length;

  for (let i = 0; i < yAxesCount; ++i) {
    if (i === 0) {
      yAxisOptions.push({
        // leave only the first axis visible
      });
    } else {
      yAxisOptions.push({
        visible: false,
      });
    }
  }

  const responsive: Highcharts.ResponsiveOptions = {
    rules: [
      {
        condition: {
          maxWidth: 600,
        },
        chartOptions: {
          xAxis: {
            minorGridLineWidth: 0,
          },
          yAxis: yAxisOptions,
          legend: {
            enabled: chartIdentifier === PlantWeatherDataChartIdentifier.PlantOverview,
          },
        },
      },
    ],
  };

  chart.update({ responsive }, false);
}
