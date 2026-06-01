import { endOfToday } from 'date-fns';
import { formatIntervalForTooltip, formatTimestampForTooltip } from '../../../app-locale';
import { externalControlWarningText } from '../../../constants';
import { ControlledByExternalSystemHistory_DataPoint } from './_data/pv-production';

export interface PointWithCustomDataForTooltip extends Highcharts.Point {
  custom?: ControlledByExternalSystemHistory_DataPoint;
}

export function createTooltipForExternalSystemControlSeries(
  point: PointWithCustomDataForTooltip,
): string | null {
  if (!point.custom) {
    console.warn(
      'Requested tooltip for point without custom data (external system control history point). Returning default tooltip.',
    );
    return null;
  }

  const dataPoint: ControlledByExternalSystemHistory_DataPoint = point.custom;

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
    <div class="external-control-warning">
      ${externalControlWarningText}
    </div>
  `;

  return tooltipHtml;
}
