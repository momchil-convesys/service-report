import { differenceInHours } from 'date-fns';
import { IntegrationPeriod, ONE_HOUR } from '../../../constants';
import { integrationPeriodInMilliseconds, subHalfIntegrationPeriod } from '../../../helpers';
import { xAxisEvents } from '../../../helpers/_charts-sync';
import { BaseChartContext } from '../../../shared/base-chart-component/base-chart-component.component';

export const xAxisOptions: Highcharts.XAxisOptions = {
  type: 'datetime',
  crosshair: true,
  scrollbar: {
    enabled: true,
  },
  minRange: ONE_HOUR * 3,
  minTickInterval: ONE_HOUR,
  showFirstLabel: true,
  showLastLabel: true,
  startOnTick: true,
  endOnTick: true,
  minPadding: 0,
  maxPadding: 0,
  dateTimeLabelFormats: {
    month: '%b', // default: '%b \'%y'
  },
  events: xAxisEvents,
};

export function updateDatetimeAxisRange(
  chart: Highcharts.Chart,
  integrationPeriod: IntegrationPeriod | undefined,
  context: BaseChartContext | null,
  axisIndex = 0,
) {
  if (!context?.targetRange) {
    return;
  }

  const xAxis = chart.xAxis[axisIndex];

  const currentMin = xAxis.options.min;
  const currentMax = xAxis.options.max;

  let newMinDate = context.targetRange.from;
  let newMaxDate = context.targetRange.to;

  /**
   * The following condition sets min and max just as they should be.
   * Empirically deduced logic...
   */
  if (
    integrationPeriod !== IntegrationPeriod.Hours &&
    integrationPeriod !== IntegrationPeriod.QuaterOfAnHour
  ) {
    // when pointPlacement: 'on' fixes added extra column after xAxis.max
    // but clips the fist column, so we shift it here by half point
    newMinDate = subHalfIntegrationPeriod(newMinDate, integrationPeriod);
    newMaxDate = subHalfIntegrationPeriod(newMaxDate, integrationPeriod);
  } else {
    // newMinDate = addHalfIntegrationPeriod(newMinDate, integrationPeriod);
    // newMaxDate = subHalfIntegrationPeriod(newMaxDate, integrationPeriod);
  }

  const newMin = newMinDate.getTime();
  const newMax = newMaxDate.getTime();

  // Calculate minimum zoom range
  const interationPeriodDuration =
    (integrationPeriod ? integrationPeriodInMilliseconds(integrationPeriod) : 0) || 0;
  const minRange = Math.max(3 * ONE_HOUR, 8 * interationPeriodDuration);

  if (currentMin === newMin && currentMax === newMax && xAxis.options.minRange === minRange) {
    // Nothing to update
    return;
  }

  xAxis.update(
    {
      min: newMin,
      max: newMax,
      minRange: minRange,
    },
    false,
  );

  if (differenceInHours(newMax, newMin) <= 24) {
    // If showing a single day

    // const daylightStart = addHours(newMin, DAYLIGHT_HOURS_START).getTime();
    // const daylightEnd = subHours(newMax, 24 - DAYLIGHT_HOURS_END).getTime();

    // We use soft min and max values to set extremes when reset button is clicked
    xAxis.update(
      {
        softMin: newMin,
        softMax: newMax,
      },
      false,
    );

    // xAxis.setExtremes(newMin, newMax, false);
  } else {
    // If showing range greater than one day

    // We use soft min and max values to set extremes when reset button is clicked
    xAxis.update(
      {
        softMin: undefined,
        softMax: undefined,
      },
      false,
    );

    chart.zoomOut();
  }
}
