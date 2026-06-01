export interface ConsumptionWithIntegrationPeriodDTO {
  plantId: string;
  deviceId: string;

  from: string;
  to: string;
  integrationPeriod: string; // 'hours' | 'days' | 'months';

  // maxValue: number;

  values: {
    timestamp: string;
    consumptionFromGridValue: number | null;
    consumptionFromPvValue: number | null;
  }[];
}
