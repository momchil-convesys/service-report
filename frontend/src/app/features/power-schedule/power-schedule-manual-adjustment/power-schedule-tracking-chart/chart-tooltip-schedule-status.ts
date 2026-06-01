import { formatIntervalForTooltip } from 'src/app/app-locale';
import { powerScheduleStatusLabels } from 'src/app/constants';
import { ScheduleStatusInterval } from '../_data/power-schedule-tracking.model';
import {
  seriesColor_ScheduleStatus_Disabled_Text,
  seriesColor_ScheduleStatus_Enabled_Text,
  seriesId_ScheduleStatus_Disabled,
  seriesId_ScheduleStatus_Enabled,
} from './chart-series-schedule-status';

export interface PointWithCustomDataForTooltip extends Highcharts.Point {
  custom?: ScheduleStatusInterval;
}

export function createTooltipForScheduleStatusSeries(
  point: PointWithCustomDataForTooltip,
): string | null {
  if (!point.custom) {
    console.warn(
      'Requested tooltip for point without custom data (schedule status history point). Returning default tooltip.',
    );
    return null;
  }

  const dataPoint: ScheduleStatusInterval = point.custom;

  let color = 'inherit';

  if (point.series.options.id === seriesId_ScheduleStatus_Enabled) {
    color = seriesColor_ScheduleStatus_Enabled_Text;
  } else if (point.series.options.id === seriesId_ScheduleStatus_Disabled) {
    color = seriesColor_ScheduleStatus_Disabled_Text;
  }

  // Format the range from timestamp to timestampEnd
  const interval = dataPoint.interval;

  const formattedInterval = formatIntervalForTooltip(
    interval,
    point.series.chart.options.time?.timezone,
  );

  let tooltipHtml = `
    <table style="border-collapse: separate; width: 100%">
      <tr>
          <td colspan=2 style="text-align: left; line-height: 1.0; padding-bottom:0.25em">
            <span class="secondary-text-color">${formattedInterval}</span>
          </td>
      </tr>
      `;

  const seriesLabel = $localize`Schedule Status`;
  const statusLabel = powerScheduleStatusLabels[dataPoint.status];

  tooltipHtml += `
      <tr>
        <td>
          ${seriesLabel}
        </td>
        <td style="
              text-align: right;
              padding-left: 0.5em;">
          <b style="color: ${color}; text-transform: uppercase">
            ${statusLabel}
          </b>
        </td>
      </tr>`;

  tooltipHtml += `
    </table>
  `;
  return tooltipHtml;
}
