export enum PlantWeatherDataChartIdentifier {
  PlantOverview,
  CumulativePerTS,
  MomentaryPerTS,
}

export const endpointForChartIdentifier: {
  [chartIdentifier in PlantWeatherDataChartIdentifier]: string;
} = {
  [PlantWeatherDataChartIdentifier.PlantOverview]: '/plant-weather-historical-data',
  [PlantWeatherDataChartIdentifier.CumulativePerTS]: '/plant-weather-historical-data-ts-cumulative',
  [PlantWeatherDataChartIdentifier.MomentaryPerTS]: '/plant-weather-historical-data-ts-momentary',
};

/**
 * TODO: do not check against HARDCODED plant ids!
 * These are used for plant id 26 only.
 */
export type PlantWeatherExtraSensors_ParameterName = 'dust' | 'wind' | 'rain'; // MomentaryPerTS

/**
 * Fully synced charts also sync hover by searching for corresponding transformer stations in the other charts.
 * Non fully synced charts only sync crosshair.
 */
export const shouldFullSyncChart = (
  parameterName: PlantWeatherData_ParameterName | undefined,
): boolean => {
  if (!parameterName) {
    return false;
  }

  if (
    parameterName === 'total-irradiance' ||
    parameterName === 'ambient-temperature' ||
    parameterName === 'pv-module-temperature'
  ) {
    return true;
  }

  return false;
};

export type PlantWeatherMomentaryData_ParameterName =
  | 'total-irradiance'
  | 'ambient-temperature'
  | 'pv-module-temperature';

export type PlantWeatherData_ParameterName =
  | 'daily-irradiation-amount'
  | PlantWeatherExtraSensors_ParameterName
  | PlantWeatherMomentaryData_ParameterName;

export const chartTitleForParameterName_GTI: {
  [parameterName in PlantWeatherData_ParameterName]: string;
} = {
  'daily-irradiation-amount': $localize`GTI daily irradiation amount`,

  'total-irradiance': $localize`GTI total irradiance`,
  'ambient-temperature': $localize`GTI ambient temperature`,
  'pv-module-temperature': $localize`GTI PV module temperature`,

  dust: $localize`Dust`,
  wind: $localize`Wind`,
  rain: $localize`Rain`,
};

export const chartTitleForParameterName_Default: {
  [parameterName in PlantWeatherData_ParameterName]: string;
} = {
  'daily-irradiation-amount': $localize`Daily irradiation amount`,

  'total-irradiance': $localize`Total irradiance`,
  'ambient-temperature': $localize`Ambient temperature`,
  'pv-module-temperature': $localize`PV module temperature`,

  dust: $localize`Dust`,
  wind: $localize`Wind`,
  rain: $localize`Rain`,
};

/**
 * /plant-weather-historical-data-ts-momentary & parameterName
 *
 * parameterName:
 *    total-irradiance
 *    ambient-temperature
 *    pv-module-temperature
 */
