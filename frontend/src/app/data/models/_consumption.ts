import { IntegrationPeriod } from '../../constants';

export interface ConsumptionWithIntegrationPeriod {
  plantId: string;
  deviceId: string;

  from: Date;
  to: Date;
  integrationPeriod: IntegrationPeriod;

  maxValue: number;

  values: {
    timestamp: Date;
    consumptionFromGridValue: number | null;
    consumptionFromPvValue: number | null;
  }[];
}
