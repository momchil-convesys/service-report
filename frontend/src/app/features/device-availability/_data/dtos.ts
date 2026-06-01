export interface DevicesAvailabilityDTO {
  from: string;
  to: string;

  values: DeviceAvailabilityDTO[];
}

export interface DeviceAvailabilityDTO {
  deviceId: string;
  // from: string;
  // to: string;

  // First and last intervals should be aligned with requested "from/to" timestamps.
  //
  // First interval "from" timestamp should equal requested "from" timestamp
  // and device state will be derived from the closest in time state change before this moment.
  //
  // Last interval duration should be reduced according to "to" timestamp.

  intervals: StateContinuityIntervalDTO[];
}

// An interval of time in which device was continuously in a certain state
export interface StateContinuityIntervalDTO {
  state: string | null; // null means that no data is available for the requested interval

  // Timestamp from
  from: string;

  // Duration is measured in milliseconds
  duration: number;
}

// TODO: Multiple deviceId parameters
//
//    GET /device-availability
//            ? deviceId = 3
//            & deviceId = 19
//            & from = 2000-11-24T07:00:00.000Z
//            & to =2000-11-25T07:00:00.000Z
//

const exampleResponse1: DeviceAvailabilityDTO = {
  deviceId: '3',
  // from: '2000-11-24T07:00:00.000Z', // 24th Oct 07:00
  // to: '2000-11-25T07:00:00.000Z', // 25th Nov 07:00

  // Device state was continuously "ON" for the requested period
  intervals: [
    {
      state: 'on',
      from: '2000-11-24T07:00:00.000Z',
      duration: 86400000, // 24 hours
    },
  ],
};

const exampleResponse2: DeviceAvailabilityDTO = {
  deviceId: '5',
  // from: '2022-12-26T03:30:20.450Z',
  // to: '2023-01-04T11:30:20.450Z',
  intervals: [
    {
      from: '2022-12-26T03:30:20.450Z',
      duration: 129600000,
      state: 'on',
    },
    {
      from: '2022-12-27T15:30:20.450Z',
      duration: 14400000,
      state: 'srvc',
    },
    {
      from: '2022-12-27T19:30:20.450Z',
      duration: 100800000,
      state: 'on',
    },
    {
      from: '2022-12-28T23:30:20.450Z',
      duration: 3600000,
      state: 'off',
    },
    {
      from: '2022-12-29T00:30:20.450Z',
      duration: 7200000,
      state: 'on',
    },
    {
      from: '2022-12-29T02:30:20.450Z',
      duration: 7200000,
      state: 'wrn',
    },
    {
      from: '2022-12-29T04:30:20.450Z',
      duration: 43200000,
      state: 'on',
    },
    {
      from: '2022-12-29T16:30:20.450Z',
      duration: 28800000,
      state: 'err',
    },
    {
      from: '2022-12-30T00:30:20.450Z',
      duration: 39600000,
      state: 'on',
    },
    {
      from: '2022-12-30T11:30:20.450Z',
      duration: 32400000,
      state: 'wrn',
    },
    {
      from: '2022-12-30T20:30:20.450Z',
      duration: 14400000,
      state: 'srvc',
    },
    {
      from: '2022-12-31T00:30:20.450Z',
      duration: 21600000,
      state: 'on',
    },
    {
      from: '2022-12-31T06:30:20.450Z',
      duration: 10800000,
      state: 'srvc',
    },
    {
      from: '2022-12-31T09:30:20.450Z',
      duration: 14400000,
      state: 'err',
    },
    {
      from: '2022-12-31T13:30:20.450Z',
      duration: 169200000,
      state: 'on',
    },
    {
      from: '2023-01-02T12:30:20.450Z',
      duration: 21600000,
      state: 'nc',
    },
    {
      from: '2023-01-02T18:30:20.450Z',
      duration: 43200000,
      state: 'on',
    },
    {
      from: '2023-01-03T06:30:20.450Z',
      duration: 14400000,
      state: 'wrn',
    },
    {
      from: '2023-01-03T10:30:20.450Z',
      duration: 46800000,
      state: 'on',
    },
    {
      from: '2023-01-03T23:30:20.450Z',
      duration: 14400000,
      state: 'nc',
    },
    {
      from: '2023-01-04T03:30:20.450Z',
      duration: 18000000,
      state: 'on',
    },
    {
      from: '2023-01-04T08:30:20.450Z',
      duration: 3600000,
      state: 'srvc',
    },
    {
      from: '2023-01-04T09:30:20.450Z',
      duration: 7200000,
      state: 'err',
    },
  ],
};
