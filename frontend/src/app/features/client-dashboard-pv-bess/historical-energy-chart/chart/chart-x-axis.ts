import { IntegrationPeriod, ONE_DAY, ONE_HOUR, ONE_MINUTE } from '../../../../constants';
import { integrationPeriodInMilliseconds, subHalfIntegrationPeriod } from '../../../../helpers';
import { DatetimeRangeModel } from '../../../../shared/datetime-range-select/models';

export const xAxisOptions: Highcharts.XAxisOptions[] = [
  {
    type: 'datetime',
    crosshair: true,
    scrollbar: {
      enabled: true,
      buttonsEnabled: true,
    },
    gridZIndex: 0,
  },
];

export function updateXAxisRange(chart: Highcharts.Chart, targetRange: DatetimeRangeModel) {
  let min: Date | undefined;
  let max: Date | undefined;

  const integrationPeriod = targetRange.integrationPeriod;
  const integratioPeriodMs = integrationPeriodInMilliseconds(integrationPeriod);

  if (
    integratioPeriodMs &&
    integratioPeriodMs < ONE_DAY &&
    integrationPeriod !== IntegrationPeriod.Minutes
  ) {
    min = new Date(targetRange.from);
    max = new Date(targetRange.to);
  } else {
    min = subHalfIntegrationPeriod(new Date(targetRange.from), integrationPeriod);
    max = subHalfIntegrationPeriod(new Date(targetRange.to), integrationPeriod);
  }

  if (
    chart.xAxis[0].userOptions.min !== min.getTime() ||
    chart.xAxis[0].userOptions.max !== max.getTime()
  ) {
    chart.xAxis[0].update({ min: min.getTime(), max: max.getTime() }, false);
    chart.zoomOut();
  }

  let minRange: number | undefined;
  minRange = integratioPeriodMs ? Math.max(2 * integratioPeriodMs, ONE_MINUTE * 5) : undefined;

  chart.xAxis[0].update({ minRange: minRange }, false);

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
}
