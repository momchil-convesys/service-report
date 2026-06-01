import { chartColors, semanticColor_ActivePower } from '../../../../../constants';
import { updateTimeZoneSettings } from '../../../../../helpers';
import {
  syncedChartsClassName,
  syncedChartsSeriesPointEvents,
  xAxisEvents,
} from '../../../../../helpers/_charts-sync';
import Highcharts from '../../../../../highcharts-global-config';
import { BaseChartContext } from '../../../../../shared/base-chart-component/base-chart-component.component';
import { powerLimitSeriesColor } from '../../../../pv-charts/pv-plant-metrics/chart-constants';

import { MasterGwScheduledPowerLimitHistoricalData } from '../../_data/dto';
import { setData_Device, updateOptions_Device } from './chart-manipulation-device';
import { setData_Plant, updateOptions_Plant } from './chart-manipulation-plant';
import { tooltipFormatterHtmlTable } from './chart-tooltip';

export const commonChartOptions: Highcharts.Options = {
  chart: {
    className: syncedChartsClassName,
    plotBorderColor: '#D4DCE3', // @border-color-base,
    zooming: {
      type: 'x',
      mouseWheel: false,
    },
  },
  title: {
    align: 'left',
    margin: 0,
    style: {
      fontSize: '1em',
      fontWeight: '500',
    },
  },
  subtitle: {
    text: undefined,
  },
  xAxis: {
    type: 'datetime',
    crosshair: true,
    zoomEnabled: true,
    minRange: 1000 * 60 * 10, // 5 minute zoom
    scrollbar: {
      enabled: true,
    },
    events: xAxisEvents,
  },
  yAxis: [
    {
      labels: {
        enabled: true,
        formatter: function () {
          if (this.isFirst) {
            return `${this.value} kW`;
          }

          return `${this.value}`;
        },
      },
      title: {
        text: null,
      },
      opposite: true,
      maxPadding: 0,
      min: 0,
    },
  ],
  legend: {
    enabled: true,
  },
  tooltip: {
    valueSuffix: ' kW',
    distance: 30,
    shared: true,
    useHTML: true,
    animation: false,
    formatter: tooltipFormatterHtmlTable,
    // Position tooltip stick to the left or right of the chart
    // TODO: use shared function
    positioner: function (labelWidth, labelHeight, point) {
      const chartWidth = this.chart.chartWidth;

      // If tooltip is too wide
      // allow it to be displayed over y axis labels.
      const mayOverlapYAxis =
        labelWidth > chartWidth * 0.3 && labelHeight > this.chart.chartHeight * 0.2;

      const leftAnchor = mayOverlapYAxis ? 5 : this.chart.plotLeft;
      let x = leftAnchor;
      let y = this.chart.plotTop;

      // Show tooltip near left or right edge of the chart
      if (this.chart.plotLeft + point.plotX < chartWidth * 0.5) {
        const rightAnchor = mayOverlapYAxis
          ? chartWidth - 5
          : this.chart.plotLeft + this.chart.plotWidth;
        x = rightAnchor - labelWidth;
      }

      return { x, y };
    },
  },
  plotOptions: {
    series: {
      dataGrouping: {
        enabled: true,
        dateTimeLabelFormats: {
          minute: ['%b %e, %H:%M:%S', '%b %e, %H:%M:%S', '–%H:%M:%S'],
        },
      },
      point: {
        events: syncedChartsSeriesPointEvents,
      },
      gapSize: 1000 * 60 * 5, // 5 min
      gapUnit: 'value',
    },
  },
  series: [
    {
      name: $localize`Scheduled power limit (requested)`,
      type: 'spline',
      color: chartColors[5],
      dashStyle: 'ShortDash',
      lineWidth: 2,
      zIndex: 2,
      marker: {
        enabled: false,
      },
    },
    {
      name: $localize`Scheduled power limit (set)`,
      type: 'areaspline',
      color: powerLimitSeriesColor,
      fillColor: '#ffdb8c33',
      threshold: Infinity,
      zIndex: 1,
      marker: {
        symbol: 'square',
        radius: 3,
        enabledThreshold: 4,
      },
    },
    {
      name: $localize`Scheduled power limit (reported)`,
      type: 'areaspline',
      color: semanticColor_ActivePower,
      fillColor: semanticColor_ActivePower + '88',
      states: {
        inactive: {
          enabled: false,
        },
      },
      // zoneAxis: 'x',
    },
  ],
};

export function updateChartData(
  chart: Highcharts.Chart,
  data: MasterGwScheduledPowerLimitHistoricalData | undefined,
  context: BaseChartContext | null,
) {
  if (context) {
    if (context.deviceId) {
      updateOptions_Device(chart, context);
    } else {
      updateOptions_Plant(chart, context);
    }
  }

  updateTimeZoneSettings(chart, context?.plant.timeZone, false);

  const currentMin = chart.xAxis[0].options.min;
  const currentMax = chart.xAxis[0].options.max;

  const newMin = context?.targetRange?.from.getTime();
  const newMax = context?.targetRange?.to.getTime();

  if (currentMin !== newMin && currentMax !== newMax) {
    chart.xAxis[0].update(
      {
        min: newMin,
        max: newMax,
      },
      false,
    );
    chart.zoomOut();
  }

  if (!data || data.dataPoints.length === 0) {
    chart.series.forEach((s) => s.setData([], false, false));
    chart.zoomOut();

    return;
  }

  if (!context) {
    return;
  }

  if (context.deviceId) {
    setData_Device(chart, data, context);
  } else {
    setData_Plant(chart, data, context);
  }
}
