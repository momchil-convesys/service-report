import Highcharts, { fullPointWidthCrosshairClassName } from '../../../../highcharts-global-config';
import {
  columnLikeSeries_SharedOptions,
  fakeYAxisMaximum,
} from '../../../pv-charts/pv-production-chart/chart-common';
import {
  seriesOptions_ScheduleTarget,
  updateSeriesOptions_ScheduleTarget,
} from '../../../pv-charts/pv-production-chart/chart-series-schedule-target';
import { seriesOptions_SharedColumnHover } from '../../../pv-charts/pv-production-chart/chart-series-shared-column-hover';
import { plsUnitsMap, PowerLimitSchedule } from '../../_data/models';
import { updateSeriesData_ScheduleTarget } from '../chart-series-schedule-target';
import {
  seriesOptions_ScheduleTargetFill,
  updateSeriesData_ScheduleTargetFill,
} from '../chart-series-schedule-target-fill';
import { updateSeriesData_SharedColumnHover } from '../chart-series-shared-column-hover';
import { tooltip } from '../chart-tooltip';

const baseTitle = $localize`Target limit`;

const titleMap: { [key in 'energy' | 'power']: string } = {
  energy: $localize`Energy production limit`,
  power: $localize`Active power limit`,
};

const subtitleMap: { [key in 'energy' | 'power']: string } = {
  energy: $localize`Limit plant energy production`,
  power: $localize`Limit plant active power`,
};

export const chartOptions: Highcharts.Options = {
  chart: {
    plotBorderColor: '#D4DCE3', // @border-color-base,
    spacingTop: 18, // default is 10
    zooming: {
      type: 'x',
      mouseWheel: false,
    },
  },
  title: {
    text: baseTitle,
  },
  xAxis: {
    type: 'datetime',
    crosshair: {
      className: fullPointWidthCrosshairClassName,
    },
    scrollbar: {
      enabled: true,
    },
    showLastLabel: false,
  },
  yAxis: [
    {
      opposite: true,
      labels: {
        enabled: true,
      },
      title: {
        text: undefined,
      },
    },
    {
      // Y axis for fake column hover
      min: 0,
      max: fakeYAxisMaximum,
      tickAmount: 2,
      visible: false,
    },
  ],
  legend: {
    enabled: false,
  },
  tooltip: tooltip,
  plotOptions: {
    column: {
      ...columnLikeSeries_SharedOptions,
      pointPlacement: 0.5,
    },
    columnrange: columnLikeSeries_SharedOptions,
  },
  series: [
    ...seriesOptions_SharedColumnHover,
    ...seriesOptions_ScheduleTarget,
    ...seriesOptions_ScheduleTargetFill,
  ],
};

export function updateOptionsAccordingToData(
  chart: Highcharts.Chart,
  data: PowerLimitSchedule | undefined,
) {
  if (!data) {
    return;
  }

  chart.update(
    {
      title: {
        text: titleMap[data.limitType],
      },
      subtitle: {
        text: subtitleMap[data.limitType],
      },
      yAxis: {
        labels: {
          formatter: function () {
            if (this.isFirst) {
              return `${this.value} ${plsUnitsMap[data.limitType]}`;
            }

            return `${this.value}`;
          },
        },
      },
      plotOptions: {
        series: {
          pointRange: data.integrationPeriodMinutes * 60 * 1000,
        },
      },
      tooltip: {
        valueSuffix: plsUnitsMap[data.limitType],
      },
    },
    false,
  );

  updateSeriesOptions_ScheduleTarget(chart, true, data.powerLimitTargetCoefficient);
}

export function updateData(chart: Highcharts.Chart, data: PowerLimitSchedule | undefined) {
  updateSeriesData_ScheduleTarget(chart, data);
  updateSeriesData_SharedColumnHover(chart, data);
  updateSeriesData_ScheduleTargetFill(chart, data);
}
