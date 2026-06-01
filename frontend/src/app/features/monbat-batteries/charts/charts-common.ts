import { differenceInDays, differenceInMonths, subHours } from 'date-fns';
import {
  energyUnitForMultiplier,
  formattedStackLabelForUnit,
  multiplierForValue,
  powerUnitForMultiplier,
} from '../../../helpers';
import {
  syncedChartsClassName,
  syncedChartsSeriesPointEvents,
  xAxisEvents,
} from '../../../helpers/_charts-sync';
import Highcharts from '../../../highcharts-global-config';
import { HybridInverterHistoricalData } from '../_data/models';
import { yAxisId_Shared, yAxisId_SharedHidden } from './charts-definitions';
import { tooltip } from './charts-tooltip';

type XRangePayload = {
  from: string; // ISO string (UTC)
  to: string; // ISO string (UTC)
  integrationPeriod?: string | null;
  timeZone?: string; // optional; ignored here
};

export const chartsCommonOptions: Highcharts.Options = {
  chart: {
    className: syncedChartsClassName,
    plotBorderColor: '#D4DCE3', // @border-color-base,
    backgroundColor: '#FFFFFF',
    zooming: {
      type: 'x',
      mouseWheel: false,
    },
    spacingTop: 18, // default is 10
    ignoreHiddenSeries: false, // keep axis always visible, even if no data
  },
  xAxis: {
    type: 'datetime',
    crosshair: true,
    zoomEnabled: true,
    scrollbar: {
      enabled: true,
    },
    events: xAxisEvents,
  },
  legend: {
    enabled: true,
  },
  tooltip: tooltip,
  plotOptions: {
    column: {
      borderWidth: 0,
      groupPadding: 0,
      grouping: false,
    },
    areaspline: {
      gapSize: 1000 * 60 * 5, // 5 min
      gapUnit: 'value',
    },
    series: {
      point: {
        events: syncedChartsSeriesPointEvents,
      },
    },
  },
};

export function updateDatetimeAxisRange(
  chart: Highcharts.Chart,
  axis: Highcharts.Axis,
  data: HybridInverterHistoricalData | undefined,
) {
  const currentMin = axis.options.min;
  const currentMax = axis.options.max;

  let newMin: number | undefined;
  let newMax: number | undefined;

  if (data) {
    let newMinDate = new Date(data.from);
    let newMaxDate = new Date(data.to);

    if (data.integrationPeriod) {
      // when pointPlacement: 'on' fixes added extra column after xAxis.max
      // but clips the fist column, so we shift it here by half day
      // TODO: this should not be applued for integration period different than day,
      // but intergration periods are currently implemented by data grouping
      newMinDate = subHours(newMinDate, 12);
      newMaxDate = subHours(newMaxDate, 12);
    }

    newMin = newMinDate.getTime();
    newMax = newMaxDate.getTime();
  }

  if (currentMin !== newMin || currentMax !== newMax) {
    axis.update(
      {
        min: newMin,
        max: newMax,
        // TODO: calc minimum zoom according to displayed range
        minRange: 1000 * 60 * 30, // 30 minute zoom
      },
      false,
    );

    chart.zoomOut();
  }
}

export function updateDatetimeAxisRangeGeneric(
  chart: Highcharts.Chart,
  axis: Highcharts.Axis,
  data: XRangePayload | undefined,
) {
  const currentMin = axis.options.min;
  const currentMax = axis.options.max;

  let newMin: number | undefined;
  let newMax: number | undefined;

  if (data) {
    let newMinDate = new Date(data.from);
    let newMaxDate = new Date(data.to);

    if (data.integrationPeriod) {
      // When using pointPlacement: 'on', shift half a day to avoid clipping the first column
      // (kept exactly as in your original)
      newMinDate = subHours(newMinDate, 12);
      newMaxDate = subHours(newMaxDate, 12);
    }

    newMin = newMinDate.getTime();
    newMax = newMaxDate.getTime();
  }

  if (currentMin !== newMin || currentMax !== newMax) {
    axis.update(
      {
        min: newMin,
        max: newMax,
        minRange: 1000 * 60 * 30, // 30-minute minimum zoom
      },
      false,
    );

    chart.zoomOut();
  }
}

export function dataGroupingOptionsForTimeRange(
  from: Date,
  to: Date,
): Highcharts.DataGroupingOptionsObject {
  const days = differenceInDays(to, from);
  const months = differenceInMonths(to, from);

  if (days <= 1) {
    return {
      enabled: false,
    };
  }

  if (months <= 3) {
    return {
      enabled: true,
      forced: true,
      units: [['day', [1]]],
      approximation: 'sum',
    };
  }

  return {
    enabled: true,
    forced: true,
    units: [['month', [1]]],
    approximation: 'sum',
  };
}

export function pointRangeForDataGroupingOptions(
  dataGroupingOptions: Highcharts.DataGroupingOptionsObject,
): number | undefined {
  const isIntegratedByDay = dataGroupingOptions.units?.find((unitsArray) =>
    unitsArray.includes('day'),
  );

  if (isIntegratedByDay) {
    return 24 * 3600 * 1000; // one day
  }

  const isNonIntegratedData = dataGroupingOptions.enabled === false;

  if (isNonIntegratedData) {
    return 1000; // one minute
  }

  return undefined;
}

export function updateSeriesOptions(chart: Highcharts.Chart, data: HybridInverterHistoricalData) {
  chart.series.forEach((series) => {
    const dataGroupingOptions: Highcharts.DataGroupingOptionsObject =
      dataGroupingOptionsForTimeRange(new Date(data.from), new Date(data.to));

    const isIntegratedByDay = dataGroupingOptions.units?.find((unitsArray) =>
      unitsArray.includes('day'),
    );

    series.update(
      {
        type: data.integrationPeriod ? 'column' : 'areaspline',
        dataGrouping: dataGroupingOptions,
        pointRange: pointRangeForDataGroupingOptions(dataGroupingOptions),
        pointPlacement: isIntegratedByDay ? 'on' : undefined,
      },
      false,
    );
  });
}

export function updateYAxisOptions(chart: Highcharts.Chart, data: HybridInverterHistoricalData) {
  const axisToUpdate: Highcharts.Axis[] = chart.yAxis.filter(
    (axis) => axis.options.id && [yAxisId_Shared, yAxisId_SharedHidden].includes(axis.options.id),
  );

  axisToUpdate.forEach((axis) => {
    axis.update(
      {
        labels: {
          formatter: function () {
            const dataMax: number | undefined = (this.axis as any)?.dataMax;

            let multiplier = 1;

            if (dataMax !== undefined) {
              multiplier = multiplierForValue(dataMax);
            }

            const unit = data.integrationPeriod
              ? energyUnitForMultiplier(multiplier)
              : powerUnitForMultiplier(multiplier);

            const scaledValue = Number(this.value) * multiplier;

            let result = scaledValue.toString();

            if (this.isFirst) {
              result += ` ${unit}`;
            }

            return result.toString();
          },
        },
        stackLabels: {
          enabled: !!data.integrationPeriod,
          formatter: function () {
            const value: number | null = this.total;

            let multiplier = 1;

            if (value !== undefined && value !== null) {
              multiplier = multiplierForValue(value);
            }

            const scaledValue = Number(value) * multiplier;

            const unit = data.integrationPeriod
              ? energyUnitForMultiplier(multiplier)
              : powerUnitForMultiplier(multiplier);

            let result = formattedStackLabelForUnit(unit, scaledValue);

            return result;
          },
        },
      },
      false,
    );
  });
}
