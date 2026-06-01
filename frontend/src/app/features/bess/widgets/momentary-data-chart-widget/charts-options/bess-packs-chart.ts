import { BESSAssetType } from '../../../_data/dto/assets/asset-base.dto';
import { getPreferredColors } from './hints';

export function bessPacksChartOptions(rackName: string, parameterKey: string): Highcharts.Options {
  return {
    title: {
      text: rackName + ' - Packs',
    },
    plotOptions: {
      column: {
        groupPadding: 0.0, // default is 0.2
        pointPadding: 0.0, // default is 0.1
        borderColor: '#ffffff',
        borderWidth: 1,
      },
      series: {
        color: getPreferredColors(parameterKey, BESSAssetType.BatteryPack),
      },
    },
  };
}

export function bessAllPacksChartOptions(parameterKey: string): Highcharts.Options {
  return {
    title: {
      text: 'All Packs in the BESS',
    },
    chart: {
      zooming: {
        type: 'x',
      },
    },
    xAxis: {
      labels: {
        autoRotation: [0],
      },
      events: {
        afterSetExtremes: function () {
          const visibleColumnCount = Math.floor(this.max || 0) - Math.ceil(this.min || 0) + 1;

          const widthPerCategory = this.chart.plotWidth / visibleColumnCount;

          this.update(
            {
              labels: {
                enabled: widthPerCategory > 100,
              },
            },
            false,
          );

          this.chart.update(
            {
              plotOptions: {
                column: {
                  borderWidth: widthPerCategory > 4 ? 1 : 0,
                },
              },
            },
            false,
          );

          this.chart.redraw();
        },
      },
    },
    scrollbar: {
      enabled: true,
    },
    plotOptions: {
      column: {
        groupPadding: 0.0, // default is 0.2
        pointPadding: 0.0, // default is 0.1
        borderWidth: 1,
        dataLabels: {
          formatter: function () {
            if ((this as any).pointWidth < 30) {
              return null;
            }

            return this.y;
          },
        },
      },
      series: {
        color: getPreferredColors(parameterKey, BESSAssetType.BatteryPack),
      },
    },
  };
}
