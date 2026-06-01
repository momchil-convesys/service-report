import {
  energyUnitForMultiplier,
  multiplierForValue,
  scaleAndFormatEnergyValue,
} from '../../../../helpers';
import Highcharts from '../../../../highcharts-global-config';

export const dataLabelsFormatter_Energy: Highcharts.DataLabelsFormatterCallbackFunction =
  function () {
    const value = scaleAndFormatEnergyValue(this.y, this.series.dataMax, false);

    const dataMax = this.series.dataMax;
    const multiplier = dataMax ? multiplierForValue(dataMax) : 1;

    const unit = energyUnitForMultiplier(multiplier);

    return `${value}<br>${unit}`;
  };
