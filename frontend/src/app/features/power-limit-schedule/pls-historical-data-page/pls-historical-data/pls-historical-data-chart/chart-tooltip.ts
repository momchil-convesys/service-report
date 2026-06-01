import { formatTimestampForTooltip } from '../../../../../app-locale';

export const tooltipFormatterHtmlTable: Highcharts.TooltipFormatterCallbackFunction = function (
  tooltip: Highcharts.Tooltip,
) {
  const timestamp: number = (this as any).point.x;

  const timestampFormatted = formatTimestampForTooltip(
    timestamp,
    tooltip.chart.options.time?.timezone,
  );

  const borderSpacing = '0.125';
  const horizontalPadding = '0.5em';
  const verticalPadding = '0.25em';

  // Default formatter should be called, so that
  // (this.point as any).key is set to the proper time range
  tooltip.defaultFormatter.call(this, tooltip);

  let tooltipHtml = ``;

  tooltipHtml += `
    <div style="
      padding-bottom: ${horizontalPadding};
      margin-bottom: ${verticalPadding};
      font-weight: bold;
      border-bottom: 1px solid #d4dce3">
      ${
        (this as any).point.dataGroup && ((this as any).point as any).key
          ? ((this as any).point as any).key
          : timestampFormatted
      }
    </div>`;

  tooltipHtml += `
    <div style="padding-top:${verticalPadding}">
      <table style="border-spacing: ${borderSpacing}; border-collapse: separate; width: 100%">`;

  (this as any).points?.map((point: Highcharts.Point) => {
    // Round value if grouped
    const value = point.y && (this as any).point.dataGroup ? Math.round(point.y) : point.y;

    tooltipHtml += `
        <tr>
          <td>
            <span style="color:${point.series.color}; padding-right: 0.25em">\u25CF</span>
            ${point.series.name}
          </td>
          <td style="text-align: right; padding-left: 0.5em; font-weight: bold">
            ${value}${tooltip.options.valueSuffix || ''}
          </td>
        </tr>

    `;
  });

  tooltipHtml += `
      </table>
    </div>`;

  return tooltipHtml;
};
