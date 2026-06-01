import { ExtendedAxis } from './charts-definitions';

const yAxisTickPositioner_CenteredZeroLine = function (this: Highcharts.Axis) {
  const tsAxis: ExtendedAxis = this as ExtendedAxis;
  var maxDeviation = Math.max(Math.abs(tsAxis.dataMax), Math.abs(tsAxis.dataMin)) * 1.2;
  var halfMaxDeviation = maxDeviation / 2;

  return [-maxDeviation, -halfMaxDeviation, 0, halfMaxDeviation, maxDeviation];
};

export function gradientFill(color: string): Highcharts.GradientColorObject {
  return {
    linearGradient: {
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 1,
    },
    stops: [
      [0, color + 'aa'],
      [1, color + '11'],
    ],
  };
}
