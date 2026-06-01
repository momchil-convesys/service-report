import { semanticColor_Irradiance } from '../../../constants';

export const yAxisId_Irradiance = 'yAxisId_Irradiance';

export const seriesId_PlantActivePower = 'seriesId_PlantActivePower';
export const seriesId_DeviceActivePowerGroup = 'seriesId_DeviceActivePowerGroup';

export const seriesId_Irradiance = 'seriesId_Irradiance';

export const yAxis_Irradiance: Highcharts.YAxisOptions = {
  id: yAxisId_Irradiance,
  softMax: 1200, // approximately 1000 W/m2 at sea level on a clear day
  softMin: 0,
  min: 0,
  visible: true,
  tickAmount: 4,
  opposite: true,
  gridLineWidth: 1,
  title: {
    text: undefined,
    // text: 'Irradiance',
    // useHTML: true,
    // style: {
    //   color: semanticColor_Irradiance,
    // },
    // rotation: 270,
  },
  maxPadding: 0.1,
  labels: {
    enabled: true,
    formatter: function () {
      // if (this.isLast) {
      //   return 'Irradiance';
      // }
      if (this.isFirst) {
        return `${this.value} W/m2`;
      }
      return `${this.value}`;
    },
    style: {
      color: semanticColor_Irradiance,
    },
  },
};

export const dataLabelOptions_Irradiance: Highcharts.DataLabelsOptions = {
  format: '{y:,.1f} W/m2',
};

export const tooltipOptions_Irradiance: Highcharts.TooltipOptions = {
  valueSuffix: ' W/m2',
  valueDecimals: 1,
};

export const parrternFill_Irradiance = (color: string): Highcharts.PatternOptionsObject => ({
  path: {
    d: 'M 0 0 L 10 10 M 9 -1 L 11 1 M -1 9 L 1 11',
    strokeWidth: 4,
  },
  width: 10,
  height: 10,
  color,
  // backgroundColor: '#ffffff',
});
