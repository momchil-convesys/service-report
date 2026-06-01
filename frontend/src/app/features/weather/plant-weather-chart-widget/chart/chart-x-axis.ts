import { IntegrationPeriod, ONE_DAY, ONE_HOUR, ONE_MINUTE } from '../../../../constants';
import { integrationPeriodInMilliseconds, subHalfIntegrationPeriod } from '../../../../helpers';
import { xAxisEvents } from '../../../../helpers/_charts-sync';
import { DatetimeRangeModel } from '../../../../shared/datetime-range-select/models';
import { PlantWeatherDataChartIdentifier } from '../../_data/constants';
import { ChartSpecifics } from '../../_data/interfaces';

export const xAxisOptions: Highcharts.XAxisOptions[] = [
  {
    type: 'datetime',
    crosshair: false,
    scrollbar: {
      enabled: true,
      margin: 5,
      buttonsEnabled: true,
    },
    gridZIndex: 0,
  },
];

export function updateXAxisRange(
  chart: Highcharts.Chart,
  targetRange: DatetimeRangeModel,
  chartSpecifics: ChartSpecifics | undefined,
) {
  let min: Date | undefined;
  let max: Date | undefined;

  const integrationPeriod = targetRange.integrationPeriod;
  const integratioPeriodMs = integrationPeriodInMilliseconds(integrationPeriod);

  if (
    (integratioPeriodMs &&
      integratioPeriodMs < ONE_DAY &&
      integrationPeriod !== IntegrationPeriod.Minutes) ||
    (chartSpecifics?.chartIdentifier === PlantWeatherDataChartIdentifier.MomentaryPerTS &&
      chartSpecifics.parameterName !== 'rain')
  ) {
    min = new Date(targetRange.from);
    max = new Date(targetRange.to);
  } else {
    min = subHalfIntegrationPeriod(new Date(targetRange.from), integrationPeriod);
    max = subHalfIntegrationPeriod(new Date(targetRange.to), integrationPeriod);
  }

  /**
   * If time range has changed
   */

  if (
    chart.xAxis[0].userOptions.min !== min.getTime() ||
    chart.xAxis[0].userOptions.max !== max.getTime()
  ) {
    chart.xAxis[0].update({ min: min.getTime(), max: max.getTime() }, false);

    chart.zoomOut();
  }

  /**
   * Minimum zoom range
   */

  let minRange: number | undefined;

  if (chartSpecifics?.chartIdentifier === PlantWeatherDataChartIdentifier.MomentaryPerTS) {
    minRange = ONE_MINUTE * 5;
  } else {
    minRange = integratioPeriodMs ? Math.max(2 * integratioPeriodMs, ONE_MINUTE * 5) : undefined;
  }

  chart.xAxis[0].update({ minRange: minRange }, false);

  /**
   * Show / hide grid lines
   */

  const gridLineWidth =
    integrationPeriod === IntegrationPeriod.Hours ||
    integrationPeriod === IntegrationPeriod.QuaterOfAnHour
      ? 1
      : 0;

  chart.xAxis[0].update(
    {
      gridLineWidth: gridLineWidth,
      minorGridLineWidth: gridLineWidth,
      minorTickInterval: gridLineWidth ? ONE_HOUR : undefined,
    },
    false,
  );

  /**
   * Synced zoom
   */

  if (
    chartSpecifics?.chartIdentifier === PlantWeatherDataChartIdentifier.MomentaryPerTS &&
    chartSpecifics.parameterName !== 'rain'
  ) {
    chart.xAxis[0].update({ events: xAxisEvents, crosshair: true }, false);
  }

  /**
   * Crosshair
   */

  if (chartSpecifics?.chartIdentifier === PlantWeatherDataChartIdentifier.PlantOverview) {
    chart.xAxis[0].update({ crosshair: true }, false);
  }
}
