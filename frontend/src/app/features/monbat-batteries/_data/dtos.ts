export interface EnergyDistribution {
  // Power meter +/-
  gridIn: number | null; // Should be zero if not exportging to grid!
  gridOut: number | null; // Energy used from grid (powerMeter > 0)

  // Charging batteries (inverter activePower < 0)
  batteryIn: null | {
    total: number | null;

    fromPv: number | null;
    fromGrid: number | null;
  };

  // Discharging batteries (inverter activePower > 0)
  batteryOut: number | null;

  // Energy produced by PV (applicable only for devices with PV)
  pvOut?: number | null;

  consumption: null | {
    // Case 0: NOT consuming
    //    = 0
    //
    // Case 1: Consuming from grid only
    //    = gridOut - batteryIn (if charging batteries at the same time)
    //
    // Case 2: Consuming from batteries only
    //    = batteryOut ( - gridIn if exporting to grid)
    //
    // Case 3: Consuming from both grid and batteries
    //    = gridOut + batteryOut
    //
    total: number | null;

    fromGrid: number | null; // gridOut - batteryIn
    fromBatteries: number | null; // batteryOut ( - gridIn if exporting to grid)
    fromPv?: number | null; // applicable only for devices with PV
  };
}

/**
 * Represents measured values of parameters
 * in a given moment in time.
 */
export interface HybridInverterDataPointDTO {
  timestamp: string;

  /**
   * Inverter active power (RAW parameter value)
   *
   * Positive when exporting to grid.
   * Negative when consuming from grid.
   *
   * Min: -20kW, Max: 20kW
   */
  activePower: number | null;

  /**
   * Power meter (RAW parameter value)
   */
  powerMeter: number | null;

  /**
   * Energy flow/distribution CALCULATED at backend
   */
  energyDistribution: EnergyDistribution;
}

export interface EnergyTrendDataPointDTO {
  timestamp: string; // ISO UTC
  pvOutput: number | null;
  mainsPower: number | null;
  consumptionPower: number | null;
  feedInPower: number | null;
  batteryIn: number | null;
  batteryOut: number | null;
  integrationPeriod: string | null;
}

export interface HybridInverterHistoricalDataDTO {
  deviceId: string;

  from: string;
  to: string;

  // if > 24 hours: accumulated

  integrationPeriod: string | null; // can be 'day' : if < 24hours -> null

  accumulatedData: EnergyDistribution;

  dataPoints: Array<HybridInverterDataPointDTO>;
}

export interface EnergyTrendDataDTO {
  from: string; // ISO UTC
  to: string; // ISO UTC
  integrationPeriod: string | null;
  deviceId: string;
  dataPoints: EnergyTrendDataPointDTO[];
  timeZone?: string;
}

export interface HybridInverterCurrentDataDTO {
  timestamp: string;
  deviceId: string;

  dataPoint: HybridInverterDataPointDTO;
}
