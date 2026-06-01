import { BESSAssetType } from '../../../_data/dto/assets/asset-base.dto';
import { getPreferredColors } from './hints';

export function bessRacksMinMaxChartOptions(parameterKey: string): Highcharts.Options {
  return {
    title: {
      text: 'Racks Min / Max Temperature Packs',
    },
    chart: {
      zooming: {
        type: 'x',
      },
    },
    xAxis: {
      minRange: 10,
    },
    scrollbar: {
      enabled: true,
    },
    plotOptions: {
      column: {
        groupPadding: 0.0, // default is 0.2
        pointPadding: 0.0, // default is 0.1
        borderColor: '#ffffff',
        borderWidth: 1,
        color: getPreferredColors(parameterKey, BESSAssetType.BatteryRack),
        dataLabels: {
          enabled: true,
          formatter: function () {
            if ((this as any).pointWidth < 30) {
              return null;
            }

            return this.y;
          },
        },
      },
    },
  };
}
