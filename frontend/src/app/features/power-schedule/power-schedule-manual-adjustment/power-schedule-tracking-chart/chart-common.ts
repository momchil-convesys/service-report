import { ONE_MINUTE } from '../../../../constants';
import {
  getMaxValueFromAllSeries,
  yAxisFormatter_ScaleValue_v2,
  yAxisZeroPlotLine,
} from '../../../../helpers';
import { tooltipResponsiveOptions } from './chart-tooltip';

export const fakeYAxisMaximum = 100;

/**
 * If deviation is greater than this treshold,
 * it is considered as significant (showed as warning).
 */
export const pvDeviationFromTargetTreshold = 100;
export const bessDeviationFromTargetTreshold = 100;
export const gridDeviationFromTargetTreshold = 100;

export const useCrispPoints = false;

export const columnLikeSeries_SharedOptions = {
  borderWidth: 0,
  borderRadius: 1,
  shadow: false,
  grouping: false,
  pointPadding: 0,
  groupPadding: 0,
  states: {
    inactive: {
      opacity: 1,
    },
  },
  pointPlacement: 0.5,
  pointRange: ONE_MINUTE * 15,
};

export const legendOptions: Highcharts.LegendOptions = {
  enabled: true,
  padding: 5,
  itemMarginTop: 0,
  itemStyle: {
    fontSize: '12px',
  },
  align: 'left',
  layout: 'vertical',
  verticalAlign: 'top',
  width: 250,
};

export const chartOptions_Mobile: Highcharts.Options = {
  legend: {
    layout: 'vertical',
    align: 'center',
    verticalAlign: 'top',
    floating: false,
    width: '100%',
  },
  tooltip: {
    ...tooltipResponsiveOptions,
  },
};

export const responsiveOptions: Highcharts.ResponsiveOptions = {
  rules: [
    {
      condition: {
        maxWidth: 800,
      },
      chartOptions: chartOptions_Mobile,
    },
  ],
};

export const yAxisLabelsWidth = 50;
export const yAxisOptions_Shared: Highcharts.YAxisOptions = {
  labels: {
    style: {
      fontSize: '12px',
    },
    x: 5,
    enabled: true,
    reserveSpace: true,
    formatter: function (context) {
      const dataMax = getMaxValueFromAllSeries(context.chart);
      const isZero = context.value === 0;
      return yAxisFormatter_ScaleValue_v2(context, 'Wh', dataMax, isZero);
    },
  },
  endOnTick: false,
  opposite: true,
  plotLines: [yAxisZeroPlotLine],
  title: {
    text: undefined,
  },
  maxPadding: 0,
  minPadding: 0,
};

export const hiddenScrollbarOptions: Highcharts.ScrollbarOptions = {
  enabled: true,
  margin: 0,
  height: 1, // note that height: 0 causes Error: <rect> attribute height: A negative value is not valid. ("-1")
  barBackgroundColor: 'transparent',
  barBorderColor: 'transparent',
  buttonBackgroundColor: 'transparent',
  buttonBorderColor: 'transparent',
  trackBackgroundColor: 'transparent',
  trackBorderColor: 'transparent',
  rifleColor: 'transparent',
};
