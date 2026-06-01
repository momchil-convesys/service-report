import { formatTimestampForTooltip } from '../../../../app-locale';
import { formatValueForTooltip, tooltipPositioner_LeftRight } from '../../../../helpers';
import { getLegendSymbolSVG } from '../../historical-energy-chart/chart/chart-symbols';

export const tooltip: Highcharts.TooltipOptions = {
  useHTML: true,
  style: {
    fontSize: '0.8em',
  },
  shared: true,
  outside: false,
  split: false, // this is important in highstock charts
  valueDecimals: 0,
  animation: false,
  positioner: tooltipPositioner_LeftRight,
  formatter: function (tooltip: Highcharts.Tooltip) {
    const defaultTooltip = tooltip.defaultFormatter.call(this, tooltip);

    const point: Highcharts.Point = this as any;

    if ((point.series.options as any).pointIntervalUnit) {
      return defaultTooltip;
    }

    const timestampFormatted = formatTimestampForTooltip(
      point.x,
      tooltip.chart.options.time?.timezone,
    );

    let tooltipHtml: string = '';

    tooltipHtml += `<table style="border-collapse: collapse; margin-top: -2px; margin-bottom: -2px">`;

    tooltipHtml += `
        <tr>
          <td colspan=2 style="text-align: left; line-height: 1.0; padding-bottom:0.25em">
            <span>
              ${timestampFormatted}
            </span>
          </td>
        </tr>`;

    const points: Highcharts.Point[] = (this as any).points || [point];
    points
      .filter((point: Highcharts.Point) => point.y !== null)
      .map((point: Highcharts.Point) => {
        const unit = (point.series.options as any).tooltip?.valueSuffix || '';
        const valueDecimals = 0;

        const format = `1.${valueDecimals}-${valueDecimals}`;

        let valueFormatted = formatValueForTooltip(point.y, unit, format);

        const seriesId = (point.series.options as any).id;

        const legendSymbol =
          seriesId === 'chargeable-energy' || seriesId === 'dischargeable-energy'
            ? '—'
            : getLegendSymbolSVG(
                point.series,
                seriesId.includes('export'),
                seriesId.includes('loss'),
              );

        tooltipHtml += `
            <tr>
              <td style="padding-right: 2px; line-height: 1.0; text-align: center;">
                <span style="color:${point.series.color};">${legendSymbol}</span>
              </td>
              <td style="padding-right: 4px; line-height: 1.0">
                ${point.series.name}
              </td>
              <td style="text-align: right; line-height: 1.0">
                <b>${valueFormatted}</b>
              </td>
            </tr>`;
      });

    tooltipHtml += `</table>`;

    return tooltipHtml;
  },
};
