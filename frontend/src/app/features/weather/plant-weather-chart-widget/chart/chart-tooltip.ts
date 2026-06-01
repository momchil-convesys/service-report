import { Point, Tooltip } from 'highcharts';
import { formatIntervalForTooltip, formatTimestampForTooltip } from '../../../../app-locale';
import { celsiusDegreeSymbols, getWindDirectionFromDegree8 } from '../../../../constants';
import { formatValueForTooltip, tooltipPositioner_LeftRight } from '../../../../helpers';
import { PlantWeatherDataChartIdentifier } from '../../_data/constants';
import { ChartSpecifics } from '../../_data/interfaces';

export function initializeTooltipSpecifics(
  chart: Highcharts.Chart,
  chartSpecifics: ChartSpecifics,
) {
  let tooltip: Highcharts.TooltipOptions = {};

  const chartIdentifier = chartSpecifics.chartIdentifier;

  const valueDecimals =
    chartSpecifics.parameterName === 'ambient-temperature' ||
    chartSpecifics.parameterName === 'pv-module-temperature'
      ? 1
      : 3;

  if (chartIdentifier === PlantWeatherDataChartIdentifier.PlantOverview) {
    tooltip = {
      positioner: tooltipPositioner_LeftRight,
      shape: 'rect',
      shared: true,
    };
  } else {
    tooltip = {
      positioner: tooltipPositioner_LeftRight,
      shape: 'rect',
      shared: true,
      valueDecimals,
    };
  }

  chart.update({ tooltip }, false);
}

export const tooltip: Highcharts.TooltipOptions = {
  useHTML: true,
  style: {
    fontSize: '0.9em',
  },
  formatter: function (tooltip: Tooltip) {
    const defaultTooltip = tooltip.defaultFormatter.call(this, tooltip);

    const point: Point = this as any;

    if ((point.series.options as any).pointIntervalUnit) {
      return defaultTooltip;
    }

    let timestampFormatted: string | undefined;
    let reduceTimestampSize: boolean = false;

    if (point.dataGroup && defaultTooltip.length > 0) {
      timestampFormatted = defaultTooltip[0];
      reduceTimestampSize = false;
    } else if ((point as any).custom) {
      timestampFormatted = formatIntervalForTooltip(
        (point as any).custom.interval,
        tooltip.chart.options.time?.timezone,
      );
      reduceTimestampSize = true;
    } else {
      timestampFormatted = formatTimestampForTooltip(point.x, tooltip.chart.options.time?.timezone);
      reduceTimestampSize = true;
    }

    let tooltipHtml: string = '';

    tooltipHtml += `<span style="font-size: ${
      reduceTimestampSize ? '0.8em' : '1em'
    }">${timestampFormatted}</span>`;

    tooltipHtml += `<table>`;

    const points: Highcharts.Point[] = (this as any).points || [point];

    points.map((point: Highcharts.Point) => {
      const unit = (point.series.options as any).tooltip?.valueSuffix || '';
      const valueDecimals = tooltip.options.valueDecimals || 3;

      let format = `1.${valueDecimals}-${valueDecimals}`;

      // TODO: replace harcoded check with semantic hint from backend
      const isWindDirection = point.series.name.includes('Wind direction');

      if (isWindDirection) {
        format = '1.0-0';
      }

      // This fixes temperature series in the first chart
      if (celsiusDegreeSymbols.indexOf(unit) >= 0) {
        format = '1.1-1';
      }

      let valueFormatted = formatValueForTooltip(point.y, unit, format);

      if (isWindDirection) {
        if (point.y !== null && point.y !== undefined) {
          const direction = getWindDirectionFromDegree8(point.y);
          if (direction) {
            // or use direction.degree for less specific rotation
            const rotateRule = `transform: rotate(${point.y}deg);`;
            const arrowHtml = `<span style="display: inline-block; ${rotateRule}">&uarr;</span>`;
            valueFormatted += ` (${direction.code} ${arrowHtml})`;
          }
        }
      }

      let legendSymbol = undefined; //point.series.legendItem?.symbol?.element?.outerHTML;

      if (legendSymbol) {
        legendSymbol = `<svg width='20' height='20'>${legendSymbol}</svg>`;
      } else {
        legendSymbol = '\u25CF';
      }

      tooltipHtml += `
          <tr>
            <td style="padding-right: 4px">
              <span style="color:${
                point.series.color
              }; padding-right: 0.125em;">${legendSymbol}</span>
              ${point.series.name}
            </td>
            <td style="text-align: right">
              <b style="display: inline-block; min-width: ${
                isWindDirection ? '100px' : '0px'
              }">${valueFormatted}</b>
            </td>
          </tr>`;
    });

    tooltipHtml += `</table>`;

    return tooltipHtml;
  },
};
