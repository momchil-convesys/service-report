import { endOfToday } from 'date-fns';
import { formatIntervalForTooltip, formatTimestampForTooltip } from '../../../app-locale';
import { ControlledManuallyHistory_DataPoint } from './_data/pv-production';

export interface PointWithCustomDataForTooltip extends Highcharts.Point {
  custom?: ControlledManuallyHistory_DataPoint;
}

export function createTooltipForManualControlSeries(
  point: PointWithCustomDataForTooltip,
): string | null {
  if (!point.custom) {
    console.warn(
      'Requested tooltip for point without custom data (manual control history point). Returning default tooltip.',
    );
    return null;
  }

  const dataPoint: ControlledManuallyHistory_DataPoint = point.custom;

  let timestampFormatted;

  if (dataPoint.timestampEnd.getTime() === endOfToday().getTime()) {
    timestampFormatted = $localize`Since`;
    timestampFormatted +=
      ' ' +
      formatTimestampForTooltip(dataPoint.timestamp, point.series.chart.options.time?.timezone, {
        customFormat: 'd MMMM, HH:mm:ss',
      });
  } else {
    timestampFormatted = formatIntervalForTooltip(
      {
        start: dataPoint.timestamp,
        end: dataPoint.timestampEnd,
      },
      point.series.chart.options.time?.timezone,
      true,
    );
  }

  let tooltipHtml = `<span class="secondary-text-color">${timestampFormatted}</span>`;

  tooltipHtml += `
    <div class="manual-control-info">
      <strong>${$localize`Power limit is controlled manually`}</strong>
`;

  if (dataPoint.byUserDisplayName) {
    tooltipHtml += `
      <div class="manual-control-user">
        ${$localize`by`} ${dataPoint.byUserDisplayName}
      </div>
    `;
  }

  tooltipHtml += `
    </div>
  `;

  return tooltipHtml;
}
