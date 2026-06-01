/**
 * -------------------------------------------------------------------------------------------------
 * REQUEST to fetch historical energy data for a plant.
 *
 * GET /pv-bess-historical-energy-data
 *        ? plantId={plantId}
 *        & from={from}
 *        & to={to}
 *        & integrationPeriod={integrationPeriod}
 *        & sse=true (optional)
 *
 * Query params:
 *    plantId: string
 *    from: string // ISO timestamp in UTC (e.g: "2026-01-16T22:00:00.000Z")
 *    to: string // ISO timestamp in UTC (e.g: "2026-01-17T21:59:59.999Z")
 *    integrationPeriod: 'years' | 'months' | 'weeks' | 'days' | 'hours' | 'quarterOfAnHour' | 'minutes' | 'seconds'
 *
 * SSE:
 * If query param "sse" is set to "true" then the response is expected to be streamed via SSE.
 * Initial data with event name DATA_INIT and subsequent data with event name DATA_APPEND.
 * Current point can be updated live with event name DATA_PATCH.
 * Content type of the response should be "text/event-stream".
 *
 * If query param "sse" is omitted or set to "false" then the response will be a finalized object.
 * Content type of the response should be "application/json".
 *
 * Response:
 *  Object of type PVBESSHistoricalEnergyData_DTO
 *
 * Example request:
 *    GET /pv-bess-historical-energy-data
 *        ? plantId=1
 *        & from=2026-01-16T22:00:00.000Z
 *        & to=2026-01-17T21:59:59.999Z
 *        & integrationPeriod=hours
 */
export interface PVBESSHistoricalEnergyData_DTO {
  /**
   * Requested plant ID.
   * Included in response for data integrity and debugging purposes.
   */
  plantId: string;

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

  /**
   * Requested integration period.
   * Included in response for data integrity and debugging purposes.
   */
  integrationPeriod:
    | 'years'
    | 'months'
    | 'weeks'
    | 'days'
    | 'hours'
    | 'quarterOfAnHour'
    | 'minutes'
    | 'seconds';

  dataPoints: Array<PVBESSHistoricalEnergyData_Point_DTO>;
}

export interface PVBESSHistoricalEnergyData_Point_DTO {
  timestamp: string; // ISO timestamp in UTC

  // When interval is implemented at backend,
  // we will remove timestamp
  interval?: {
    start: string;
    end: string;
  };

  total: PVBESSHistoricalEnergyData_DataPoint_DTO;
  subPlant1: PVBESSHistoricalEnergyData_DataPoint_DTO;
  subPlant2: PVBESSHistoricalEnergyData_DataPoint_DTO;
}

export interface PVBESSHistoricalEnergyData_DataPoint_DTO {
  pvProduction?: number | null;

  chargedEnergy?: number | null;
  dischargedEnergy?: number | null;

  exportedEnergyMV?: number | null;
  importedEnergyMV?: number | null;

  exportedEnergyHV?: number | null;
  importedEnergyHV?: number | null;
}

export const exampleResponse: PVBESSHistoricalEnergyData_DTO = {
  plantId: '1',
  timeRange: {
    from: '2026-01-16T22:00:00.000Z',
    to: '2026-01-17T21:59:59.999Z',
  },
  integrationPeriod: 'hours',
  dataPoints: [
    {
      timestamp: '2026-01-16T22:00:00.000Z',
      total: {
        pvProduction: 0,
        chargedEnergy: 12000,
        dischargedEnergy: 0,
        exportedEnergyMV: 0,
        importedEnergyMV: 12000,
      },
      subPlant1: {
        pvProduction: 0,
        chargedEnergy: 5000,
        dischargedEnergy: 0,
        exportedEnergyMV: 0,
        importedEnergyMV: 5000,
      },
      subPlant2: {
        pvProduction: 0,
        chargedEnergy: 7000,
        dischargedEnergy: 0,
        exportedEnergyMV: 0,
        importedEnergyMV: 7000,
      },
    },
  ],
};
