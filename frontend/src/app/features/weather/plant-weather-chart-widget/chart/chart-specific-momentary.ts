import { differenceInMilliseconds } from 'date-fns';
import { ONE_DAY, ONE_MINUTE } from '../../../../constants';
import {
  syncedChartsClassName,
  syncedChartsSeriesPointEvents,
  syncedChartsSeriesPointEvents_SinglePoints,
} from '../../../../helpers/_charts-sync';
import { DatetimeRangeModel } from '../../../../shared/datetime-range-select/models';

export function updateChartSpecificMomentary(
  chart: Highcharts.Chart,
  targetRange: DatetimeRangeModel,
  fullSync: boolean,
) {
  let shouldUseGrouping = false;
  if (differenceInMilliseconds(targetRange.to, targetRange.from) > ONE_DAY) {
    shouldUseGrouping = true;
  }

  chart.update(
    {
      chart: {
        // Always sync crosshair
        className: syncedChartsClassName,
      },
      plotOptions: {
        series: {
          boostThreshold: 5000,
          dataGrouping: {
            enabled: shouldUseGrouping,
            groupPixelWidth: 0.5,
            units: [
              ['minute', [5, 15, 30]],
              ['hour', [1, 3, 6, 12]],
              ['day', [1]],
              ['week', [1]],
              ['month', [1, 3, 6]],
              ['year', null],
            ],
          },
          point: {
            events: fullSync
              ? syncedChartsSeriesPointEvents_SinglePoints
              : syncedChartsSeriesPointEvents,
          },
          lineWidth: 1,
          states: {
            hover: {
              lineWidth: 3,
            },
          },
          gapSize: ONE_MINUTE * 5,
          gapUnit: 'value',
        },
      },
    },
    false,
  );
}
