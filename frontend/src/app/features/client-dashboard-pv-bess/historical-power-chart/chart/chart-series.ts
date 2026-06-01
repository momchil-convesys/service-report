import { semanticColor_PVActivePower } from '../../../../constants';
import {
  semanticColor_BatteryCharging,
  semanticColor_BatteryDischarging,
  semanticColor_ChargeableEnergy,
  semanticColor_DischargeableEnergy,
  semanticColor_GridIn,
  semanticColor_GridOut,
  seriesColor_GridExportLoss,
  seriesColor_GridImportLoss,
  seriesColor_ScheduleTargetFillGridExport,
  seriesColor_ScheduleTargetFillGridImport,
  slantedPattern,
} from '../../../../constants/_chart-series-colors';

const seriesOptions_PVActivePower: Highcharts.SeriesOptionsType = {
  id: 'pv-active-power',
  name: $localize`PV Active Power`,
  type: 'line',
  color: semanticColor_PVActivePower,
  showInNavigator: true,
  legendSymbol: 'rectangle',
};

const seriesOptions_ChargingPower: Highcharts.SeriesOptionsType = {
  id: 'charging-power',
  name: $localize`Charging Power`,
  type: 'line',
  color: semanticColor_BatteryCharging,
  showInNavigator: true,
  legendSymbol: 'rectangle',
};

const seriesOptions_DischargingPower: Highcharts.SeriesOptionsType = {
  id: 'discharging-power',
  name: $localize`Discharging Power`,
  type: 'line',
  color: semanticColor_BatteryDischarging,
  showInNavigator: true,
  legendSymbol: 'rectangle',
};

const seriesOptions_ExportPowerMV: Highcharts.SeriesOptionsType = {
  id: 'export-power-mv',
  name: $localize`Export Power (MV)`,
  type: 'area',
  color: semanticColor_GridIn,
  fillColor: seriesColor_ScheduleTargetFillGridExport, //semanticColor_GridIn + '22',
  lineWidth: 1,
  showInNavigator: true,
};

const seriesOptions_ImportPowerMV: Highcharts.SeriesOptionsType = {
  id: 'import-power-mv',
  name: $localize`Import Power (MV)`,
  type: 'area',
  fillColor: seriesColor_ScheduleTargetFillGridImport, //semanticColor_GridOut + '22',
  color: semanticColor_GridOut,
  lineWidth: 1,
  showInNavigator: true,
};

const seriesOptions_ExportPowerHV: Highcharts.SeriesOptionsType = {
  id: 'export-power-hv',
  name: $localize`Export Power (HV)`,
  type: 'area',
  color: semanticColor_GridIn,
  // fillColor: seriesColor_ScheduleTargetFillGridExport, //semanticColor_GridIn + '22',
  fillColor: {
    pattern: {
      ...slantedPattern,
      color: seriesColor_ScheduleTargetFillGridExport,
    },
  },
  lineWidth: 1,
  showInNavigator: true,
};

const seriesOptions_ImportPowerHV: Highcharts.SeriesOptionsType = {
  id: 'import-power-hv',
  name: $localize`Import Power (HV)`,
  type: 'area',
  // fillColor: seriesColor_ScheduleTargetFillGridImport, //semanticColor_GridOut + '22',
  fillColor: {
    pattern: {
      ...slantedPattern,
      color: seriesColor_ScheduleTargetFillGridImport,
    },
  },
  color: semanticColor_GridOut,
  lineWidth: 1,
  showInNavigator: true,
};

const seriesOptions_ImportLoss: Highcharts.SeriesOptionsType = {
  id: 'import-loss',
  name: $localize`Import Loss (HV - MV)`,
  type: 'area',
  fillOpacity: 0.2,
  legendSymbol: 'lineMarker',
  color: seriesColor_GridImportLoss,
  dashStyle: 'ShortDash',
  lineWidth: 1,
  showInNavigator: false,
};

const seriesOptions_ExportLoss: Highcharts.SeriesOptionsType = {
  id: 'export-loss',
  name: $localize`Export Loss (MV - HV)`,
  type: 'area',
  fillOpacity: 0.2,
  legendSymbol: 'lineMarker',
  color: seriesColor_GridExportLoss,
  dashStyle: 'ShortDash',
  lineWidth: 1,
  showInNavigator: false,
};

const seriesOptions_CahrgeableEnergy: Highcharts.SeriesOptionsType = {
  id: 'chargeable-energy',
  name: $localize`Chargeable Energy`,
  type: 'line',
  color: semanticColor_ChargeableEnergy,
  dashStyle: 'ShortDot',
  tooltip: {
    valueSuffix: ' kWh',
  },
  yAxis: 1,
  lineWidth: 1,
  visible: false,
  showInNavigator: false,
};

const seriesOptions_DischargeableEnergy: Highcharts.SeriesOptionsType = {
  id: 'dischargeable-energy',
  name: $localize`Dischargeable Energy`,
  type: 'line',
  color: semanticColor_DischargeableEnergy,
  dashStyle: 'ShortDot',
  tooltip: {
    valueSuffix: ' kWh',
  },
  yAxis: 1,
  lineWidth: 1,
  visible: false,
  showInNavigator: false,
};

export const chartSeriesOptions: Highcharts.SeriesOptionsType[] = [
  seriesOptions_PVActivePower,
  seriesOptions_ChargingPower,
  seriesOptions_DischargingPower,
  seriesOptions_ExportPowerMV,
  seriesOptions_ImportPowerMV,
  seriesOptions_ExportPowerHV,
  seriesOptions_ImportPowerHV,
  seriesOptions_ImportLoss,
  seriesOptions_ExportLoss,
  seriesOptions_CahrgeableEnergy,
  seriesOptions_DischargeableEnergy,
];

export const chartSeriesOptionsIdsHighVoltageView: string[] = [
  'export-power-mv',
  'import-power-mv',
  'export-power-hv',
  'import-power-hv',
  'import-loss',
  'export-loss',
];

export const chartSeriesOptionsIdsDefaultView: string[] = [
  'pv-active-power',
  'charging-power',
  'discharging-power',
  'export-power-mv',
  'import-power-mv',
  'chargeable-energy',
  'dischargeable-energy',
];
