import { DataSeriesConfiguration_DTO } from '../../../../data/definitions';

export const defaultYAxisId = 'defaultYAxisId';

export const yAxisOptions: Highcharts.YAxisOptions[] = [];

export function initializeYAxis(
  chart: Highcharts.Chart,
  seriesConfigurations: DataSeriesConfiguration_DTO[],
) {
  if (chart.yAxis.length > 0) {
    return;
  }

  const yAxisByUnit: {
    [unit: string]: Highcharts.YAxisOptions;
  } = {};

  seriesConfigurations.forEach((seriesConfiguration) => {
    const yAxisId = seriesConfiguration.unit || defaultYAxisId;
    if (!yAxisByUnit[yAxisId]) {
      yAxisByUnit[yAxisId] = {
        id: yAxisId,
        title: {
          text: seriesConfiguration.unit || undefined,
        },
        opposite: true,
        lineWidth: 1,
        margin: 15,
        gridZIndex: 0,
      };
    }
  });

  Object.values(yAxisByUnit).forEach((yAxis) => chart.addAxis(yAxis, false, false));
}
