import { addHours, differenceInHours, subHours } from 'date-fns';
import { DAYLIGHT_HOURS_END, DAYLIGHT_HOURS_START } from '../../../../constants';
import { BaseChartContext } from '../../../../shared/base-chart-component/base-chart-component.component';

export function updateDatetimeAxisRange(
  chart: Highcharts.Chart,
  context: BaseChartContext | null,
  axisIndex = 0,
) {
  if (!context?.targetRange) {
    return;
  }

  const xAxis = chart.xAxis[axisIndex];

  const currentMin = xAxis.options.min;
  const currentMax = xAxis.options.max;

  const newMin = context.targetRange.from.getTime();
  const newMax = context.targetRange.to.getTime();

  if (currentMin === newMin && currentMax === newMax) {
    // If time range haven't changed
    return;
  }

  xAxis.update(
    {
      min: newMin,
      max: newMax,
    },
    false,
  );

  if (differenceInHours(newMax, newMin) <= 24) {
    // If showing a single day

    const daylightStart = addHours(newMin, DAYLIGHT_HOURS_START).getTime();
    const daylightEnd = subHours(newMax, 24 - DAYLIGHT_HOURS_END).getTime();

    // We use soft min and max values to set extremes when reset button is clicked
    xAxis.update(
      {
        softMin: daylightStart,
        softMax: daylightEnd,
      },
      false,
    );

    xAxis.setExtremes(daylightStart, daylightEnd, false);
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
