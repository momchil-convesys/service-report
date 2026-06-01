import { DatetimeRangeModel } from '../../../shared/datetime-range-select/models';

export interface MinMaxTemperaturePoint {
  timestamp: Date;
  value: number;
}

export interface MinMaxTemperaturePoints {
  min: MinMaxTemperaturePoint | null;
  max: MinMaxTemperaturePoint | null;
}

export interface GenericDataPoint {
  timestamp: Date;
  value: number | null;
}

export interface InverterTemperatureSensorsDataPoint {
  timestamp: Date;
  values: (number | null)[];
}

export interface InverterTemperatureSensorsData {
  deviceId: string;
  targetDate: Date;

  sensorLabels: string[];

  dataPoints: InverterTemperatureSensorsDataPoint[];
  activePowerDataPoints: GenericDataPoint[] | undefined;

  extremePoints:
    | undefined
    | null
    | {
        from?: Date;
        to?: Date;

        minPoints: Array<MinMaxTemperaturePoint | null>;
        maxPoints: Array<MinMaxTemperaturePoint | null>;
      };

  // Populated at front end

  dataPointsMinMax: MinMaxTemperaturePoints[];
  highlightOnLoad: MinMaxTemperaturePoint | undefined;
  exportFileName: string;
  timeZone: string | undefined;
  targetRange: DatetimeRangeModel;
}
