import { IntegrationPeriod } from '../../../../constants';
import {
  PVBESSHistoricalEnergyData_DataPoint_DTO,
  PVBESSHistoricalEnergyData_DTO,
  PVBESSHistoricalEnergyData_Point_DTO,
} from './dto';
import {
  PVBESSHistoricalEnergyData,
  PVBESSHistoricalEnergyData_DataPoint,
  PVBESSHistoricalEnergyData_Point,
} from './models';

/**
 * Adapter function to transform backend DTO to chart model format.
 * Converts integration period string to IntegrationPeriod enum.
 */
export function adaptEnergyDataToChartModel(
  dto: PVBESSHistoricalEnergyData_DTO,
): PVBESSHistoricalEnergyData {
  // Map integration period string to IntegrationPeriod enum
  const integrationPeriodMap: Record<string, IntegrationPeriod> = {
    years: IntegrationPeriod.Years,
    months: IntegrationPeriod.Months,
    weeks: IntegrationPeriod.Weeks,
    days: IntegrationPeriod.Days,
    hours: IntegrationPeriod.Hours,
    quarterOfAnHour: IntegrationPeriod.QuaterOfAnHour,
    minutes: IntegrationPeriod.Minutes,
    seconds: IntegrationPeriod.Seconds,
  };

  const integrationPeriod =
    integrationPeriodMap[dto.integrationPeriod] || IntegrationPeriod.QuaterOfAnHour;

  return {
    plantId: dto.plantId,
    timeRange: {
      from: new Date(dto.timeRange.from),
      to: new Date(dto.timeRange.to),
    },
    integrationPeriod,
    dataPoints: dto.dataPoints.map(adaptPoint),
  };
}

function adaptPoint(
  pointDTO: PVBESSHistoricalEnergyData_Point_DTO,
): PVBESSHistoricalEnergyData_Point {
  return {
    timestamp: pointDTO.timestamp,
    total: adaptDataPoint(pointDTO.total),
    subPlant1: adaptDataPoint(pointDTO.subPlant1),
    subPlant2: adaptDataPoint(pointDTO.subPlant2),
  };
}

function adaptDataPoint(
  dataPointDTO: PVBESSHistoricalEnergyData_DataPoint_DTO,
): PVBESSHistoricalEnergyData_DataPoint {
  return {
    ...dataPointDTO,
    exportedEnergyLoss: calcDifference(
      dataPointDTO.exportedEnergyMV,
      dataPointDTO.exportedEnergyHV,
      'export',
    ),
    importedEnergyLoss: calcDifference(
      dataPointDTO.importedEnergyMV,
      dataPointDTO.importedEnergyHV,
      'import',
    ),
  };
}

function calcDifference(
  valueMV: number | null | undefined,
  valueHV: number | null | undefined,
  type: 'export' | 'import',
): number | null {
  if (valueMV === null || valueMV === undefined || valueHV === null || valueHV === undefined) {
    return null;
  }

  return type === 'import' ? valueHV - valueMV : valueMV - valueHV;
}
