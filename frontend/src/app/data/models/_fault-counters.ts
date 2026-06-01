import { IntegrationPeriod } from '../../constants';

export interface FaultCounterValues {
  [faultId: string]: number; // E.g. faultId: m.280.03, value: 43
}
export interface FaultCountersData {
  maxValue: number;
  values: FaultCounterValues;
}

export interface FaultCountersWithIntegrationPeriod {
  deviceId: string;
  faultId: string;
  from: Date;
  to: Date;
  integrationPeriod: IntegrationPeriod;

  maxValue: number;
  values: {
    timestamp: Date;
    value: number;
  }[];
}
