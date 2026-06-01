import { IntegrationPeriod } from '../../../constants';
import {
  BaseUnit,
  getMaxValueFromAllSeries,
  integrationPeriodInMilliseconds,
  scaleAndFormatValue,
  updateTimeZoneSettings,
  yAxisFormatter_ScaleValue,
} from '../../../helpers';
import {
  syncedChartsClassName,
  syncedChartsSeriesPointEvents,
} from '../../../helpers/_charts-sync';
import Highcharts from '../../../highcharts-global-config';
import { BaseChartContext } from '../../../shared/base-chart-component/base-chart-component.component';
import { PowerMetersCumulativeData } from '../../extended-plant-metrics/_data/models';
import { updateDatetimeAxisRange, xAxisOptions } from './chart-datetime-axis';
import { seriesOptions_Energy, updateSeriesData_Energy } from './chart-series-energy';
import {
  seriesOptions_Calculated_ReactiveEnergy,
  updateSeriesData_Calculated_ReactiveEnergy,
} from './chart-series-penalty';
import {
  seriesOptions_ReactiveEnergy,
  updateSeriesData_ReactiveEnergy,
} from './chart-series-reactive-energy';
import { tooltip } from './chart-tooltip';

const sharedChartOptions: Highcharts.Options = {
  chart: {
    plotBorderColor: '#D4DCE3', // @border-color-base,
    zooming: {
      type: 'x',
      mouseWheel: false,
    },
    className: syncedChartsClassName,
    spacingLeft: 0,
    spacingRight: 0,

    marginLeft: 0,
    marginRight: 80,
  },
  xAxis: xAxisOptions,
  legend: {
    enabled: true,
    verticalAlign: 'top',
    align: 'left',
    layout: 'vertical',
    floating: true,
    backgroundColor: '#F5F7F8',
    useHTML: false,
    itemMarginBottom: 0,
    itemMarginTop: 0,
    labelFormatter: function () {
      const customLegendLabel = this.options.custom
        ? this.options.custom['legendLabel']
        : undefined;
      return customLegendLabel || this.options.name;
    },
  },
  title: {
    align: 'left',
  },
  plotOptions: {
    column: {
      groupPadding: 0,
      pointPadding: 0,
      pointPlacement: 0.5,
      borderWidth: 2,
    },
    series: {
      getExtremesFromAll: true,
      point: {
        events: syncedChartsSeriesPointEvents,
      },
      dataLabels: {
        enabled: true,
        formatter: function (context) {
          // Show labels only if there is enough space
          // if ((this as any).pointWidth < 30) {
          //   return null;
          // }

          // Show only non zero values
          if (this.y) {
            const dataMax = getMaxValueFromAllSeries(this.series.chart);

            return scaleAndFormatValue(this.y, dataMax, undefined);
          }

          return '';
        },
      },
    },
  },

  tooltip: tooltip,
};

const sharedYAxisOptions = (baseUnit: BaseUnit): Highcharts.YAxisOptions => ({
  title: {
    text: undefined,
  },
  labels: {
    formatter: function (context) {
      const dataMax = getMaxValueFromAllSeries(context.chart);

      return yAxisFormatter_ScaleValue(context, baseUnit, dataMax);
    },
  },
  opposite: true,
  tickAmount: 4,
  min: 0,
  minPadding: 0,
  maxPadding: 1, // leave space for the tooltip
});

const sharedResponsiveOptions = (baseUnit: BaseUnit): Highcharts.ResponsiveOptions => ({
  rules: [
    {
      condition: {
        maxWidth: 400,
      },
      chartOptions: {
        chart: {
          marginRight: undefined,
        },
        yAxis: {
          tickAmount: 2,
          showFirstLabel: false,
          labels: {
            align: 'right',
            formatter: function (context) {
              const dataMax = getMaxValueFromAllSeries(context.chart);

              return yAxisFormatter_ScaleValue(context, baseUnit, dataMax, true);
            },
            x: 0,
            y: 16,
          },
        },
      },
    },
  ],
});

export const chartOptions_Energy: Highcharts.Options = {
  ...sharedChartOptions,
  yAxis: sharedYAxisOptions('Wh'),
  series: seriesOptions_Energy,
  responsive: sharedResponsiveOptions('Wh'),
};

export const chartOptions_ReactiveEnergy: Highcharts.Options = {
  ...sharedChartOptions,
  yAxis: sharedYAxisOptions('VARh'),
  series: seriesOptions_ReactiveEnergy,
  responsive: sharedResponsiveOptions('VARh'),
};

export const chartOptions_Penalty: Highcharts.Options = {
  ...sharedChartOptions,
  yAxis: sharedYAxisOptions('VARh'),
  series: seriesOptions_Calculated_ReactiveEnergy,
  responsive: sharedResponsiveOptions('VARh'),
};

export function updateChartData(
  chart: Highcharts.Chart,
  data: PowerMetersCumulativeData | undefined,
  context: BaseChartContext | null,
) {
  if (!data || data.dataPoints.length === 0) {
    chart.series.forEach((s) => s.setData([], false, false));
    chart.zoomOut();

    return;
  }

  updateTimeZoneSettings(chart, context?.plant.timeZone, false);

  updateColumnSeriesOptions(chart, data, context);

  updateSeriesData_Energy(chart, data);
  updateSeriesData_ReactiveEnergy(chart, data);
  updateSeriesData_Calculated_ReactiveEnergy(chart, data);

  updateDatetimeAxisRange(chart, data.integrationPeriod, context, 0);

  // Update visible tooltips for synced charts when data is updated live
  const hoveredPoints = chart.hoverPoints;
  if (hoveredPoints?.length) {
    const newPoints: Highcharts.Point[] = hoveredPoints.map((p) => p.series.points[p.index]);
    chart.tooltip.refresh(newPoints);
  }
}

function updateColumnSeriesOptions(
  chart: Highcharts.Chart,
  data: PowerMetersCumulativeData,
  context: BaseChartContext | null,
) {
  let targetIntegrationPeriod: IntegrationPeriod =
    context?.targetRange?.integrationPeriod || data.integrationPeriod;

  let pointPlacement: string | number = 'on';
  if (
    targetIntegrationPeriod === IntegrationPeriod.Hours ||
    targetIntegrationPeriod === IntegrationPeriod.QuaterOfAnHour
  ) {
    pointPlacement = 0.5;
  }

  let crisp = true;
  if (targetIntegrationPeriod === IntegrationPeriod.QuaterOfAnHour) {
    crisp = false;
  }

  const seriesOptions: Highcharts.SeriesOptionsType = {
    type: 'column',
    pointRange: integrationPeriodInMilliseconds(targetIntegrationPeriod),
    pointPlacement: pointPlacement,
    // Leave more space between points as months are irregular intervals
    // and should be displayed with categories axis instead of datetime.
    // https://stackoverflow.com/questions/52860673/highcharts-month-xaxis-has-uneven-space-after-february-column
    pointPadding: targetIntegrationPeriod === 'months' ? 0.1 : 0,
    crisp,
  };

  chart.update(
    {
      plotOptions: {
        column: {
          ...seriesOptions,
        },
      },
    },
    false,
  );
}
