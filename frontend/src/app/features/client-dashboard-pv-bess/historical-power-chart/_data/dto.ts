import { DataAggregationFunction, DataResolutionPeriod } from './constants';

/**
 * -------------------------------------------------------------------------------------------------
 * REQUEST to fetch historical power data for a plant.
 *
 * GET /pv-bess-historical-power-data ? plantId={plantId} & from={from} & to={to} & sse=true (optional)
 *
 * Query params:
 *    plantId: string
 *    from: string // ISO timestamp
 *    to: string // ISO timestamp
 *    res: '1s' | '5s' | '15s' | '30s' | '1m' | '1h' | '1d'
 *    agg: 'avg' | 'last'
 *    sse: 'true' | 'false' (optional)
 *
 * SSE:
 * If query param "sse" is set to "true" then the response is expected to be streamed via SSE.
 * Initial data with event name DATA_INIT and subsequent data with event name DATA_APPEND.
 * Current point can be updated live with event name DATA_PATCH.
 * Content type of the response should be "text/event-stream".
 * SSE data is always 1 point per second regardless of the requested resolution.
 *
 * If query param "sse" is omitted or set to "false" then the response will be a finalized object.
 * Content type of the response should be "application/json".
 *
 * Response:
 *  Object of type PVBESSHistoricalPowerData_DTO
 *
 * Example request:
 *    GET /pv-bess-power-data-for-plant ? plantId=1 & from=2026-01-16T22:00:00.000Z & to=2026-01-17T21:59:59.999Z
 */
export interface PVBESSHistoricalPowerData_DTO {
  /**
   * Requested plant ID.
   * Included in response for data integrity and debugging purposes.
   */
  plantId: string;

  /**
   * Requested resolution.
   * Included in response for data integrity and debugging purposes.
   */
  res: DataResolutionPeriod;

  /**
   * Requested aggregation function.
   * Included in response for data integrity and debugging purposes.
   */
  agg: DataAggregationFunction;

  /**
   * Requested time range.
   * Included in response for data integrity and debugging purposes.
   *
   * E.g:
   *    "from": "2026-01-16T22:00:00.000Z",
   *    "to": "2026-01-17T21:59:59.999Z"
   */
  timeRange: {
    from: string; // ISO timestamp in UTC
    to: string; // ISO timestamp in UTC
  };

  dataPoints: Array<PVBESSHistoricalPowerData_Point_DTO>;
}

export interface PVBESSHistoricalPowerData_Point_DTO {
  timestamp: string; // ISO timestamp in UTC
  total?: PVBESSHistoricalPowerData_DataPoint_DTO;
  subPlant1?: PVBESSHistoricalPowerData_DataPoint_DTO;
  subPlant2?: PVBESSHistoricalPowerData_DataPoint_DTO;
}

export interface PVBESSHistoricalPowerData_DataPoint_DTO {
  pvPower?: number | null;
  bessPower?: number | null; // Positive when discharging, negative when charging

  // Medium Voltage Grid Power
  // Positive when exporting, negative when importing
  gridPowerMV?: number | null;

  // High Voltage Grid Power
  // Separate parameters for export and import
  gridPowerExportHV?: number | null;
  gridPowerImportHV?: number | null;

  chargeableEnergy?: number | null; // in kWh
  dischargeableEnergy?: number | null; // in kWh
}
