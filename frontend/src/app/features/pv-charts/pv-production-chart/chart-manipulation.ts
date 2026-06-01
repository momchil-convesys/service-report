import { IntegrationPeriod } from '../../../constants';
import {
  energyUnitForMultiplier,
  integrationPeriodInMilliseconds,
  multiplierForValue,
  seriesById,
  updateTimeZoneSettings,
  yAxisFormatter_ScaleValue,
} from '../../../helpers';
import { BaseChartContext } from '../../../shared/base-chart-component/base-chart-component.component';
import {
  selectionEventHandler,
  updateDatetimeAxisRange,
  xAxisOptions,
} from '../_shared/pv-charts-column-datetime-axis';
import { PVProductionData } from './_data/pv-production';
import { renderInvalid, renderNulls } from './chart-custom-rendering';

import Highcharts from '../../../highcharts-global-config';

import { columnLikeSeries_SharedOptions, fakeYAxisMaximum } from './chart-common';
import { updateExportingOptions } from './chart-exporting';
import {
  seriesId_EnergyProduction,
  seriesOptions_EnergyProduction,
  updateSeriesData_EnergyProduction,
  updateSeriesOptions_EnergyProduction,
} from './chart-series-energy-production';
import {
  seriesOptions_EnergyProduction_Excess,
  updateSeriesData_EnergyProduction_Excess,
  updateSeriesOptions_EnergyProduction_Excess,
} from './chart-series-energy-production-excess';
import {
  seriesOptions_EnergyProduction_Shortage,
  updateSeriesData_EnergyProduction_Shortage,
  updateSeriesOptions_EnergyProduction_Shortage,
} from './chart-series-energy-production-shortage';
import {
  seriesOptions_ExternalSystemControl,
  updateSeriesData_ExternalSystemControl,
} from './chart-series-external-system-control';
import {
  seriesOptions_ManualControl,
  updateSeriesData_ManualControl,
} from './chart-series-manual-control';
import {
  seriesOptions_ScheduleStatus,
  updateSeriesData_ScheduleStatus,
} from './chart-series-schedule-status';
import {
  seriesOptions_ScheduleTarget,
  updateSeriesData_ScheduleTarget,
  updateSeriesOptions_ScheduleTarget,
} from './chart-series-schedule-target';
import {
  seriesOptions_SharedColumnHover,
  updateSeriesData_SharedColumnHover,
  updateSeriesOptions_SharedColumnHover,
} from './chart-series-shared-column-hover';
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

    alignTicks: false,

    events: {
      render: function () {
        const productionSeries = seriesById(this, seriesId_EnergyProduction);
        if (!productionSeries) {
          return;
        }

        renderNulls(this, [productionSeries]);
        renderInvalid(this, [productionSeries]);
      },
      selection: function (event: Highcharts.SelectEventObject) {
        return selectionEventHandler(this, event);
      },
    },
  },

  xAxis: [xAxisOptions],
  yAxis: [
    {
      title: {
        text: undefined,
      },
      min: 0,
      minPadding: 0.1,
      softMin: 0,
      maxPadding: 0.5,
      tickAmount: 4,
      labels: {
        formatter: function (context) {
          const dataMax = seriesById(context.chart, seriesId_EnergyProduction)?.dataMax;

          return yAxisFormatter_ScaleValue(context, 'Wh', dataMax);
        },
      },
      endOnTick: false,
    },
    {
      // Y axis for schedule status
      min: 0,
      max: fakeYAxisMaximum,
      tickAmount: 2,
      visible: false,
    },
  ],
  legend: {
    enabled: true,
  },
  tooltip: tooltip,
  plotOptions: {
    column: columnLikeSeries_SharedOptions,
    columnrange: columnLikeSeries_SharedOptions,
    series: {
      getExtremesFromAll: true,
    },
  },
  responsive: {
    rules: [
      {
        condition: {
          maxWidth: 400,
        },
        chartOptions: {
          yAxis: [
            {
              tickAmount: 2,
              showFirstLabel: false,
              labels: {
                align: 'left',
                formatter: function (context) {
                  const dataMax = seriesById(context.chart, seriesId_EnergyProduction)?.dataMax;

                  const multiplier = dataMax ? multiplierForValue(dataMax) : 1;
                  const unit = energyUnitForMultiplier(multiplier);

                  return ` ${unit}`;
                },
                x: 0,
                y: -5,
              },
            },
            {},
          ],
        },
      },
    ],
  },
};

export function updateChartData(
  chart: Highcharts.Chart,
  data: PVProductionData | undefined,
  context: BaseChartContext | null,
) {
  updateExportingOptions(chart, data, context, $localize`Production (kWh)`);

  if (!data || data.productionDataPoints.length === 0) {
    chart.series.forEach((s) => s.setData([], false, false));
    chart.zoomOut();

    return;
  }

  updateTimeZoneSettings(chart, data.timeZone, false);

  let targetIntegrationPeriod: IntegrationPeriod =
    context?.targetRange?.integrationPeriod || data.integrationPeriod;

  let pointPlacement: string | number = 'on';
  if (
    targetIntegrationPeriod === IntegrationPeriod.Hours ||
    targetIntegrationPeriod === IntegrationPeriod.QuaterOfAnHour
  ) {
    pointPlacement = 0.5;
  }

  if (chart.series.length === 0) {
    addAllSeries(chart);
  }

  const productionSeriesUpdateObject: Highcharts.SeriesOptionsType = {
    type: 'column',
    pointRange: integrationPeriodInMilliseconds(targetIntegrationPeriod),
    pointPlacement: pointPlacement,
    // Leave more space between points as months are irregular intervals
    // and should be displayed with categories axis instead of datetime.
    // https://stackoverflow.com/questions/52860673/highcharts-month-xaxis-has-uneven-space-after-february-column
    pointPadding: targetIntegrationPeriod === 'months' ? 0.1 : 0,
  };

  chart.update(
    {
      plotOptions: {
        column: {
          ...productionSeriesUpdateObject,
        },
        columnrange: {
          ...productionSeriesUpdateObject,
        },
      },
    },
    false,
  );

  updateSeriesOptions_EnergyProduction(chart, data);
  updateSeriesOptions_SharedColumnHover(chart, data);
  updateSeriesOptions_ScheduleTarget(
    chart,
    !!data.targetPowerLimitData,
    data.powerLimitTargetCoefficient,
  );
  updateSeriesOptions_EnergyProduction_Excess(chart, data);
  updateSeriesOptions_EnergyProduction_Shortage(chart, data);

  //----------------------------------------------------------------------------
  // Update data

  updateSeriesData_EnergyProduction(chart, data);
  updateSeriesData_EnergyProduction_Excess(chart, data);
  updateSeriesData_EnergyProduction_Shortage(chart, data);

  updateSeriesData_SharedColumnHover(chart, data);

  updateSeriesData_ScheduleTarget(chart, data);
  updateSeriesData_ScheduleStatus(chart, data);
  updateSeriesData_ManualControl(chart, data);
  updateSeriesData_ExternalSystemControl(chart, data);

  //----------------------------------------------------------------------------

  chart.yAxis[0].update(
    {
      endOnTick: !data.scheduleStatusHistory,
    },
    // Refresh y axis after setting data.
    // Otherwise axis is rescaled when hiding target power limit series.
    true,
  );

  updateDatetimeAxisRange(chart, data.integrationPeriod, context, 0);
}

function addAllSeries(chart: Highcharts.Chart) {
  // NOTE: series order is important for shared tooltip

  seriesOptions_ScheduleStatus.forEach((s) => chart.addSeries(s, false));
  seriesOptions_ManualControl.forEach((s) => chart.addSeries(s, false));
  seriesOptions_ExternalSystemControl.forEach((s) => chart.addSeries(s, false));

  seriesOptions_SharedColumnHover.forEach((s) => chart.addSeries(s, false));
  seriesOptions_EnergyProduction.forEach((s) => chart.addSeries(s, false));

  seriesOptions_EnergyProduction_Excess.forEach((s) => chart.addSeries(s, false));
  seriesOptions_EnergyProduction_Shortage.forEach((s) => chart.addSeries(s, false));
  seriesOptions_ScheduleTarget.forEach((s) => chart.addSeries(s, false));
}
