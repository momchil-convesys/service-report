import {
  seriesName_BESSChargedEnergy,
  seriesName_BESSDischargedEnergy,
  seriesName_ExportedToGridHV,
  seriesName_ExportedToGridMV,
  seriesName_ImportedFromGridHV,
  seriesName_ImportedFromGridMV,
  seriesName_PVProduction,
} from 'src/app/constants/_chart-series-titles';
import {
  semanticColor_BatteryCharging,
  semanticColor_BatteryDischarging,
  semanticColor_GridIn,
  semanticColor_GridOut,
  seriesColor_GridExportLoss,
  seriesColor_GridImportLoss,
  slantedPattern,
} from '../../../../constants/_chart-series-colors';
import { formatUnitSpacing } from '../../../../helpers';
import { seriesColor_PVProduction } from '../../../power-schedule/power-schedule-manual-adjustment/power-schedule-tracking-chart/chart-series-pv-production';

const seriesOptions_ChargedEnergy: Highcharts.SeriesOptionsType = {
  id: 'charged-energy',
  type: 'column',
  color: semanticColor_BatteryCharging,
  stacking: 'normal',
  stack: 'bessEnergy',
};

const seriesOptions_DischargedEnergy: Highcharts.SeriesOptionsType = {
  id: 'discharged-energy',
  type: 'column',
  color: semanticColor_BatteryDischarging,
  stacking: 'normal',
  stack: 'bessEnergy',
};

const seriesOptions_ExportedEnergyMV: Highcharts.SeriesOptionsType = {
  id: 'exported-energy-mv',
  type: 'area',
  color: semanticColor_GridIn,
  fillOpacity: 0.1,
  lineWidth: 2,
  marker: {
    enabled: false,
    radius: 0,
  },
  step: 'center',
  // pointPlacement: 1,

  // stacking: 'normal',
  // stack: 'gridEnergy',
};

const seriesOptions_ImportedEnergyMV: Highcharts.SeriesOptionsType = {
  id: 'imported-energy-mv',
  type: 'area',
  color: semanticColor_GridOut,
  fillOpacity: 0.1,
  lineWidth: 2,
  marker: {
    enabled: false,
    radius: 0,
  },
  step: 'center',
  // stacking: 'normal',
  // stack: 'gridEnergy',
};

const seriesOptions_ExportedEnergyHV: Highcharts.SeriesOptionsType = {
  id: 'exported-energy-hv',
  type: 'area',
  color: semanticColor_GridIn,
  fillOpacity: 0.1,
  fillColor: {
    pattern: {
      ...slantedPattern,
      color: semanticColor_GridIn,
      opacity: 0.2,
    },
  },
  lineWidth: 2,
  marker: {
    enabled: false,
    radius: 0,
  },
  step: 'center',
  // pointPlacement: 1,

  // stacking: 'normal',
  // stack: 'gridEnergy',
};

const seriesOptions_ImportedEnergyHV: Highcharts.SeriesOptionsType = {
  id: 'imported-energy-hv',
  type: 'area',
  color: semanticColor_GridOut,
  fillOpacity: 0.1,
  fillColor: {
    pattern: {
      ...slantedPattern,
      color: semanticColor_GridOut,
      opacity: 0.2,
    },
  },
  lineWidth: 2,
  marker: {
    enabled: false,
    radius: 0,
  },
  step: 'center',
  // stacking: 'normal',
  // stack: 'gridEnergy',
};

const seriesOptions_PVProduction: Highcharts.SeriesOptionsType = {
  id: 'pv-production',
  type: 'column',
  color: seriesColor_PVProduction,
  stacking: 'normal',
  stack: 'bessEnergy',
};

const seriesOptions_ImportedEnergyLoss: Highcharts.SeriesOptionsType = {
  id: 'imported-energy-loss',
  type: 'area',
  fillOpacity: 0.2,
  // legendSymbol: 'lineMarker',
  color: seriesColor_GridImportLoss,
  dashStyle: 'ShortDash',
  lineWidth: 1,
  marker: {
    enabled: false,
    radius: 0,
  },
  step: 'center',
  legendSymbol: 'lineMarker',
};

const seriesOptions_ExportedEnergyLoss: Highcharts.SeriesOptionsType = {
  id: 'exported-energy-loss',
  type: 'area',
  fillOpacity: 0.2,
  // legendSymbol: 'lineMarker',
  color: seriesColor_GridExportLoss,
  dashStyle: 'ShortDash',
  lineWidth: 1,
  marker: {
    enabled: false,
    radius: 0,
  },
  step: 'center',
  legendSymbol: 'lineMarker',
};

export const seriesOptions: { [seriesId: string]: Highcharts.SeriesOptionsType } = {
  'charged-energy': seriesOptions_ChargedEnergy,
  'discharged-energy': seriesOptions_DischargedEnergy,
  'pv-production': seriesOptions_PVProduction,
  'exported-energy-mv': seriesOptions_ExportedEnergyMV,
  'imported-energy-mv': seriesOptions_ImportedEnergyMV,
  'exported-energy-hv': seriesOptions_ExportedEnergyHV,
  'imported-energy-hv': seriesOptions_ImportedEnergyHV,
  'imported-energy-loss': seriesOptions_ImportedEnergyLoss,
  'exported-energy-loss': seriesOptions_ExportedEnergyLoss,
};

export const chartSeriesOptionsIdsHighVoltageView: string[] = [
  'exported-energy-mv',
  'imported-energy-mv',
  'exported-energy-hv',
  'imported-energy-hv',
  'imported-energy-loss',
  'exported-energy-loss',
];

export const chartSeriesOptionsIdsDefaultView: string[] = [
  'pv-production',
  'charged-energy',
  'discharged-energy',
  'exported-energy-mv',
  'imported-energy-mv',
];

// Series display names
const seriesNames: { [seriesId: string]: string } = {
  'pv-production': seriesName_PVProduction,
  'charged-energy': seriesName_BESSChargedEnergy,
  'discharged-energy': seriesName_BESSDischargedEnergy,
  'exported-energy-mv': seriesName_ExportedToGridMV,
  'imported-energy-mv': seriesName_ImportedFromGridMV,
  'exported-energy-hv': seriesName_ExportedToGridHV,
  'imported-energy-hv': seriesName_ImportedFromGridHV,
  'imported-energy-loss': $localize`Import Loss (HV - MV)`,
  'exported-energy-loss': $localize`Export Loss (MV - HV)`,
};

export function initializeSeries(chart: Highcharts.Chart) {
  if (chart.series.length > 0) {
    return;
  }

  Object.values(seriesOptions).forEach((seriesOption) => {
    const seriesId = seriesOption.id;
    if (!seriesId) {
      return;
    }
    const seriesName = seriesNames[seriesId] || seriesId;

    const series = chart.addSeries(
      {
        type: seriesOption.type as any,
        id: seriesId,
        name: seriesName,
        visible: true,
        data: [],
        tooltip: {
          valueSuffix: formatUnitSpacing('kWh'),
        },
      },
      false,
    );

    series.update(seriesOption, false);
  });
}
