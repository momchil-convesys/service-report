import { DeviceSide, ErrorStackIndexValue } from '../../../constants';

export interface ErrorStack {
  id: string;
  deviceId: string;
  plantId: string;
  timestamp: Date;
  deviceSide: DeviceSide | null;
  summary: {
    faultId: string;
    errorStackValue: ErrorStackIndexValue;
  }[];
  isCurrent: boolean;

  // Calculated in adapter.
  // Unique id of the error stack record accross the system.
  uniqueId: string;
}

export interface ErrorStackDetail extends ErrorStack {
  stackSize: number; // ususally 4 or 8
  currentIndex: number;
  values: {
    [faultId: string]: ErrorStackIndexValue[]; // Array of last N values for each fault, where N = stackSize
  };
}
