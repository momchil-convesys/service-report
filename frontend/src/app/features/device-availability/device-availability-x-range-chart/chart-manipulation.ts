import { addMilliseconds } from 'date-fns';
import {
  DeviceState,
  deviceStateColors,
  deviceStateColorsLight,
  deviceStateFullLabels,
  deviceStatesOrdered,
} from '../../../constants';
import Highcharts from '../../../highcharts-global-config';

import { utcToZonedTimeSafe, zonedTimeToUtcSafe } from 'src/app/helpers';
import { formatPreciseIntervalForXRangeTooltip } from '../../../app-locale';
import { BaseChartContext } from '../../../shared/base-chart-component/base-chart-component.component';
import { DatetimeRangeModel } from '../../../shared/datetime-range-select/models';
import { DevicesAvailability } from '../_data/models';

const tooltipPositioner: Highcharts.TooltipPositionerCallbackFunction = function (
  labelWidth,
  labelHeight,
  point,
) {
  const padding = 5;
  let x = point.plotX + this.chart.plotLeft + padding;
  if (x > this.chart.chartWidth / 2) {
    x = x - labelWidth - 2 * padding;
  }
  const y = this.chart.plotTop + (this.chart.hoverPoint?.plotY || 0) - labelHeight - 10;

  if (!(this.chart as any).customHoverMarker) {
    (this.chart as any).customHoverMarker = this.chart.renderer
      .rect(0, 0, 1, 30)
      .attr({
        fill: '#000000',
        zIndex: 4,
      })
      .css({ 'pointer-events': 'none' })
      .add();
  }

  (this.chart as any).customHoverMarker.attr({
    x: point.plotX + this.chart.plotLeft - 1,
    y: y + 2,
  });

  return { x, y };
};

export const chartOptions: Highcharts.Options = {
  chart: {
    type: 'xrange',
    zooming: {
      type: 'x',
      mouseWheel: false,
      resetButton: {
        position: {
          align: 'right',
          y: -36,
          x: 0,
        },
        theme: {
          zIndex: 8,
        },
      },
    },
    spacingBottom: 5,
  },
  legend: {
    enabled: false,
  },
  tooltip: {
    shared: false,
    followPointer: true,
    // useHTML: true,
    shadow: false,
    animation: false,
    outside: true,
    padding: 0,
    // hideDelay: 0,
    backgroundColor: '#ffffff00',
    positioner: tooltipPositioner,
    formatter: function (tooltip) {
      const defaultTooltip = tooltip.defaultFormatter.call(this, tooltip);

      let formattedInterval: string | undefined;

      if (this.x && this.x2) {
        formattedInterval = formatPreciseIntervalForXRangeTooltip(
          { start: Number(this.x), end: Number(this.x2) },
          this.series.chart.options.time?.timezone,
        );
      }

      if (Array.isArray(defaultTooltip) && defaultTooltip.length > 0) {
        const datetimeRange = formattedInterval || defaultTooltip[0].replace('<br/>', '');
        return `<b style="font-size: 0.8em">${this.series.name}</b> <span style="font-size: 0.8em">${datetimeRange}</span>`;
      }

      return defaultTooltip;
    },
  },
  scrollbar: {
    enabled: true,
  },
  xAxis: {
    type: 'datetime',
    // crosshair: {
    //   color: '#b2c1cd',
    //   width: 1,
    //   snap: false,
    //   // zIndex: 3,
    // },
    tickColor: '#edf0f3',
    lineWidth: 0,
    gridLineColor: '#edf0f3',
    gridLineWidth: 1,
    minRange: 1000 * 60, // 1 minute zoom
    opposite: true,
  },
  yAxis: [
    {
      title: {
        text: undefined,
      },
      tickWidth: 0,
      gridLineColor: '#edf0f3',
      gridLineWidth: 1,
      categories: [],
      tickmarkPlacement: 'on',
      reversed: true,
    },
  ],
  plotOptions: {
    xrange: {
      borderRadius: 0,
      grouping: false,
      colorByPoint: false,
      turboThreshold: 10000,
      borderWidth: 0,
      borderColor: '#ffffff00', // borderWidth seems to not have effect
      states: {
        inactive: {
          opacity: 1,
        },
      },
      events: {
        mouseOver: function (event: any) {
          changeCustomMarkerVisibility(this.chart, true);
        },
        mouseOut: function (event: any) {
          changeCustomMarkerVisibility(this.chart, false);
        },
      },
    },
  },
  series: [],
};

export function updateChartData(chart: Highcharts.Chart, data: DevicesAvailability | undefined) {
  if (!data || data.values.length === 0) {
    chart.series.forEach((series) => series.setData([], false, false));
    return;
  }

  addSeriesIfNeeded(chart);

  const dataBySeriesId: { [id: string]: any } = {
    [seriesIdFromState(null)]: [],
  };

  chart.series.forEach((s) => {
    s.setData([], false);
    dataBySeriesId[s.options.id || ''] = [];
  });

  data.values.forEach((deviceAvailability, deviceIndex) => {
    deviceAvailability.intervals.forEach((interval) => {
      const point: Highcharts.PointOptionsObject = {
        x: interval.from.getTime(),
        x2: addMilliseconds(interval.from, interval.durationMs).getTime(),
        y: deviceIndex,
        color: interval.state ? deviceStateColorsLight[interval.state] : undefined,
      };
      const dataArray = dataBySeriesId[seriesIdFromState(interval.state)];
      dataArray?.push(point as any);
    });
  });

  [...deviceStatesOrdered, null].forEach((state) => {
    const seriesId = seriesIdFromState(state);
    const seriesForState = chart.series.find((s) => s.options.id === seriesId);
    seriesForState?.setData(dataBySeriesId[seriesId], false);
  });
}

export function getCategories(context: BaseChartContext | null): string[] {
  const categories: string[] = [];

  if (!context) {
    // No context, leave empty
  }
  // Single device
  else if (context.deviceId) {
    const singleDeviceCategory = context.plant.devices.find(
      (device) => device.id === context?.deviceId,
    )?.name;
    if (singleDeviceCategory) {
      categories.push(singleDeviceCategory);
    }
  }
  // Plant context
  else {
    const deviceNames = context.plant.devices.map((device) => device.name);
    categories.push(...deviceNames);
  }

  return categories;
}

function addSeriesIfNeeded(chart: Highcharts.Chart) {
  while (chart.series.length > 0) {
    chart.series[0].remove(false);
  }

  deviceStatesOrdered.forEach((state) => {
    chart.addSeries({
      id: seriesIdFromState(state),
      type: 'xrange',
      name: deviceStateFullLabels[state],
      pointWidth: state !== DeviceState.NoCommunication ? 17 : 11,
      color: deviceStateColors[state],
      states: {
        hover: {
          color: deviceStateColors[state],
        },
      },
      data: [],
    });
  });

  chart.addSeries({
    id: seriesIdFromState(null),
    type: 'xrange',
    name: 'No data',
    color: '#ffffff00',
    data: [],
  });
}

export function setCategories(chart: Highcharts.Chart, categories: string[]) {
  chart.yAxis[0].setCategories(categories, false);
  chart.yAxis[0].update({ min: 0, max: categories.length - 1 });
}

function seriesIdFromState(state: DeviceState | null | undefined): string {
  return state || 'noData';
}

function changeCustomMarkerVisibility(chart: Highcharts.Chart, makeVisible: boolean) {
  if (!(chart as any).customHoverMarker) {
    return;
  }

  if (makeVisible) {
    (chart as any).customHoverMarker.attr({
      visibility: 'visible',
    });

    return;
  }

  setTimeout(() => {
    if (chart.hoverPoint) {
      return;
    }

    (chart as any).customHoverMarker.attr({
      visibility: makeVisible ? 'visible' : 'hidden',
    });
  }, 500);
}

export function updateDatetimeAxisRange(
  chart: Highcharts.Chart,
  axis: Highcharts.Axis,
  targetRange: DatetimeRangeModel | undefined,
  timeZone: string | undefined,
) {
  let newMinDate = utcToZonedTimeSafe(targetRange?.from || new Date(), timeZone);
  let newMaxDate = utcToZonedTimeSafe(targetRange?.to || new Date(), timeZone);

  const newMin = zonedTimeToUtcSafe(newMinDate, chart.options.time?.timezone).getTime();
  const newMax = zonedTimeToUtcSafe(newMaxDate, chart.options.time?.timezone).getTime();

  axis.update(
    {
      min: newMin,
      max: newMax,
    },
    false,
  );
}
