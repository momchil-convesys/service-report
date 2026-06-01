import { PVBESSHistoricalEnergyData_DataPoint_DTO, PVBESSHistoricalEnergyData_DTO } from './dto';

export interface PVBESSHistoricalEnergyData extends Omit<
  PVBESSHistoricalEnergyData_DTO,
  'timeRange'
> {
  timeRange: {
    from: Date;
    to: Date;
  };

  dataPoints: Array<PVBESSHistoricalEnergyData_Point>;
}

export interface PVBESSHistoricalEnergyData_Point {
  timestamp: string; // ISO timestamp in UTC

  // When interval is implemented at backend,
  // we will remove timestamp
  interval?: {
    start: string;
    end: string;
  };

  total: PVBESSHistoricalEnergyData_DataPoint;
  subPlant1: PVBESSHistoricalEnergyData_DataPoint;
  subPlant2: PVBESSHistoricalEnergyData_DataPoint;
}

export interface PVBESSHistoricalEnergyData_DataPoint extends PVBESSHistoricalEnergyData_DataPoint_DTO {
  exportedEnergyLoss: number | null;
  importedEnergyLoss: number | null;
}
