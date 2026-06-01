export interface Weather {}

interface WeatherStationMomentData {
  /** Time of measument */
  timestamp: string;

  /**
   * The operational modes are
   * 1 = Normal Mode
   * 2 = Service Mode
   * 3 = Calibration Mode
   * 4 = Factory Mode
   * 5 = Error Mode
   */
  operationalMode: string;

  /**
   * Solar radiation measured in W/m2.
   */
  solarRadiation: number;

  /**
   * Value from the body temperature sensor measured in °C.
   */
  bodyTemperature: number;
}

interface PvModuleMomentData {
  timestamp: string;
  temperatures: number[]; // [PV_MODULE1, PV_MODULE2] Each item represents value from a single sensor
}

interface WeatherMomentData {
  zoneData: {
    zoneId: string;

    pvModuleData: PvModuleMomentData;

    weatherStationData?: WeatherStationMomentData;
  }[]; // ordered 4 items (one for each zone)
}

interface WeatherMomentDataHistorical {
  targetDate: string;

  zoneData: {
    zoneId: string;

    pvModuleData: PvModuleMomentData[]; // many items (one for each moment in requestet time span)

    weatherStationData?: WeatherStationMomentData[]; // many items (one for each moment in requestet time span)
  }[]; // ordered 4 items (one for each zone)
}

// Get current moment measuments
// GET /weather-data?plantId="plantid"
// Response: object of type WeatherMomentData

// Get current moment measuments
// GET /weather-data/historical?plnatId="plantid"&targetDate=""
// Response: object of type WeatherMomentDataHistorical
