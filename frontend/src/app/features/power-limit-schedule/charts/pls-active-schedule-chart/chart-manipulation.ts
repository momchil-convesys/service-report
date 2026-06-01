import Highcharts, { fullPointWidthCrosshairClassName } from '../../../../highcharts-global-config';

import { ActivePowerLimitSchedule } from '../../_data/active-schedule';
import {
  seriesColor_TargetPowerLimit,
  seriesColor_TargetPowerLimitAdjusted,
  seriesId_TargetPowerLimit,
  seriesId_TargetPowerLimitAdjusted,
} from '../chart-common-definitions';
import { renderCustomLines } from '../chart-custom-lines';
import { dataLabels_TargetPowerLimit } from '../chart-data-labels';
import { renderNulls } from '../chart-nulls';
import { tooltip } from '../chart-tooltip';

const currentRecordPlotBandId = 'current_record';

export const chartOptions: Highcharts.Options = {
  chart: {
    plotBorderColor: '#D4DCE3', // @border-color-base,
    zooming: {
      type: 'x',
      mouseWheel: false,
    },
    spacingTop: 18, // default is 10
    events: {
      render: function () {
        renderNulls(this);
        renderCustomLines(this);
      },
    },
  },
  title: {
    text: 'Upcoming power limit by hour',
  },
  subtitle: {
    text: 'Shows values that are already queued in GW memory',
  },
  navigation: {
    buttonOptions: {
      enabled: true,
    },
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
    minPadding: 0.05,
    scrollbar: {
      enabled: true,
    },
  },
  yAxis: [
    {
      opposite: true,
      labels: {
        enabled: true,
        formatter: function () {
          if (this.isFirst) {
            return `${this.value} MWh`;
          }

          return `${this.value}`;
        },
      },
      title: {
        text: undefined,
      },
      softMin: 0,
      tickAmount: 4,
    },
  ],
  legend: {
    enabled: false,
  },
  tooltip: tooltip,
  series: [
    {
      id: seriesId_TargetPowerLimit,
      type: 'line',
      step: 'center',
      name: 'Target power limit',
      color: seriesColor_TargetPowerLimit,
      marker: {
        radius: 1,
      },
      data: [],
      dataLabels: dataLabels_TargetPowerLimit,
      pointRange: 3600 * 1000,
      pointPlacement: -0.5,
      states: {
        hover: {
          // Prevent series line getting thicker
          // than the custom rendered line behing it
          lineWidthPlus: 0,
        },
      },
    },
    {
      id: seriesId_TargetPowerLimitAdjusted,
      type: 'line',
      step: 'center',
      name: 'Target power limit adjusted',
      color: seriesColor_TargetPowerLimitAdjusted,
      marker: {
        radius: 1,
      },
      data: [],
      dataLabels: dataLabels_TargetPowerLimit,
      pointRange: 3600 * 1000,
      pointPlacement: -0.5,
      states: {
        hover: {
          // Prevent series line getting thicker
          // than the custom rendered line behing it
          lineWidthPlus: 0,
        },
      },
    },
  ],
};

export function updateChartData(
  chart: Highcharts.Chart,
  activeSchedule: ActivePowerLimitSchedule | undefined,
) {
  // if (!activeSchedule || !activeSchedule.records?.length) {
  //   chart.xAxis[0].update(
  //     {
  //       min: undefined,
  //       max: undefined,
  //     },
  //     false
  //   );
  //   chart.series.forEach((s) => s.setData([], false, false));
  //   chart.xAxis[0].removePlotBand(currentRecordPlotBandId);
  //   chart.zoomOut();
  //   return;
  // }
  // updateTimeZoneSettings(chart, activeSchedule.plantTimeZone, false);
  // const chartData: Highcharts.PointOptionsType[] =
  //   activeSchedule.records.map((record: ActivePowerLimitScheduleRecord) => ({
  //     x: new Date(record.timestamp).getTime(),
  //     y: record.powerLimitMw,
  //     dataLabels: {
  //       enabled:
  //         record.calculatedTarget === null &&
  //         record.timestamp === activeSchedule.currentRecord?.timestamp,
  //     },
  //   })) || [];
  // seriesById(chart, seriesId_TargetPowerLimit)?.setData(chartData, false, false);
  // const chartDataAdjusted: Highcharts.PointOptionsType[] =
  //   activeSchedule.records
  //     .filter((record) => record.calculatedTarget !== undefined)
  //     .map((record: ActivePowerLimitScheduleRecord) => ({
  //       x: new Date(record.timestamp).getTime(),
  //       y: record.calculatedTarget,
  //       dataLabels: {
  //         enabled:
  //           record.calculatedTarget !== null &&
  //           record.timestamp === activeSchedule.currentRecord?.timestamp,
  //       },
  //     })) || [];
  // seriesById(chart, seriesId_TargetPowerLimitAdjusted)?.setData(chartDataAdjusted, false, false);
  // chart.xAxis[0].removePlotBand(currentRecordPlotBandId);
  // if (activeSchedule.currentRecord) {
  //   const startOfInterval = new Date(activeSchedule.currentRecord.timestamp);
  //   chart.xAxis[0].addPlotBand({
  //     id: currentRecordPlotBandId,
  //     color:
  //       activeSchedule.complianceStatus === 'non-compliant' ? chartColors[5] + '22' : '#fff9e6', // @gold-1
  //     from: startOfInterval.getTime(),
  //     to: subHours(startOfInterval, 1).getTime(),
  //   });
  // }
  // const beginningOfCurrentHour = startOfHour(new Date()).getTime();
  // const firstRecordTime = subHours(new Date(activeSchedule.records[0].timestamp), 1).getTime();
  // chart.xAxis[0].update(
  //   {
  //     min: Math.min(beginningOfCurrentHour, firstRecordTime),
  //     max: new Date(activeSchedule.records[activeSchedule.records.length - 1].timestamp).getTime(),
  //   },
  //   false
  // );
}
