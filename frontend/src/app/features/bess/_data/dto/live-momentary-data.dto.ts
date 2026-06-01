import { BESSAssetType } from './assets/asset-base.dto';

/**
 * -------------------------------------------------------------------------------------------------
 * REQUEST to subscribe to live data via SSE POST request.
 *
 * POST /bess/{bessId}/live-momentary-data?sse=true
 */

export interface BESSLiveMomentaryDataRequestDTO {
  /**
   * Array of independent watch definitions.
   * One watch = one group of assets + one group of logical parameter IDs.
   */
  watches: Array<{
    assetFilter: {
      /**
       * Explicit list of asset IDs to watch.
       * If provided, assetType is ignored.
       */
      assetIds?: string[];

      /**
       * Select all assets of this type.
       * Required if assetIds is not provided.
       */
      assetType?: BESSAssetType;
    };

    /**
     * Defines which parameters to watch (logical parameters).
     */
    logicalParameterIds: string[];

    /**
     * Temporary for debugging purposes.
     * Will be removed in the future.
     */
    logicalParameterKeys?: string[];
  }>;

  /**
   * TBD: verbose option may allow parameters to be described
   * by their human friendly keys instead of ids.
   * For debugging purposes.
   *
   * If verbose = true here in the request, this will only affect the response model.
   */
  verbose?: boolean;
}

const EXAMPLE_REQUEST: BESSLiveMomentaryDataRequestDTO = {
  watches: [
    {
      assetFilter: { assetType: BESSAssetType.BESSItself },
      logicalParameterIds: ['10', '11'],
    },
    {
      assetFilter: { assetType: BESSAssetType.BatteryRack },
      logicalParameterIds: ['1', '4'],
    },
    {
      assetFilter: { assetIds: ['INV-01', 'INV-02'] },
      logicalParameterIds: ['20', '21'],
    },
    {
      assetFilter: { assetIds: ['RACK-12'] },
      logicalParameterIds: ['7'],
    },
  ],
};

/**
 * -------------------------------------------------------------------------------------------------
 * RESPONSE to the live data subscription request.
 *
 */

export interface BESSLiveMomentaryDataMessageDTO {
  /**
   * Time of reading the values from database.
   * NOT the time of measurement.
   * ISO formatted UTC timestamp "YYYY-MM-DDTHH:mm:ss.sssZ" ("2016-01-02T12:30:00.000Z")
   *
   * From user perspective, this is "last check time",
   * which is different from the time of measurement, which is provided for each value.
   * The difference between these two times is used to determine if data is stale (out of date).
   */
  timestamp: string;

  /**
   * Array of updates for the assets that changed values.
   */
  assets: Array<{
    assetId: string;

    /**
     * Example: { "10": [1763035176, 72], "11": [1763035176, 97], "12": [1763035176, null] }
     * The first number in the array is unix timestamp (seconds since epoch) when the value was measured (logged to database).
     * The second number (or null) is the value.
     */
    values: Record<string, [number, number | null]>;
  }>;

  /**
   * TBD: verbose option may allow parameters to be described
   * by their human friendly keys instead of ids.
   * For debugging purposes.
   *
   * When true, the values in the response will be expectes as:
   * { "stateOfCharge": 73, "activePower": 98, "someOtherParameterKey": null }
   */
  verbose?: boolean;
}

const EXAMPLE_RESPONSE: BESSLiveMomentaryDataMessageDTO = {
  timestamp: '2025-01-22T12:02:01.140Z',
  assets: [
    {
      assetId: 'BESS-ITSELF',
      values: {
        '10': [1763035176, 72],
        '11': [1763035176, 98],
      },
    },
    {
      assetId: 'BB-03',
      values: {
        '10': [1763035176, 88],
        '4': [1763035176, 26.3],
      },
    },
    {
      assetId: 'INV-01',
      values: {
        '20': [1763035176, 112.3],
        '21': [1763035176, -12.1],
      },
    },
    {
      assetId: 'INV-02',
      values: {
        '20': [1763035176, 117.9],
        '21': [1763035176, null],
      },
    },
    {
      assetId: 'RACK-12',
      values: {
        '7': [1763035176, 33.1],
      },
    },
  ],
};

/**
 * SSE message will be wrapped in the following way:
 * event: DATA_REPLACE
 * data: { ...EXAMPLE_RESPONSE }
 *
 * It is also possible to implement DATA_PATCH
 * for partial updates.
 */
