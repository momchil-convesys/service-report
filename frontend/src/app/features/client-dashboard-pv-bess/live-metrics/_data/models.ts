/**
 * GET /pv-bess-live-metrics ? plantId=${plantId} & sse=true
 *
 * Response type: text/event-stream
 *
 * Response data example:
 * {
 *   "updatedAt": "2026-01-19T12:00:00.000Z",
 *   "values": {
 *     "bess": { "total": 100, "subPlant1": 50, "subPlant2": 50 },
 *     "pv": { "total": 200, "subPlant1": 100, "subPlant2": 100 },
 *     "exported": { "total": 300, "subPlant1": 150, "subPlant2": 150 }
 *     ...
 *   }
 * }
 *
 * SSE: Update values with DATA_REPLACE (resend the whole object with new values).
 */

export interface PvBessLiveMetricValues {
  total: number | null;
  subPlant1: number | null;
  subPlant2: number | null;
}

export interface PvBessLiveMetricsData {
  updatedAt: string;

  values: {
    pvPower?: PvBessLiveMetricValues;
    gridPowerMV?: PvBessLiveMetricValues; // Medium Voltage Grid Power
    gridPowerHV?: PvBessLiveMetricValues; // High Voltage Grid Power
    bessPower?: PvBessLiveMetricValues;
    soc?: PvBessLiveMetricValues;
    maximumChargeableEnergy?: PvBessLiveMetricValues;
    maximumDischargeableEnergy?: PvBessLiveMetricValues;
  };

  // populated at frontend
  zonedUpdatedAt?: Date;
}
