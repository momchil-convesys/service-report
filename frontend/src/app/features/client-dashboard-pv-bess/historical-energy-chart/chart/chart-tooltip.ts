import { formatIntervalForTooltip, formatTimestampForTooltip } from '../../../../app-locale';
import { formatValueForTooltip, tooltipPositioner_LeftRight } from '../../../../helpers';
import { getLegendSymbolSVG } from './chart-symbols';

export const tooltip: Highcharts.TooltipOptions = {
  useHTML: true,
  style: {
    fontSize: '0.8em',
  },
  shared: true,
  outside: false,
  valueDecimals: 0,
  animation: false,
  positioner: tooltipPositioner_LeftRight,
  formatter: function (tooltip: Highcharts.Tooltip) {
    const defaultTooltip = tooltip.defaultFormatter.call(this, tooltip);

    const point: Highcharts.Point = this as any;

    if ((point.series.options as any).pointIntervalUnit) {
      return defaultTooltip;
    }

    let timestampFormatted: string | undefined;

    if (point.dataGroup && defaultTooltip.length > 0) {
      timestampFormatted = defaultTooltip[0];
    } else if ((point as any).custom) {
      timestampFormatted = formatIntervalForTooltip(
        (point as any).custom.interval,
        tooltip.chart.options.time?.timezone,
      );
    } else {
      timestampFormatted = formatTimestampForTooltip(point.x, tooltip.chart.options.time?.timezone);
    }

    let tooltipHtml: string = '';

    tooltipHtml += `<table style="border-collapse: collapse; margin-top: -2px; margin-bottom: -2px">`;

    tooltipHtml += `
        <tr>
          <td colspan=3 style="text-align: left; line-height: 1.0; padding-bottom:0.25em">
            <span>
              ${timestampFormatted}
            </span>
          </td>
        </tr>`;

    const points: Highcharts.Point[] = (this as any).points || [point];

    points.map((point: Highcharts.Point) => {
      const unit = (point.series.options as any).tooltip?.valueSuffix || '';
      const valueDecimals = 0;

      const format = `1.${valueDecimals}-${valueDecimals}`;

      // For charged energy and imported energy, show positive value in tooltip even though it's displayed as negative
      const isChargedEnergy = point.series.options.id?.includes('charged-energy');
      const isImportedEnergy =
        point.series.options.id?.includes('imported-energy') &&
        !point.series.options.id?.includes('loss');
      const shouldShowPositive =
        (isChargedEnergy || isImportedEnergy) && point.y !== null && point.y !== undefined;
      const tooltipValue =
        shouldShowPositive && point.y !== undefined ? Math.abs(point.y) : (point.y ?? null);
      let valueFormatted = formatValueForTooltip(tooltipValue, unit, format);

      const flip = point.series.options.id?.includes('exported-energy') ?? false;
      const legendSymbol = getLegendSymbolSVG(
        point.series,
        flip,
        point.series.options.id?.includes('loss'),
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
