import { DataAdapter } from '../../../data/adapters';
import { roundValue } from '../../../helpers';
import { PlantMetricsCurrentValuesData_DTO, PowerMetersCumulativeData_DTO } from './dto';
import {
  PlantMetricsCurrentValuesData,
  PowerMetersCumulativeData,
  PowerMetersCumulativeDataPoint,
  PowerMetersCumulativeDataPointsSum,
} from './models';

export function adaptLiveDataData(
  dto: PlantMetricsCurrentValuesData_DTO,
  plantTimeZone: string | undefined,
): PlantMetricsCurrentValuesData {
  const result: PlantMetricsCurrentValuesData = {
    ...dto,
    timestamp: DataAdapter.dtoToModelTimestamp(dto.timestamp),
    timestamp_Zoned: DataAdapter.dtoToModelTimestamp_Zoned(dto.timestamp, plantTimeZone),
    valuesPerSubLevel: dto.valuesPerSubLevel || [],
    allTime_valuesPerSubLevel: dto.allTime_valuesPerSubLevel || [],
    daily_valuesPerSubLevel: dto.daily_valuesPerSubLevel || [],
  };

  return result;
}

export function adaptCumulativeData(
  dto: PowerMetersCumulativeData_DTO,
  exportFileName: string,
  plantTimeZone: string | undefined,
): PowerMetersCumulativeData {
  const dataPoints: PowerMetersCumulativeDataPoint[] = dto.dataPoints.map((p) => ({
    ...p,
    interval: {
      from: DataAdapter.dtoToModelTimestamp(p.interval.from),
      to: DataAdapter.dtoToModelTimestamp(p.interval.to),
    },
  }));

  const result: PowerMetersCumulativeData = {
    ...dto,

    timeRange: {
      from: DataAdapter.dtoToModelTimestamp(dto.timeRange.from),
      to: DataAdapter.dtoToModelTimestamp(dto.timeRange.to),
    },

    dataPoints,

    sum: calcSum(dataPoints),

    exportFileName,
    plantTimeZone,
  };

  return result;
}

function calcSum(dataPoints: PowerMetersCumulativeDataPoint[]): PowerMetersCumulativeDataPointsSum {
  const precisionMultiplier = 1000;
  return {
    energy_Generated: roundValue(sum(dataPoints, 'energy_Generated'), precisionMultiplier),
    energy_Consumed: roundValue(sum(dataPoints, 'energy_Consumed'), precisionMultiplier),

    reactiveEnergy_Generated: roundValue(
      sum(dataPoints, 'reactiveEnergy_Generated'),
      precisionMultiplier,
    ),
    reactiveEnergy_Consumed: roundValue(
      sum(dataPoints, 'reactiveEnergy_Consumed'),
      precisionMultiplier,
    ),

    calculated_reactiveEnergy_Generated: roundValue(
      sum(dataPoints, 'calculated_reactiveEnergy_Generated'),
      precisionMultiplier,
    ),
    calculated_reactiveEnergy_Consumed: roundValue(
      sum(dataPoints, 'calculated_reactiveEnergy_Consumed'),
      precisionMultiplier,
    ),
  };
}

function sum(
  dataPoints: PowerMetersCumulativeDataPoint[],
  key: keyof PowerMetersCumulativeDataPointsSum,
) {
  return dataPoints
    .map((point) => point[key])
    .reduce((accumulator: number, currentValue: number | null) => {
      return accumulator + (currentValue || 0);
    }, 0);
}
