import { formatNumber } from '@angular/common';
import { APP_LOCALE_ID, formatTimestampForTooltip } from '../../../../app-locale';
import Highcharts from '../../../../highcharts-global-config';
import { seriesId_PlantDailyProductionPM } from '../chart-constants';

interface PointCustomData {
  timestamp?: string; // raw iso string from request
  valueSuffix: string;
  tooltipTitle: string | undefined;
}

export interface PointOptionsWithCustomDataForTooltip extends Highcharts.PointOptionsObject {
  custom?: PointCustomData;
}

export interface PointWithCustomDataForTooltip extends Highcharts.Point {
  custom?: PointCustomData;
}

export const tooltip: Highcharts.TooltipOptions = {
  shared: true,
  shape: 'rect',
  valueDecimals: 1,
  valueSuffix: ' kWh',
  distance: 42,
  followPointer: false,
  outside: true,
  style: {
    fontSize: '0.8em',
    lineHeight: '1.1',
  },
  useHTML: true,
  positioner: function (labelWidth, labelHeight, point) {
    const chart = this.chart;

    return {
      x: point.plotX + chart.plotLeft - labelWidth / 2,
      y: chart.plotTop - labelHeight,
    };
  },
  formatter: function (tooltip) {
    const point: PointWithCustomDataForTooltip = (this as any).point;

    const timestamp: string | undefined = point.custom?.timestamp;
    if (!timestamp) {
      return tooltip.defaultFormatter.call(this, tooltip);
    }

    const timestampFormatted = formatTimestampForTooltip(
      timestamp,
      tooltip.chart.options.time?.timezone,
    );

    const borderSpacing = '0.125';
    const horizontalPadding = '0.5em';
    const verticalPadding = '0.25em';

    let tooltipHtml = `
      <div style="
        padding-bottom: ${horizontalPadding}; 
        margin-bottom: ${verticalPadding}; 
        font-weight: bold; 
        border-bottom: 1px solid #d4dce3">
          ${point.custom?.tooltipTitle || point.category}
      </div>

      <div>
        <table style="border-spacing: ${borderSpacing}; border-collapse: separate; width: 100%">

          <tr>
            <td colspan=2 style="text-align: left; line-height: 1.0">
              <span class="secondary-text">
                ${timestampFormatted}
              </span>
            </td>
          </tr>`;

    /**
     * Iterate over all points (E.g: power meters)
     */
    const points: PointWithCustomDataForTooltip[] = (this as any).points || [];
    // (this as any).points?.map((context) => context.point) || []; TODO: check

    points.map((point, index) => {
      {
        let secondarySeries = false;

        if (index !== 0 && point.series.options.id?.startsWith(seriesId_PlantDailyProductionPM)) {
          // Single power meters
          secondarySeries = true;
        }

        // Round value if grouped
        const value = point.y && (this as any).point?.dataGroup ? Math.round(point.y) : point.y;

        let formattedPointValue =
          value !== undefined
            ? formatNumber(value, APP_LOCALE_ID, '0.0-2') + point.custom?.valueSuffix || ''
            : '&mdash;';

        const isInvalid = value !== undefined && value !== null && value < 0;
        if (isInvalid) {
          formattedPointValue = $localize`INVALID DATA`;
        }

        const invalidDataStyle = isInvalid
          ? 'background-color: #d9343a; color: white; padding: 0 0.5em; border-radius: 2px;'
          : '';

        tooltipHtml += `
          <tr>
            <td style="padding-right: 0.5em;">
              <span style="color:${point.series.color}; padding-right: 0.25em">\u25CF</span>
              ${point.series.name}
            </td>
            <td style="
                  ${invalidDataStyle}
                  text-align: right; 
                  font-weight: ${secondarySeries ? 'normal' : 'bold'}">
              ${formattedPointValue}
            </td>
          </tr>`;
      }
    });

    tooltipHtml += `
        </table>
      </div>
      `;

    return tooltipHtml;
  },
};
