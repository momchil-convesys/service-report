import * as Highcharts from 'highcharts/highstock';

import 'highcharts/highcharts-more';
import 'highcharts/modules/accessibility';
import 'highcharts/modules/boost';
import 'highcharts/modules/no-data-to-display';
import 'highcharts/modules/pattern-fill';
import 'highcharts/modules/xrange';

// NOTE: Order of imports is important here!
import 'highcharts/modules/exporting';
// NOTE: Order of imports is important here!
import 'highcharts/modules/export-data';
// NOTE: Order of imports is important here!
import 'highcharts/modules/offline-exporting';

import { chartColors } from './constants';
import { highchartsLangOptions } from './highcharts-lang-options';

import * as XLSX from 'xlsx';

declare module 'highcharts' {
  interface Chart {
    downloadCSV: () => void;
    downloadXLS: () => void;
  }

  interface Point {
    key?: string | number;
    x2?: number;
  }

  interface TooltipFormatterContextObject {
    x2?: number;
  }

  interface TooltipOptions {
    fixed?: boolean;
    position?: any;
  }

  interface PointLabelObject {
    high?: number;
    low?: number;
    series: Highcharts.Series;
  }
}

Highcharts.setOptions({
  chart: {
    backgroundColor: '#FFFFFF',
    plotBorderColor: '#D4DCE3', // @border-color-base,
    borderColor: '#D4DCE3', // @border-color-base,
    style: {
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
    },
  },
  colors: chartColors,
  title: {
    text: undefined,
  },
  subtitle: {
    text: undefined,
  },
  tooltip: {
    hideDelay: 10, // default is 500
  },
  boost: {
    enabled: false,
    seriesThreshold: 20,
  },
  plotOptions: {
    series: {
      boostThreshold: 0, // disable boost by default
      animation: {
        duration: 300,
      },
    },
  },
  lang: highchartsLangOptions,
  noData: {
    style: {
      fontWeight: 'regular',
      fontSize: '36px',
      color: '#EDF0F3',
    },
  },
  yAxis: {
    gridLineColor: '#EDF0F3', // @border-color-split
    lineColor: '#D4DCE3', // @border-color-base
    tickColor: '#D4DCE3', // @border-color-base
    labels: {
      style: {
        color: 'rgba(0, 0, 0, 0.45)',
      },
    },
  },
  xAxis: {
    gridLineColor: '#EDF0F3', // @border-color-split
    lineColor: '#D4DCE3', // @border-color-base
    tickColor: '#D4DCE3', // @border-color-base
    labels: {
      style: {
        color: 'rgba(0, 0, 0, 0.45)',
      },
    },
    dateTimeLabelFormats: {
      hour: '%H:%M', // avoid "ч." suffix in BG locale
      minute: '%H:%M', // avoid "ч." suffix in BG locale
    },
  },
  exporting: {
    enabled: false, // disable by default
    sourceWidth: 1200,
    buttons: {
      contextButton: {
        menuItems: [
          'viewFullscreen',
          'separator',
          'downloadPNG',
          'downloadJPEG',
          'downloadPDF',
          'downloadSVG',
          'separator',
          'downloadCSV',
          'downloadXLS',
        ],
      },
    },
    csv: {
      // MS Excel will recognize any known datetime format and will display it according to user settings.
      // Adding '|' character is a workaround to make it display as a plain string (including the seconds).
      // dateFormat: '%Y-%m-%d | %H:%M:%S', // 2023-09-30 | 01:16:06
    },
    useMultiLevelHeaders: false,
    tableCaption: false,
  },
});

export const defaultXAxisLabelFormats: Highcharts.AxisDateTimeLabelFormatsOptions = {
  millisecond: '%H:%M:%S.%L',
  second: '%H:%M:%S',
  minute: '%H:%M',
  hour: '%H:%M',
  day: '%e. %b',
  week: '%e. %b',
  month: "%b '%y",
  year: '%Y',
};

/**
 * Crosshair for datetime axis is always a thin line.
 * With the following override a full point width cross hair can be enabled for any chart
 * by adding className: fullPointWidthCrosshairClassName in crosshair options.
 */
export const fullPointWidthCrosshairClassName = 'crosshair-class-name-full-point-width';
export const excludeSeriesFromCrossHairClassName = 'exclude-series-from-crosshair';
// export const seriesXRangeClassName = 'series-x-range';

(function (H) {
  H.wrap(
    H.Axis.prototype,
    'drawCrosshair',
    function (
      this: Highcharts.Axis,
      originalFunction,
      e?: Highcharts.PointerEventObject,
      point?: Highcharts.Point,
    ) {
      originalFunction.apply(this, e, point);

      const series: Highcharts.Series | undefined = point?.series;

      if (!series || !series.visible) {
        return;
      }

      if (
        this.isXAxis &&
        this.options.type === 'datetime' &&
        (this.crosshair as any)?.className === fullPointWidthCrosshairClassName
      ) {
        const points = series.points;

        let opacity = 0.25;
        let length = points.length > 1 ? (points[1].plotX || 0) - (points[0].plotX || 0) : 1;

        if (series.options.className === excludeSeriesFromCrossHairClassName) {
          length = 1;
          opacity = 0;
        }
        // else if (series.options.className === seriesXRangeClassName) {
        //   length = series.xAxis.toPixels(point.x2, false) - series.xAxis.toPixels(point.x, false);
        //   this.cross?.attr({
        //     stroke: H.Color.parse('#ffdb8c').setOpacity(opacity).get(),
        //     'stroke-width': length,
        //     transform: `translate(${length / 2}, 0)`,
        //     'z-index': 20,
        //   });
        //   return;
        // }

        (this as any).cross?.attr({
          stroke: H.Color.parse('#ccd3ff').setOpacity(opacity).get(),
          'stroke-width': length,
          // transform: `translate(0, 0)`,
        });
      }
    },
  );
})(Highcharts);

/**
 * Intercept data export to attach custom handler.
 */
(function (H) {
  H.wrap(H.Chart.prototype, 'getDataRows', function (this: typeof H, proceed, multiLevelHeaders) {
    if ((this as any).customExportCallback_getDataRows) {
      return (this as any).customExportCallback_getDataRows();
    }

    return proceed.call(this, multiLevelHeaders);
  });
})(Highcharts);

/**
 * WORKAROUND
 * Responsive rules do not apply when using update.
 * https://github.com/highcharts/highcharts/issues/10606
 */
(function (H) {
  H.addEvent(H.Chart, 'update', function (event) {
    if ((event as any)?.options && (event as any)?.options?.responsive) {
      this.userOptions.responsive = this.options.responsive = (event as any)?.options?.responsive;
    }
  });
})(Highcharts);

/**
 * Third party XLSX export
 */
(function (H) {
  if (H.getOptions().exporting) {
    H.Chart.prototype.downloadXLS = function () {
      const rows: (string | number | undefined)[][] = this.getDataRows(false);

      var workbook = XLSX.utils.book_new();
      var worksheet = XLSX.utils.aoa_to_sheet(rows, {});

      // create !cols array if it does not exist
      if (!worksheet['!cols']) worksheet['!cols'] = [];

      const headerRow = rows.length > 0 ? rows[0] : [];
      for (let columnIndex = 0; columnIndex < headerRow.length; columnIndex++) {
        const columnCells = rows.map((row) => row[columnIndex]);
        const maxWidth = columnCells.reduce(
          (currentMax: number, cellValue) =>
            Math.max(currentMax, (cellValue?.toString() || '').length),
          10,
        );

        // create column metadata object if it does not exist
        if (!worksheet['!cols'][columnIndex]) {
          worksheet['!cols'][columnIndex] = { wch: Number(maxWidth) };
        }
      }

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      const fileName = this.options?.exporting?.filename || $localize`ChartExport`;
      XLSX.writeFile(workbook, fileName + '.xlsx');
    };
  }
})(Highcharts);

export default Highcharts;
