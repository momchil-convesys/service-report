export interface BESSAssetMetrics_DataPoint_DTO {
  /**
   * Asset ID this data belongs to.
   */
  assetId: string;

  /**
   * Measurement timestamp (ISO 8601)
   */
  timestamp: string;

  /**
   * Key or ID of the parameter depending on the request context.
   *
   * If "verbose" is true, then the key is the parameter key.
   * If "verbose" is false, then the key is the parameter ID.
   *
   * Example (verbose=true):
   * {
   *   "activePower": 100,
   *   "batteryVoltage": 120,
   *   "batteryTemperature": 25
   * }
   *
   * Example (verbose=false):
   * {
   *   "1": 100,
   *   "2": 120,
   *   "3": 25
   * }
   */
  values: { [parameterKeyOrId: string]: number | null };
}
