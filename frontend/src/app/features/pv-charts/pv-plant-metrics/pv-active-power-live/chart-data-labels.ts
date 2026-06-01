import {
  multiplierForValue,
  powerUnitForMultiplier,
  scaleAndFormatPowerValue,
  seriesById,
} from '../../../../helpers';
import Highcharts from '../../../../highcharts-global-config';
import { powerLimitSeriesColor, seriesId_DeviceActivePower } from '../chart-constants';

// Two line label (kW is below value)
export const activePowerDataLabels: Highcharts.PlotColumnDataLabelsOptions[] = [
  {
    enabled: true,
    inside: false,
    padding: 0,
    formatter: function () {
      const value = scaleAndFormatPowerValue(this.y, this.series.dataMax, {
        includeUnit: false,
        floorValue: true,
      });

      const dataMax = this.series.dataMax;
      const multiplier = dataMax ? multiplierForValue(dataMax) : 1;

      const unit = powerUnitForMultiplier(multiplier);

      return `${value}<br>${unit}`;
    },
  },
];

export function dataLabelsForDevicePowerLimit(
  sameLimitForAllInvertors: boolean,
  columnIndex: number,
): Highcharts.PlotColumnDataLabelsOptions {
  let dataLabels: Highcharts.PlotColumnDataLabelsOptions = {
    enabled: true,
    y: undefined,
    formatter: function () {
      const activePowerSeries = seriesById(this.series.chart, seriesId_DeviceActivePower);

      return scaleAndFormatPowerValue(this.y, activePowerSeries?.dataMax, {
        includeUnit: false,
        floorValue: false,
      });
    },
    backgroundColor: '#ffffff00',
    borderColor: '#ffffff00',
  };

  if (sameLimitForAllInvertors) {
    if (columnIndex !== 0) {
      dataLabels = {
        enabled: false,
      };
    } else {
      dataLabels = {
        enabled: true,
        x: 0,
        y: -1000,
        backgroundColor: '#ffffff',
        borderColor: powerLimitSeriesColor,
        formatter: function () {
          const activePowerSeries = seriesById(this.series.chart, seriesId_DeviceActivePower);

          const formattedValueWithUnit = scaleAndFormatPowerValue(
            this.y,
            activePowerSeries?.dataMax,
            {
              includeUnit: true,
              floorValue: true,
            },
          );

          return `Power limit ${formattedValueWithUnit}`;
        },
      };
    }
  }

  return dataLabels;
}
