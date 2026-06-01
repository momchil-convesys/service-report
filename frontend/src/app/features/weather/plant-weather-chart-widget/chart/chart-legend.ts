import { syncedChartsLegendItemClick } from '../../../../helpers/_charts-sync';
import { PlantWeatherDataChartIdentifier } from '../../_data/constants';

export function initializeLegend(
  chart: Highcharts.Chart,
  chartIdentifier: PlantWeatherDataChartIdentifier,
) {
  if (chartIdentifier === PlantWeatherDataChartIdentifier.MomentaryPerTS) {
    chart.update(
      {
        legend: {
          events: {
            itemClick: syncedChartsLegendItemClick,
          },
        },
        // legend: {
        //   align: 'right',
        //   verticalAlign: 'top',
        //   layout: 'vertical',
        // },
      },
      false,
    );
  }
}
