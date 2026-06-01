import { formatDate } from '@angular/common';
import { addHours } from 'date-fns';
import { APP_LOCALE_ID } from '../../../../app-locale';
import { chartColors } from '../../../../constants';
import Highcharts, { fullPointWidthCrosshairClassName } from '../../../../highcharts-global-config';
import {
  priceSeriesColor,
  seriesColor_MinPriceSetting,
  seriesId_DisabledExportToGrid,
  seriesId_MinPriceSetting,
  seriesId_Price,
} from '../chart-common-definitions';
import { renderCustomLines } from '../chart-custom-lines';

const pricePointValueSuffix = ' BGN&thinsp;/&thinsp;MWh';

const disabledExportColor = chartColors[5] + '22';

export const chartOptions: Highcharts.Options = {
  chart: {
    plotBorderColor: '#D4DCE3', // @border-color-base,
    spacingTop: 18, // default is 10
    events: {
      render: function () {
        renderCustomLines(this, seriesColor_MinPriceSetting, seriesId_MinPriceSetting);
      },
    },
  },
  title: {
    text: 'Grid Export Prices and Schedule',
  },
  xAxis: {
    type: 'datetime',
    crosshair: {
      className: fullPointWidthCrosshairClassName,
    },
    tickInterval: 3600 * 1000,
    dateTimeLabelFormats: {
      hour: '%H',
      day: '%H',
    },
  },
  yAxis: [
    {
      opposite: true,
      labels: {
        enabled: true,
        style: {
          color: priceSeriesColor,
        },
        formatter: function () {
          if (this.isFirst) {
            return `${this.value} BGN&thinsp;/&thinsp;MWh`;
          }

          return `${this.value}`;
        },
      },
      title: {
        text: null,
      },
    },
    {
      // Enabled / disabled export

      min: 0,
      max: 1,
      title: {
        text: null,
      },
      tickAmount: 2,
      visible: false,
    },
  ],
  legend: {
    enabled: false,
  },
  tooltip: {
    shared: true,
    useHTML: true,
    style: {
      fontSize: '1em',
    },
    positioner: function (labelWidth, labelHeight, point) {
      const defaultPosition = this.getPosition(labelWidth, labelHeight, point);

      // Show tooltip above the chart

      return { x: defaultPosition.x, y: 15 };
    },
    formatter: function (tooltip) {
      const points: Highcharts.Point[] = (this as any).points;

      if (!points) {
        return tooltip.defaultFormatter.call(this, tooltip);
      }

      const pricePoint = points.find((point) => point.series.options.id === seriesId_Price);

      if (!pricePoint) {
        return tooltip.defaultFormatter.call(this, tooltip);
      }

      const gridExportPoint = points.find(
        (point) => point.series.options.id === seriesId_DisabledExportToGrid,
      );

      const minPricePoint = points.find(
        (point) => point.series.options.id === seriesId_MinPriceSetting,
      );

      const timestamp = new Date(pricePoint.x as number);
      const timestampEnd = addHours(timestamp, 1);

      const borderSpacing = '0.125';

      let tooltipHtml = `

        <table style="border-spacing: ${borderSpacing}; border-collapse: separate; min-width: 200px">

          <tr>
            <td colspan=2 style="text-align: left; line-height: 1.0">
              <span class="secondary-text-size">
                ${formatDate(timestamp, 'd MMMM, HH:mm', APP_LOCALE_ID)}–${formatDate(
                  timestampEnd,
                  'HH:mm',
                  APP_LOCALE_ID,
                )}
              </span>
            </td>
          </tr>

          <tr>
            <td>
              <span style="color:${
                gridExportPoint?.y ? '#d9343a' : pricePoint.series.color
              }; padding-right: 0.25em">\u25CF</span>
              ${pricePoint.series.name}
            </td>
            <td style="text-align: right; padding-left: 0.5em; font-weight: bold">
              ${pricePoint.y}${pricePointValueSuffix || ''}
            </td>
          </tr>

          <tr>
            <td>
              <b style="color:${seriesColor_MinPriceSetting}; padding-right: 0.25em">\u2014</b>
              ${minPricePoint?.series.name}
            </td>
            <td style="text-align: right; padding-left: 0.5em; font-weight: bold">
              ${minPricePoint?.y}${pricePointValueSuffix || ''}
            </td>
          </tr>

        </table>

      `;

      if (gridExportPoint && gridExportPoint.y === 1) {
        tooltipHtml += `
        <div style="
          background: ${disabledExportColor}; 
          padding: 8px 8px; 
          margin-top: 4px; 
          color: #d9343a;
          font-weight: bold;
          text-align: center
          ">
          No Export
        </div>
        `;
      }

      return tooltipHtml;
    },
  },
  plotOptions: {
    column: {
      grouping: false,
    },
  },
  series: [
    {
      id: seriesId_Price,
      type: 'line',
      // step: 'center',
      name: 'Price',
      color: priceSeriesColor,
      marker: {
        radius: 3,
      },
      data: [],
      dataLabels: {
        enabled: false,
      },
      lineWidth: 1,
      pointRange: 3600 * 1000,
      pointPlacement: 0.5,
      states: {
        hover: {
          // Prevent series line getting thicker
          // than the custom rendered line behing it
          lineWidthPlus: 0,
        },
      },
      tooltip: {
        valueDecimals: 1,
        valueSuffix: pricePointValueSuffix,
      },
    },
    {
      id: seriesId_MinPriceSetting,
      type: 'column',
      // step: 'center',
      name: 'Minimum Price',
      color: seriesColor_MinPriceSetting + '11',
      borderWidth: 0,
      borderRadius: 0,
      // marker: {
      //   radius: 1,
      // },
      data: [],
      dataLabels: {
        enabled: false,
      },
      // lineWidth: 1,
      pointRange: 3600 * 1000,
      pointPlacement: 0.5,
      groupPadding: 0,
      pointPadding: 0,
      states: {
        hover: {
          // Prevent series line getting thicker
          // than the custom rendered line behing it
          lineWidthPlus: 0,
        },
      },
      tooltip: {
        valueDecimals: 1,
        valueSuffix: pricePointValueSuffix,
      },
    },
    {
      id: seriesId_DisabledExportToGrid,
      type: 'column',
      // step: 'center',
      // pointPadding: 0,
      groupPadding: 0,
      // threshold: 0,
      name: 'Disabled export to grid',
      color: chartColors[5] + '11', //disabledExportColor,
      borderRadius: 0,
      borderWidth: 0,
      yAxis: 1,
      pointRange: 3600 * 1000,
      pointPlacement: 0.5,
      states: {
        inactive: {
          enabled: false,
        },
      },
      dataLabels: {
        enabled: true,
        format: 'NE',
        style: {
          color: '#d9343a',
          textOutline: 'none',
        },
      },
      // enableMouseTracking: false, // disables tooltip
    },
  ],
};
