export interface BESSHistoricalDataPoint {
  timestamp: string;
  value: number;
}

export interface BESSHistoricalSeriesMock {
  parameterKey: string;
  assetId: string;
  unit: string | null;
  points: BESSHistoricalDataPoint[];
}

const unitsByParameter: Record<string, string> = {
  activePower: 'kW',
  soc: '%',
  stateOfCharge: '%',
  batteryVoltage: 'V',
  batteryTemperature: 'C',
};

export function generateBESSHistoricalSeriesForToday(
  parameterKey: string,
  assetId: string,
  day: Date,
): BESSHistoricalSeriesMock {
  const startOfDay = new Date(day);
  startOfDay.setHours(0, 0, 0, 0);

  const points = Array.from({ length: 96 }, (_, index) => {
    const timestamp = new Date(startOfDay.getTime() + index * 15 * 60_000);
    const wave = Math.sin((index / 96) * Math.PI * 2);
    const drift = Math.cos((index / 24) * Math.PI) * 0.25;

    return {
      timestamp: timestamp.toISOString(),
      value: Number((50 + wave * 25 + drift * 10).toFixed(2)),
    };
  });

  return {
    parameterKey,
    assetId,
    unit: unitsByParameter[parameterKey] ?? null,
    points,
  };
}
