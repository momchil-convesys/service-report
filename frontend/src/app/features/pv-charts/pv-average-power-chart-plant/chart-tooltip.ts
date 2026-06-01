import { formatNumber } from '@angular/common';
import {
  APP_LOCALE_ID,
  formatIntervalForTooltip,
  formatTimestampForTooltip,
} from '../../../app-locale';
import { IntegrationPeriod } from '../../../constants';
import { calculateApplicableRange } from '../_shared/chart-time-range-formatters';

export const tooltip: Highcharts.TooltipOptions = {
  shared: true,
  valueDecimals: 1,
  valueSuffix: ' kW',
  style: {
    fontSize: '0.8em',
    lineHeight: '1.1',
  },
  useHTML: true,
  distance: 25,
  positioner: function (labelWidth, labelHeight, point) {
    const chartWidth = this.chart.chartWidth;

    // If tooltip is too wide
    // allow it to be displayed over y axis labels.
    const mayOverlapYAxis =
      labelWidth > chartWidth * 0.3 && labelHeight > this.chart.chartHeight * 0.2;

    const leftAnchor = mayOverlapYAxis ? 5 : this.chart.plotLeft;
    let x = leftAnchor;
    let y = 5;

    // Show tooltip near left or right edge of the chart
    if (this.chart.plotLeft + point.plotX < chartWidth * 0.5) {
      const rightAnchor = mayOverlapYAxis
        ? chartWidth - 5
        : this.chart.plotLeft + this.chart.plotWidth;
      x = rightAnchor - labelWidth;
    }

    return { x, y };
  },
  formatter: function (tooltip) {
    const points: Highcharts.Point[] = (this as any).points || [(this as any).point];

    const mainPoint = (this as any).point;

    let formattedDate: string = '';

    let applicableRange: Interval | undefined = calculateApplicableRange(
      new Date(mainPoint.x),
      IntegrationPeriod.QuaterOfAnHour,
      true,
    );

    if (applicableRange) {
      formattedDate = formatIntervalForTooltip(
        applicableRange,
        tooltip.chart.options.time?.timezone,
      );
    } else {
      /**
       * This is a backup case.
       * If we get to here, it means that applicableRange cannot be calculated for some reason.
       */
      formattedDate = formatTimestampForTooltip(mainPoint.x, tooltip.chart.options.time?.timezone);
    }

    const borderSpacing = '0';

    let tooltipHtml = `
   

      <table style="border-spacing: ${borderSpacing}; border-collapse: separate; width: 100%">        
        <tr>
          <td colspan=2 style="text-align: left; line-height: 1.0">
            <span class="secondary-text">
              ${formattedDate}
            </span>
          </td>
        </tr>
        `;

    points.map((point) => {
      {
        const value = point.y;

        const formattedPointValue =
          value !== undefined && value !== null
            ? formatNumber(value, APP_LOCALE_ID, '1.0-1') + tooltip.options.valueSuffix || ''
            : '&mdash;';

        tooltipHtml += `
        <tr>
          <td>
            <span style="color:${point.series.color}; padding-right: 0.25em">\u25CF</span>
            ${point.series.name}
          </td>
          <td style="
                text-align: right; 
                padding-left: 0.5em;
                font-weight: bold;">
            ${formattedPointValue}
          </td>
        </tr>`;
      }
    });

    tooltipHtml += `
      </table>
    `;
    return tooltipHtml;
  },
};
