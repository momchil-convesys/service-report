import { IntegrationPeriod, ONE_DAY } from '../../../../constants';
import { integrationPeriodInMilliseconds } from '../../../../helpers';
import { DatetimeRangeModel } from '../../../../shared/datetime-range-select/models';

export function updatePointPlacement(chart: Highcharts.Chart, targetRange: DatetimeRangeModel) {
  const integrationPeriod: IntegrationPeriod = targetRange.integrationPeriod;
  const integratioPeriodMs = integrationPeriodInMilliseconds(integrationPeriod);

  let pointPlacement: string | number = 'on';
  let pointIntervalUnit: Highcharts.OptionsPointIntervalUnitValue | undefined;

  if (
    integratioPeriodMs &&
    integratioPeriodMs < ONE_DAY &&
    integrationPeriod !== IntegrationPeriod.Minutes
  ) {
    pointPlacement = 0.5;
  } else {
    if (integrationPeriod === IntegrationPeriod.Days) {
      pointIntervalUnit = 'day';
    } else if (integrationPeriod === IntegrationPeriod.Months) {
      pointIntervalUnit = 'month';
    } else if (integrationPeriod === IntegrationPeriod.Years) {
      pointIntervalUnit = 'year';
    }
  }

  chart.update(
    {
      plotOptions: {
        series: {
          pointRange: integratioPeriodMs,
          pointPlacement,
          pointIntervalUnit,
        },
      },
    },
    false,
  );
}
