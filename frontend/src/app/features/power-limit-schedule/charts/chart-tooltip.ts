import { formatDate, formatNumber } from '@angular/common';
import { APP_LOCALE_ID } from '../../../app-locale';
import { seriesData } from '../../../helpers';
import { seriesId_SharedColumnHover } from '../../pv-charts/pv-production-chart/chart-series-shared-column-hover';
import { PowerLimitScheduleParsedTableRow } from '../_data/models';
import {
  seriesId_TargetPowerLimit,
  seriesId_TargetPowerLimitAdjusted,
} from './chart-common-definitions';

export interface PointWithCustomDataForTooltip extends Highcharts.Point {
  custom?: PowerLimitScheduleParsedTableRow;
}

export const tooltip: Highcharts.TooltipOptions = {
  shared: true,
  useHTML: true,
  style: {
    fontSize: '0.8em',
    lineHeight: '1.1',
  },
  // distance: 30,
  positioner: function (labelWidth, labelHeight, point) {
    const defaultPosition = this.getPosition(labelWidth, labelHeight, point);

    // Show tooltip above the chart

    return { x: defaultPosition.x, y: 5 };
  },

  /**
   * From Highcharts documentation:
   * The context of the formatter (since v12) is the Point instance. If the tooltip is shared or split, an array this.points contains all points of the hovered x-value.
   * Common properties from the Point to use in the formatter include:
   * Point.points: In a shared or split tooltip, this is an array containing all the hovered points.
   */
  formatter: function (tooltip) {
    const points: Highcharts.Point[] = (this as any).points || [this as any];

    const mainPoint: PointWithCustomDataForTooltip = this as any;

    if (!mainPoint.custom) {
      console.warn(
        'Requested tooltip for point without custom data (power limit schedule point). Returning default tooltip.',
      );
      return tooltip.defaultFormatter.call(this, tooltip);
    }

    const chart: Highcharts.Chart = this.series.chart;

    const timestampStart = mainPoint.custom.zonedInterval.start;
    const timestampEnd = mainPoint.custom.zonedInterval.end;

    const formattedTimeStart = formatDate(timestampStart, 'EEEE, d MMMM, HH:mm', APP_LOCALE_ID);
    const formattedTimeEnd = formatDate(timestampEnd, 'HH:mm', APP_LOCALE_ID);

    let tooltipHtml = `

      <table style="border-collapse: separate; width: 100%; margin-top: -2px; margin-bottom: -2px">        

      <tr>
        <td colspan=2 style="text-align: left; line-height: 1.0">
           <span class="secondary-text-color">
              ${formattedTimeStart}–${formattedTimeEnd}
            </span>
        </td>
      </tr>`;

    points
      .filter(
        (point) => point.series.visible && point.series.options.id !== seriesId_SharedColumnHover,
      )
      .map((point) => {
        {
          const value = point.y;
          const format = value ? '1.3-3' : '1.0-3';

          let formattedPointValue =
            value !== undefined && value !== null
              ? formatNumber(value, APP_LOCALE_ID, format) + ` ${tooltip.options.valueSuffix || ''}`
              : '&mdash;';

          let symbol = `<span style="color:${point.series.color}; padding-right: 0.25em">\u25CF</span>`;
          if (
            point.series.options.id === seriesId_TargetPowerLimit ||
            point.series.options.id === seriesId_TargetPowerLimitAdjusted
          ) {
            symbol = `<b style="color:${point.series.color}; padding-right: 0.25em">&mdash;</b>`;

            /**
             * In case of cropping, the `data` array may contain `undefined` values, instead of points.
             * So we check the real value from `series.options.data`.
             */
            if (
              seriesData(chart, point.series.options.id).find(
                (dataPoint) => dataPoint.x === point.x,
              )?.y === null
            ) {
              formattedPointValue = $localize`:@@noLimitShort:NL`;
            }
          }

          let valueFontWeight = 'normal';
          if (point.series.options.id === seriesId_TargetPowerLimitAdjusted) {
            valueFontWeight = 'bold';
          }

          tooltipHtml += `
            <tr>
              <td>
                ${symbol}
                <span>${point.series.name}</span>
              </td>
              <td style="
                    text-align: right; 
                    padding-left: 0.5em;
                    font-weight: ${valueFontWeight};">
                <span>${formattedPointValue}</span>
              </td>
            </tr>`;
        }
      });

    tooltipHtml += `</table>`;

    return tooltipHtml;
  },
};
