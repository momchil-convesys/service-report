import { DataAggregationFunction, DataResolutionPeriod } from './constants';

export interface PVBESSHistoricalPowerData {
  plantId: string;
  res: DataResolutionPeriod;
  agg: DataAggregationFunction;

  timeRange: {
    from: string; // ISO timestamp in UTC
    to: string; // ISO timestamp in UTC
  };

  dataPoints: Array<PVBESSHistoricalPowerData_Point>;

  // Collected from SSE

  lastAggregatedPointTimestamp: Date | undefined;
  pointsToAggregate: Array<PVBESSHistoricalPowerData_Point>;
}

export interface PVBESSHistoricalPowerData_Point {
  timestamp: Date;
  total?: PVBESSHistoricalPowerData_DataPoint;
  subPlant1?: PVBESSHistoricalPowerData_DataPoint;
  subPlant2?: PVBESSHistoricalPowerData_DataPoint;
}

export interface PVBESSHistoricalPowerData_DataPoint {
  pvPower?: number | null;
  bessPower?: number | null; // Positive when discharging, negative when charging

  // Medium Voltage Grid Power
  // Calculated from gridPowerMV: Positive when exporting, negative when importing
  gridPowerExportMV?: number | null;
  gridPowerImportMV?: number | null;

  // High Voltage Grid Power
  // Separate parameters for export and import
  gridPowerExportHV?: number | null;
  gridPowerImportHV?: number | null;

  chargeableEnergy?: number | null; // in kWh
  dischargeableEnergy?: number | null; // in kWh

  // Calculated values

  // Difference between MV and HV grid power
  gridPowerImportLoss: number | null;
  gridPowerExportLoss: number | null;
}
