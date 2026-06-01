import { formatUnitSpacing } from '../../../../helpers';
import { PlantWeather_HistoricalTimelineData_DTO } from '../../_data/dto';
import { defaultYAxisId } from './chart-y-axis';

export function initializeSeries(
  chart: Highcharts.Chart,
  data: PlantWeather_HistoricalTimelineData_DTO,
) {
  if (chart.series.length > 0) {
    return;
  }

  data.seriesConfigurations.forEach((seriesConfiguration) => {
    const seriesType = seriesConfiguration.type || 'line';

    const yAxisId = seriesConfiguration.unit || defaultYAxisId;

    // TODO: implements separate function to patch the serries if needed
    //
    // let series: Highcharts.Series | undefined = seriesById(
    //   chart,
    //   seriesConfiguration.seriesConfigurationId
    // );
    // if (!series) {
    chart.addSeries(
      {
        type: seriesType,
        id: seriesConfiguration.seriesConfigurationId,
        name: seriesConfiguration.seriesDisplayName,
        tooltip: {
          valueSuffix: formatUnitSpacing(seriesConfiguration.unit || ''),
        },
        yAxis: yAxisId,
      },
      false,
    );
    // }
  });
}
