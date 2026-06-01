import Highcharts from '../../../highcharts-global-config';
import {
  seriesForExportSuffix,
  seriesId_Consumption,
  seriesId_GridOut,
} from './charts-definitions';
import { FormattedValue, formatEnergyValue, formatPowerValue } from './charts-value-formatters';

export const tooltip: Highcharts.TooltipOptions = {
  shared: true,
  useHTML: true,
  style: {
    fontSize: '0.8em',
    lineHeight: '1.1',
  },
  formatter: function (tooltip) {
    const precision = 2;

    let tooltipHtml = '';

    const defaultTooltip = tooltip.defaultFormatter.call(this, tooltip);

    if (Array.isArray(defaultTooltip) && defaultTooltip.length > 0) {
      const formattedDate = defaultTooltip[0].replace('<br/>', '');
      tooltipHtml += `<div style="margin-bottom: 5px">${formattedDate}</div>`;
    }

    tooltipHtml += '<table>';

    function isTotal(point: Highcharts.Point) {
      return (
        point.series.options.id === seriesId_Consumption ||
        point.series.options.id === seriesId_GridOut
      );
    }

    function shouldIncludeInTooltip(point: Highcharts.Point) {
      return (
        point.series.options.id && point.series.options.id.endsWith(seriesForExportSuffix) === false
      );
    }

    const totalPoint = (this as any).points?.find((point: Highcharts.Point) => isTotal(point));
    let formattedTotalPoint: FormattedValue | undefined;

    // Format all points according to the total point multiplier
    if (totalPoint) {
      formattedTotalPoint =
        totalPoint.series.options.type === 'column'
          ? formatEnergyValue(totalPoint.y, precision, undefined)
          : formatPowerValue(totalPoint.y, precision, undefined);
    }

    (this as any).points?.forEach(function (point: Highcharts.Point) {
      if (shouldIncludeInTooltip(point)) {
        const formatted =
          point.series.options.type === 'column'
            ? formatEnergyValue(point.y, precision, formattedTotalPoint?.multiplier)
            : formatPowerValue(point.y, precision, formattedTotalPoint?.multiplier);

        let valueString = `&nbsp;&nbsp;${formatted.valueAsString} ${formatted.unit}`;

        if (
          point.series.options.id === seriesId_Consumption ||
          point.series.options.id === seriesId_GridOut
        ) {
          valueString = `<b>${valueString}</b>`;
        }

        tooltipHtml += `<tr>
        <td><span style="color:${point.color}">\u25CF</span> ${point.series.name} </td>
        <td style="text-align: right;">${valueString}</td>
      </tr>`;
      }
    });

    tooltipHtml += '</table>';

    return tooltipHtml;
  },
};
