import { DeviceState } from '../../../constants';

export interface DevicesAvailability {
  from: Date;
  to: Date;

  values: DeviceAvailability[];
}

export interface DeviceAvailability {
  deviceId: string;
  from: Date;
  to: Date;
  fullDurationMs: number;
  intervals: StateContinuityInterval[];
  durationByState: { [state in DeviceState | 'no-data']: number };
}

export interface StateContinuityInterval {
  state: DeviceState | null;
  from: Date;
  duration: Duration; // calculated
  durationMs: number; // milliseconds
}
