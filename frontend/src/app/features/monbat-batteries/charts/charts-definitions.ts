import { chartColors } from '../../../constants';

export const semanticColor_ActivePowerPositive = chartColors[6]; // Green
export const semanticColor_ActivePowerNegative = chartColors[0]; // Blue

export const yAxisId_Shared = 'yAxisId_Shared';
export const yAxisId_SharedHidden = 'yAxisId_SharedHidden';

export const seriesForExportSuffix = '_Export';

export const seriesId_ActivePower = 'seriesId_ActivePower';
export const seriesId_DirectConsumptionFromGrid = 'seriesId_DirectConsumptionFromGrid';
export const seriesId_ConsumptionFromGrid = 'seriesId_ConsumptionFromGrid';
export const seriesId_ConsumptionFromBatteries = 'seriesId_ConsumptionFromBatteries';
export const seriesId_Consumption = 'seriesId_Consumption';
export const seriesId_BatteryIn = 'seriesId_BatteryIn';
export const seriesId_BatteryOut = 'seriesId_BatteryOut';
export const seriesId_GridOut = 'seriesId_GridOut';
export const seriesId_GridIn = 'seriesId_GridIn';

export const seriesId_ConsumptionFromBatteries_Export =
  seriesId_ConsumptionFromBatteries + seriesForExportSuffix;
export const seriesId_Consumption_Export = seriesId_Consumption + seriesForExportSuffix;

export const yAxisZeroLine = {
  color: '#99acbd',
  width: 1,
  value: 0,
  zIndex: 2,
};

export interface ExtendedAxis extends Highcharts.Axis {
  dataMin: number;
  dataMax: number;
}

export const yAxis_Shared: Highcharts.YAxisOptions = {
  id: yAxisId_Shared,
  title: {
    text: undefined,
  },
  labels: {
    enabled: true,
  },
  opposite: true,
};

export const yAxis_SharedHidden: Highcharts.YAxisOptions = {
  id: yAxisId_SharedHidden,
  visible: false,
};
