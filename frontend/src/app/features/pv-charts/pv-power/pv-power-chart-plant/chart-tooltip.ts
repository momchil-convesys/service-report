import { formatNumber } from '@angular/common';
import { APP_LOCALE_ID, formatTimestampForTooltip } from '../../../../app-locale';

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
    // const context: Highcharts.Point = this as any;
    const context = this as any;

    const points: Highcharts.Point[] = context.points || [context.point];

    const mainPoint = context.point;

    const timestampFormatted = formatTimestampForTooltip(
      mainPoint.x,
      tooltip.chart.options.time?.timezone,
    );

    const borderSpacing = '0';

    let tooltipHtml = `
      <table style="border-spacing: ${borderSpacing}; border-collapse: separate; width: 100%">

        <tr>
          <td colspan=2 style="text-align: left; line-height: 1.0">
            <span class="secondary-text">
              ${timestampFormatted}
            </span>
          </td>
        </tr>`;

    points.map((point, index) => {
      {
        const valueSuffix: string | undefined =
          (point.series.options as any).tooltip?.valueSuffix || tooltip.options.valueSuffix;

        const value = point.y;

        const formattedPointValue =
          value !== undefined && value !== null
            ? formatNumber(value, APP_LOCALE_ID, '1.0-1') + (valueSuffix || '')
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
