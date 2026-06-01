import { chartColors } from '../../../constants';

export const plotLineId = '7DA906E8007B';
export const plotBandId = 'A1F3E53D3C92';

export const powerLimitSeriesColor = '#d9343a';
export const powerLimitSeriesMasterGwColor = powerLimitSeriesColor;

export const seriesId_DeviceActivePower = 'seriesId_DeviceActivePower';
export const seriesId_PlantActivePower = 'seriesId_PlantActivePower';
export const seriesId_PlantActivePowerPM = 'seriesId_PlantActivePowerPM';
export const seriesId_Irradiance = 'seriesId_Irradiance';
export const seriesId_PerformanceRatio = 'seriesId_PerformanceRatio';

export const seriesId_DeviceDailyProduction = 'seriesId_DeviceDailyProduction';
export const seriesId_PlantDailyProduction = 'seriesId_PlantDailyProduction';
export const seriesId_PlantDailyProductionPM = 'seriesId_PlantDailyProductionPM';
export const seriesId_Irradiation = 'seriesId_Irradiation';

export const seriesId_PlantActivePowerPM_ById = (id: string): string => {
  return `${seriesId_PlantActivePowerPM}_${id}`;
};

export const seriesId_PlantDailyProductionPM_ById = (id: string): string => {
  return `${seriesId_PlantDailyProductionPM}_${id}`;
};

export const seriesColor_PlantActivePowerPM = chartColors[3];

// Power limit which is set from Inverter control (for devices only)
export const seriesId_PowerLimit = 'seriesId_PowerLimit';

// Power limit schedule compliance reported from master gateway
export const seriesId_ScheduledPowerLimitMasterGw_ForDevice =
  'seriesId_ScheduledPowerLimitMasterGw_ForDevice';
export const seriesId_ScheduledPowerLimitMasterGw_ForPlant =
  'seriesId_ScheduledPowerLimitMasterGw_ForPlant';

export const yScaleOptions_MaxPadding = 0.2;
