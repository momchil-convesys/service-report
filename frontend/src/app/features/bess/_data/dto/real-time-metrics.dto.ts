import { BESSAssetType } from './assets/asset-base.dto';

/**
 * Request model for fetching real-time metrics data from BESS assets.
 *
 * This model specifies which assets and which parameters to monitor.
 * It supports filtering by specific asset IDs or by asset types (e.g., all BatteryContainers),
 * and allows specifying which parameters to retrieve.
 *
 * Example use cases:
 * - Fetch state of charge and state of health for all battery containers
 * - Fetch active power for the BESS itself and all inverters
 * - Fetch specific parameters for specific assets
 */
export interface BESSRealTimeMetricsRequestDTO {
  /**
   * The ID of the BESS to fetch metrics for.
   */
  bessId: string;

  /**
   * Asset filters specifying which assets to monitor.
   * Can include:
   * - Specific asset IDs (e.g., ["bc-001", "bc-002"])
   * - Asset types to include all assets of that type (e.g., [{ type: "BESSBatteryContainer" }])
   * - The BESS itself (e.g., [{ type: "BESSItself" }])
   * - A mix of both
   *
   * Examples:
   * - [{ type: BESSAssetType.BatteryContainer }] - all battery containers
   * - [{ type: BESSAssetType.BESSItself }] - the BESS itself
   * - [{ assetId: "bc-001" }, { assetId: "bc-002" }] - specific containers
   * - [{ type: BESSAssetType.BatteryContainer }, { assetId: "bess-001" }] - all containers + BESS
   */
  assetFilters: BESSAssetFilter[];

  /**
   * Array of parameter keys to retrieve for the specified assets.
   * These should match the 'key' field from BESSParameterDefinitionDTO.
   *
   * Examples:
   * - ["stateOfCharge", "stateOfHealth"]
   * - ["activePower", "reactivePower"]
   * - ["batteryVoltage", "batteryTemperature"]
   */
  parameterKeys: string[];

  /**
   * Optional time span in seconds for real-time data window.
   * If provided, returns data points within this time window from the current time.
   * If omitted, returns only the latest data point for each asset-parameter combination.
   */
  timeSpanSeconds?: number;

  /**
   * If true, returns parameter keys in the response.
   * If false, returns parameter IDs.
   * Defaults to false.
   */
  verbose?: boolean;
}

/**
 * Asset filter specifying which assets to include in the metrics request.
 */
export type BESSAssetFilter =
  | {
      /**
       * Filter by asset type. Includes all assets of the specified type.
       */
      type: BESSAssetType;
    }
  | {
      /**
       * Filter by specific asset ID.
       */
      assetId: string;
    };

/**
 * Response model for real-time metrics data from BESS assets.
 *
 * Contains time-series data points for the requested assets and parameters.
 * Each data point contains the asset ID, timestamp, and values for all requested parameters.
 */
export interface BESSRealTimeMetricsResponseDTO {
  /**
   * Array of data points, each containing metrics for a specific asset at a specific time.
   * Data points are ordered by timestamp (ascending).
   */
  dataPoints: BESSRealTimeMetricsDataPoint[];

  /**
   * Optional timezone information for timestamp interpretation.
   * If provided, all timestamps should be interpreted in this timezone.
   */
  timeZone?: string;
}

/**
 * A single data point containing metrics for one asset at one point in time.
 */
export interface BESSRealTimeMetricsDataPoint {
  /**
   * Asset ID this data point belongs to.
   */
  assetId: string;

  /**
   * Asset type for convenience (reduces need to look up from metadata).
   */
  assetType: BESSAssetType;

  /**
   * Optional asset name for convenience (reduces need to look up from metadata).
   */
  assetName?: string;

  /**
   * Measurement timestamp (ISO 8601 format).
   */
  timestamp: string;

  /**
   * Parameter values for this asset at this timestamp.
   *
   * The key format depends on the 'verbose' flag in the request:
   * - If verbose=true: keys are parameter keys (e.g., "stateOfCharge", "stateOfHealth")
   * - If verbose=false: keys are parameter IDs (e.g., "1", "2", "3")
   *
   * Values are numbers or null if the parameter value is unavailable.
   *
   * Example (verbose=true):
   * {
   *   "stateOfCharge": 85.5,
   *   "stateOfHealth": 92.3
   * }
   *
   * Example (verbose=false):
   * {
   *   "1": 85.5,
   *   "2": 92.3
   * }
   */
  values: { [parameterKeyOrId: string]: number | null };
}
