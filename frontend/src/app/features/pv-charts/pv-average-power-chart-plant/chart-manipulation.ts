import { formatNumber } from '@angular/common';
import { differenceInHours } from 'date-fns';
import { chartColors } from '../../../constants';
import {
  integrationPeriodInMilliseconds,
  multiplierForValue,
  powerUnitForMultiplier,
  updateTimeZoneSettings,
} from '../../../helpers';
import Highcharts from '../../../highcharts-global-config';
import { BaseChartContext } from '../../../shared/base-chart-component/base-chart-component.component';

import { APP_LOCALE_ID } from '../../../app-locale';
import {
  selectionEventHandler,
  updateDatetimeAxisRange,
  xAxisOptions,
} from '../_shared/pv-charts-column-datetime-axis';
import { PVAveragePowerData } from './_data/pv-average-power.model';
import { updateExportingOptions } from './chart-exporting';
import { tooltip } from './chart-tooltip';

export const chartOptions: Highcharts.Options = {
  chart: {
    plotBorderColor: '#D4DCE3', // @border-color-base,
    zooming: {
      type: 'x',
      mouseWheel: false,
    },
    spacingBottom: 5, // compensate for legend bottom spacing
    spacingTop: 18, // default is 10

    events: {
      selection: function (event: Highcharts.SelectEventObject) {
        return selectionEventHandler(this, event);
      },
    },
  },
  xAxis: xAxisOptions,
  yAxis: {
    title: {
      text: undefined,
    },
    showEmpty: true,
    min: 0,
    tickAmount: 4,
    labels: {
      formatter: function () {
        const dataMax = this.chart.yAxis[0].max; // this.chart.series[0].dataMax;

        const multiplier = dataMax ? multiplierForValue(dataMax) : 1;
        const unit = powerUnitForMultiplier(multiplier);

        const scaledValue = Number(this.value) * multiplier;

        let result = scaledValue.toString();

        if (this.isFirst) {
          result += ` ${unit}`;
        }

        return result;
      },
    },
  },
  legend: {
    enabled: true,
  },
  tooltip: tooltip,
  plotOptions: {},
  series: [
    {
      type: 'column',
      name: $localize`Average power`,
      data: [],
      // gapSize: 1000 * 60 * 15, // 15 min
      // gapUnit: 'value',
      color: chartColors[8],
      events: {
        // Disable hide
        legendItemClick: function (e: Highcharts.SeriesLegendItemClickEventObject) {
          e.preventDefault();
          return false;
        },
      },
      pointPlacement: -0.5,
      pointPadding: 0,
      groupPadding: 0,
      dataGrouping: {
        enabled: false,
      },
      dataLabels: {
        enabled: true,
        formatter: function () {
          const dataMax = this.series.dataMax;
          const multiplier = dataMax ? multiplierForValue(dataMax) : 1;
          const scaledValue = Number(this.y) * multiplier;

          return formatNumber(scaledValue, APP_LOCALE_ID, scaledValue === 0 ? '1.0-0' : '1.0-1');
        },
      },
    },
  ],
  responsive: {
    rules: [
      {
        condition: {
          maxWidth: 400,
        },
        chartOptions: {
          yAxis: {
            tickAmount: 2,
            showFirstLabel: false,
            labels: {
              align: 'left',
              formatter: function () {
                const dataMax = this.chart.series[0].dataMax;

                const multiplier = dataMax ? multiplierForValue(dataMax) : 1;
                const unit = powerUnitForMultiplier(multiplier);

                return ` ${unit}`;
              },
              x: 0,
              y: -5,
            },
          },
        },
      },
    ],
  },
};

export function updateChartData(
  chart: Highcharts.Chart,
  data: PVAveragePowerData | undefined,
  context: BaseChartContext | null,
) {
  updateExportingOptions(chart, data, context, $localize`Average power (kW)`);

  if (!data || data.dataPoints.length === 0) {
    chart.series.forEach((s) => s.setData([], false, false));
    chart.zoomOut();

    return;
  }

  let dataLabelsEnabled = false;

  if (
    context?.targetRange &&
    differenceInHours(context.targetRange.to, context.targetRange.from) < 24
  ) {
    dataLabelsEnabled = true;
  }

  chart.update(
    {
      plotOptions: {
        column: {
          dataLabels: {
            enabled: dataLabelsEnabled,
          },
          pointRange: integrationPeriodInMilliseconds(data.integrationPeriod),
        },
      },
    },
    false,
  );

  updateTimeZoneSettings(chart, context?.plant.timeZone, false);

  // Set y maximum before setting data to avoid series scale animation

  updateValuesAxisScale(chart, data, context);

  setData(chart, data, context);

  updateDatetimeAxisRange(chart, data.integrationPeriod, context);
}

function setData(
  chart: Highcharts.Chart,
  data: PVAveragePowerData,
  context: BaseChartContext | null,
) {
  const dataPoints = data.dataPoints;

  const seriesData: Highcharts.PointOptionsType[] = dataPoints.map((point) => [
    point.timestamp.getTime(),
    point.value,
  ]);
  chart.series[0].setData(seriesData, false, false);
}

function updateValuesAxisScale(
  chart: Highcharts.Chart,
  data: PVAveragePowerData | undefined,
  context: BaseChartContext | null,
) {
  const maxPowerValues: number[] =
    (context?.plant.devices || [])
      .map((device) => device.deviceSpecificMetadata.deviceMaxPower)
      .filter((x): x is number => x !== undefined && x !== null) || [];
  const maxPowerValueForPlant = maxPowerValues.reduce((partialSum, a) => partialSum + a, 0);

  chart.yAxis[0]?.update({ max: maxPowerValueForPlant || undefined }, false);
}
