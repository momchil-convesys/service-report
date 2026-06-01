import { ONE_SECOND } from '../../../../constants';
import { xAxisEvents } from '../../../../helpers/_charts-sync';

export const xAxisOptions: Highcharts.XAxisOptions[] = [
  {
    type: 'datetime',
    crosshair: true,
    scrollbar: {
      enabled: false,
      buttonsEnabled: true,
    },
    gridZIndex: 0,
    ordinal: false, // This is important to be false for highstock charts
    minRange: ONE_SECOND * 10,
    events: xAxisEvents,
  },
];

export function updateXAxisRange(
  chart: Highcharts.Chart,
  min: Date | undefined,
  max: Date | undefined,
) {
  chart.xAxis.forEach((axis) => {
    axis.update({ min: min?.getTime(), max: max?.getTime() }, false);
  });
}
