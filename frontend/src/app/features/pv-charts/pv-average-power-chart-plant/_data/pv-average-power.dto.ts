/**
 * Relevant for plant only.
 */
export interface PVAveragePowerDataDTO {
  from: string;
  to: string;

  plantId: string;

  /**
   * The requirement is for 15 min intervals,
   * but the implementation should be more generic.
   *
   * TODO:
   * user defined periods or more predefined options for granularity
   * E.g: 1 minute, 5 minutes, 30 minutes...
   */
  integrationPeriod: 'quarterOfAnHour' | 'hours ' | 'days' | 'months';

  dataPoints: Array<{
    timestamp: string;
    value: number | null;
  }>;
}

/**
 * Similar to the /pv-production request...
 *
 * GET /pv-average-power
 *        ? plantId = 666
 *        & from = 2024-08-01T21:00:00.000Z
 *        & to = 2024-08-02T20:59:59.999Z
 *        & integrationPeriod = quarterOfAnHour
 *        & sse = true or false
 *
 * Note that timestamps are in UTC
 * (not aligned to the start and end of day as in the pv-production request)
 *
 * Timestamps in data points denote the end of the period.
 *
 * E.g:
 * point = {
 *    "timestamp":"2024-08-02T11:30:00Z",
 *    "value": 17600
 * }
 *
 * means that the Average Power was 17600 kW from 11:15 to 11:30
 *
 */
