export interface MinMaxTemperaturePointDTO {
  timestamp: string;
  value: number;
}

export interface InverterTemperatureSensorsDataDTO {
  deviceId: string;
  targetDate: string;

  /**
   * Array of labels representing temperature sensors.
   * NOTE: The order of sensorLabels array is important
   * as the provided sensor labels are mapped to their
   * corresponding sensor data values by index.
   */
  sensorLabels: Array<string>;

  /**
   * Each point represent a moment in time (timestamp)
   * where values is an array of measured temperatures by each sensor.
   *
   * NOTE: length and order of values array should always match
   * the length and order of sensorLabels array.
   * If data is missing for a particular sensor,
   * then "null" should be used in place of its value.
   */
  dataPoints: Array<{
    timestamp: string;
    values: Array<number | null>;
  }>;

  /**
   * Array of points representing values of
   * Active Power parameter over time.
   */
  activePowerDataPoints:
    | Array<{
        timestamp: string;
        value: number | null;
      }>
    | undefined;

  /**
   * Min / Max points for each temperature sensor
   * for the current invertor uptime interval.
   */
  extremePoints?: null | {
    from?: string; // Invertor is working since this point in time.
    to?: string; // This would usually be the current time.

    minPoints: Array<MinMaxTemperaturePointDTO | null>;
    maxPoints: Array<MinMaxTemperaturePointDTO | null>;
  };
}

/**
 * GET /inverter-temperature-sensors-data
 *
 * Query params:
 *
 *     deviceId
 *     targetDate
 *
 * Response: Object of type InverterTemperatureSensorsDataDTO
 */

/**
 * Example response
 */

export const exampleResponse: InverterTemperatureSensorsDataDTO = {
  deviceId: 'db943cc607308b',
  targetDate: '2024-01-11T13:41:22.661Z',

  sensorLabels: [
    'Temperature sensor 1',
    'Temperature sensor 2',
    // ...
    'Temperature sensor 16',
  ],

  dataPoints: [
    {
      timestamp: '2024-01-11T10:00:00.000Z',
      values: [
        25.3, // Value for "Temperature sensor 1"
        10.5, // Value for "Temperature sensor 2"
        // ...
        30.1, // Value for "Temperature sensor 16"
      ],
    },
    {
      timestamp: '2024-01-11T10:15:00.000Z',
      values: [
        26.0, 15.0,
        // ...
        32.5,
      ],
    },
    {
      timestamp: '2024-01-11T10:45:00.000Z',
      values: [
        25.9, 15.3,
        // ...
        32.0,
      ],
    },

    // Data points with null values.
    // null values are possible if there is no data from a particular sensor.
    {
      timestamp: '2024-01-11T11:00:00.000Z',
      values: [
        25.9, // Value for "Temperature sensor 1"
        null, // NO DATA for "Temperature sensor 2"
        // ...
        32.0, // Value for "Temperature sensor 16"
      ],
    },
    {
      timestamp: '2024-01-11T11:15:00.000Z',
      values: [
        25.9, // Value for "Temperature sensor 1"
        null, // NO DATA for "Temperature sensor 2"
        // ...
        32.0, // Value for "Temperature sensor 16"
      ],
    },
  ],

  activePowerDataPoints: [
    {
      timestamp: '2024-01-11T10:00:00.000Z',
      value: 130.6,
    },
    {
      timestamp: '2024-01-11T10:17:00.000Z',
      value: 153.2,
    },
    // ...
  ],

  extremePoints: {
    from: '2024-01-04T10:00:00.000Z',
    to: '2024-01-11T10:17:00.000Z',

    minPoints: [
      {
        timestamp: '2024-01-06T17:15:00.000Z',
        value: 4.3,
      },
      null, // In case there is no data for "Temperature sensor 2"
      {
        timestamp: '2024-01-06T17:15:00.000Z',
        value: 5.0,
      },
    ],

    maxPoints: [
      {
        timestamp: '2024-01-07T07:30:00.000Z',
        value: 48.5,
      },
      null, // In case there is no data for "Temperature sensor 2"
      {
        timestamp: '2024-01-05T19:10:00.000Z',
        value: 58.0,
      },
    ],
  },
};
