import {
  PVBESSHistoricalPowerData_DataPoint_DTO,
  PVBESSHistoricalPowerData_DTO,
  PVBESSHistoricalPowerData_Point_DTO,
} from './dto';
import {
  PVBESSHistoricalPowerData,
  PVBESSHistoricalPowerData_DataPoint,
  PVBESSHistoricalPowerData_Point,
} from './models';

export function adaptHistoricalPowerData(
  dto: PVBESSHistoricalPowerData_DTO,
): PVBESSHistoricalPowerData {
  return {
    plantId: dto.plantId,
    res: dto.res,
    agg: dto.agg,
    timeRange: dto.timeRange,
    dataPoints: dto.dataPoints.map(adaptPoint),
    lastAggregatedPointTimestamp: undefined,
    pointsToAggregate: [],
  };
}

export function adaptPoint(
  dataPointDTO: PVBESSHistoricalPowerData_Point_DTO,
): PVBESSHistoricalPowerData_Point {
  return {
    timestamp: new Date(dataPointDTO.timestamp),
    total: dataPointDTO.total ? adaptDataPoint(dataPointDTO.total) : undefined,
    subPlant1: dataPointDTO.subPlant1 ? adaptDataPoint(dataPointDTO.subPlant1) : undefined,
    subPlant2: dataPointDTO.subPlant2 ? adaptDataPoint(dataPointDTO.subPlant2) : undefined,
  };
}

function adaptDataPoint(
  dataPointDTO: PVBESSHistoricalPowerData_DataPoint_DTO,
): PVBESSHistoricalPowerData_DataPoint {
  // gridPower is positive when exporting
  const gridPowerMV = dataPointDTO.gridPowerMV ?? null;

  const exportValueMV = gridPowerMV !== null ? (gridPowerMV > 0 ? gridPowerMV : 0) : null;
  const importValueMV = gridPowerMV !== null ? (gridPowerMV < 0 ? gridPowerMV : 0) : null;

  return {
    ...dataPointDTO,
    gridPowerExportMV: exportValueMV,
    gridPowerImportMV: importValueMV,
    gridPowerImportLoss: calcDifference(importValueMV, dataPointDTO.gridPowerImportHV, 'import'),
    gridPowerExportLoss: calcDifference(exportValueMV, dataPointDTO.gridPowerExportHV, 'export'),
  };
}

function calcDifference(
  gridPowerMV: number | null | undefined,
  gridPowerHV: number | null | undefined,
  type: 'import' | 'export',
): number | null {
  if (
    gridPowerMV === null ||
    gridPowerMV === undefined ||
    gridPowerHV === null ||
    gridPowerHV === undefined
  ) {
    return null;
  }
  return type === 'import' ? gridPowerHV - gridPowerMV : gridPowerMV - gridPowerHV;
}
