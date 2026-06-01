import { formatTimestampForTooltip } from '../../../app-locale';
import { powerLimitScheduleStatusLabels } from '../../../constants';
import { ScheduleStatusHistory_DataPoint } from './_data/pv-production';
import {
  seriesColor_ScheduleStatus_Disabled_Text,
  seriesColor_ScheduleStatus_Enabled_Text,
  seriesId_ScheduleStatus_Disabled,
  seriesId_ScheduleStatus_Enabled,
} from './chart-series-schedule-status';

export interface PointWithCustomDataForTooltip extends Highcharts.Point {
  custom?: ScheduleStatusHistory_DataPoint;
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

  const dataPoint: ScheduleStatusHistory_DataPoint = point.custom;

  let color = 'inherit';

  if (point.series.options.id === seriesId_ScheduleStatus_Enabled) {
    color = seriesColor_ScheduleStatus_Enabled_Text;
  } else if (point.series.options.id === seriesId_ScheduleStatus_Disabled) {
    color = seriesColor_ScheduleStatus_Disabled_Text;
  }

  const timestampFormatted = formatTimestampForTooltip(
    dataPoint.timestamp,
    point.series.chart.options.time?.timezone,
  );

  const sinceString = $localize`Since`;

  let tooltipHtml = `
    <table style="border-collapse: separate; width: 100%">
      <tr>
          <td colspan=2 style="text-align: left; line-height: 1.0; padding-bottom:0.25em">
            <span class="secondary-text-color">${sinceString} ${timestampFormatted}</span>
          </td>
      </tr>
      `;

  const seriesLabel = $localize`Schedule status`;
  const statusLabel = powerLimitScheduleStatusLabels[dataPoint.statusChangedTo];

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

  // tooltipHtml += `
  //     <tr>
  //       <td colspan=2>
  //         <span class="secondary-text">
  //           by ${dataPoint.by}
  //         </span>
  //       </td>
  //     </tr>`;

  tooltipHtml += `
    </table>
  `;
  return tooltipHtml;
}
