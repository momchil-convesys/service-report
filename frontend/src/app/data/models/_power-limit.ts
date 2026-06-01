import { User } from '.';

export interface PowerLimitDetails {
  value: number; // cannot be null here

  // indicate since when the inverter power is limited
  // timestamp of successfully sent command to GW !!!
  timestamp: string;

  // user that sent the request to limit inverter power
  user: User;
}
