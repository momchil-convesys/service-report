import { isNumber } from '../../../../helpers';
import { electricCurrentIrrelevanceTreshold } from './charts-common';
import { seriesId_ElectricCurrent } from './charts-series-current';
import { seriesId_SOC } from './charts-series-soc';
import { seriesId_Temperature } from './charts-series-temperature';
import { seriesId_Voltage } from './charts-series-voltage';

export function updateYAxisExtremes(chart: Highcharts.Chart, redraw = true) {
  const nonNavigatorSeries = chart.series.filter((s) => !s.options.id?.endsWith('_Navigator'));

  nonNavigatorSeries.forEach((s) => {
    let min = undefined;
    let max = undefined;

    if (s.visible) {
      // If no data is present for the zoomed range, set extremes according to specification
      if (s.dataMin === undefined && s.dataMax === undefined) {
        const extremes = getExtremesForSeriesId(s.options.id);

        min = extremes.min;
        max = extremes.max;
      } else {
        min = s.dataMin;
        max = s.dataMax;

        if (s.options.id === seriesId_ElectricCurrent) {
          if (min === 0 && max === 0) {
            min = -100; // According to specification
            max = 60; // According to specification
          } else if (min !== undefined && max !== undefined) {
            if (
              min > -electricCurrentIrrelevanceTreshold &&
              max < electricCurrentIrrelevanceTreshold
            ) {
              min = -electricCurrentIrrelevanceTreshold;
              max = electricCurrentIrrelevanceTreshold;
            } else {
              // Leave default
              min = undefined;
              max = undefined;
            }
          }
        } else {
          // Leave default
          min = undefined;
          max = undefined;
        }
      }
    }

    if (isNumber(s.options.yAxis)) {
      const currentExtremes = chart.yAxis[s.options.yAxis as number].getExtremes();
      if (currentExtremes.min !== min || currentExtremes.max !== max) {
        chart.yAxis[s.options.yAxis as number].setExtremes(min, max, false);
      }
    }
  });

  if (redraw) {
    chart.redraw();
  }
}

export function updateYAxisExtremesToDefault(chart: Highcharts.Chart, redraw = true) {
  const nonNavigatorSeries = chart.series.filter((s) => !s.options.id?.endsWith('_Navigator'));

  nonNavigatorSeries.forEach((s) => {
    let min = undefined;
    let max = undefined;

    if (s.visible) {
      // If no data is present for the zoomed range, set extremes according to specification
      if (s.dataMin === undefined && s.dataMax === undefined) {
        const extremes = getExtremesForSeriesId(s.options.id);

        min = extremes.min;
        max = extremes.max;
      } else {
        min = s.dataMin;
        max = s.dataMax;
      }
    }

    if (isNumber(s.options.yAxis)) {
      const currentExtremes = chart.yAxis[s.options.yAxis as number].getExtremes();
      if (currentExtremes.min === undefined || currentExtremes.max === undefined) {
        chart.yAxis[s.options.yAxis as number].setExtremes(min, max, false);
      }
    }
  });

  if (redraw) {
    chart.redraw();
  }
}

function getExtremesForSeriesId(seriesId: string | undefined): {
  min: number | undefined;
  max: number | undefined;
} {
  switch (seriesId) {
    // Voltage
    case seriesId_Voltage: {
      return { min: 1.6, max: 14.6 }; // According to specification
    }

    // Temperature
    case seriesId_Temperature: {
      return { min: 0, max: 80 }; // According to specification
    }

    // SoC
    case seriesId_SOC: {
      return { min: 0, max: 100 }; // According to specification
    }

    // Electric current
    case seriesId_ElectricCurrent: {
      return { min: -100, max: 60 }; // According to specification
    }
  }

  return { min: undefined, max: undefined };
}
