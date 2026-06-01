/**
 * -------------------------------------------------------------------------------------------------
 * REQUEST to fetch historical data.
 *
 * POST method is used instead of GET to allow describing the request in the body.
 *
 * POST /bess/{bessId}/historical-data ? sse=true (optional)
 *
 * If timeRange.to is in the future, "sse=true" will be provided in the query params
 * and the response will be streamed via SSE.
 * Initial data with event name DATA_INIT and subsequent data with event name DATA_APPEND.
 * Current point can be updated live with event name DATA_PATCH.
 *
 * If timeRange.to is in the past, sse parameter will be omitted
 * and the response will be a finalized object.
 */

export interface BESSHistoricalDataRequestDTO {
  timeRange: {
    from: string; // ISO timestamp
    to: string; // ISO timestamp
  };

  series: Array<{
    /**
     * Unique per series, defined by the frontend
     * and later used to identify the series in the response.
     */
    seriesId: string;

    /**
     * Exact asset IDs this series should be based on.
     * If length === 1 -> per-asset series. This will be the most common case.
     * If length > 1 -> must use assetAggregationFunction to combine them.
     */
    assetIds: string[];

    /**
     * The logical parameter ID this series is based on.
     */
    logicalParameterId: string;

    /**
     * Temporary for debugging purposes.
     * Will be removed in the future.
     *
     * E.g: "activePower", "batteryVoltage", "batteryTemperature", etc.
     */
    logicalParameterKey?: string;

    /**
     * Optional time aggregation.
     * - If timeAggregation is provided -> samples are aggregated in time.
     * - If timeAggregation is omitted (undefined) -> raw samples are returned (no aggregation).
     *
     * E.g:
     * timeAggregation:{
     *   period: {
     *     value: 15;
     *     unit: 'minute';
     *   };
     *   function: 'sum';
     * }
     *
     * NOTE: The old term "integration period" is a specific type of time aggregation
     * applicable only for cumulative parameters where sum is used (e.g. energy counters).
     * Here we use the more generic term "time aggregation" instead,
     * because it describes the general concept of aggregating data over a period of time.
     */
    timeAggregation?: {
      period: {
        value: number;
        unit: 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year';
      };

      /**
       * avg, min, max for instantaneous parameters.
       * sum for cumulative parameters.
       */
      function: 'avg' | 'sum' | 'min' | 'max';
    };

    /**
     * Function to aggregate multiple assets into a single value.
     * Only used if assetIds.length > 1.
     *
     * E.g: A request for active power for multiple inverters will use 'sum'
     * to aggregate the power from all inverters into a single value.
     */
    assetAggregationFunction?: 'avg' | 'sum' | 'min' | 'max';
  }>;
}

const EXAMPLE_REQUEST: BESSHistoricalDataRequestDTO = {
  timeRange: {
    from: '2024-01-01T00:00:00Z',
    to: '2024-01-01T23:59:59Z',
  },
  series: [
    {
      seriesId: 'activePower-inv1-uniquehash', // this is defined in the frontend
      assetIds: ['INV-01'],
      logicalParameterId: '1',
      timeAggregation: {
        period: {
          value: 15,
          unit: 'minute',
        },
        function: 'sum',
      },
    },
  ],
};
