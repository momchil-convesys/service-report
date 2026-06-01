import { BESSAssetType } from '../../../_data/dto/assets/asset-base.dto';
import { getPreferredColors } from './hints';

export function bessContainersChartOptions(parameterKey: string): Highcharts.Options {
  return {
    title: {
      text: 'Containers',
    },
    plotOptions: {
      column: {
        groupPadding: 0.1, // default is 0.2
        pointPadding: 0.05, // default is 0.1
      },
      series: {
        color: getPreferredColors(parameterKey, BESSAssetType.BatteryContainer),
      },
    },
  };
}
