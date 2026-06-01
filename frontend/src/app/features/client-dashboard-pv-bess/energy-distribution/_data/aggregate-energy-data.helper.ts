import { utcToZonedTimeSafe } from '../../../../helpers';
import {
  PVBESSHistoricalEnergyData,
  PVBESSHistoricalEnergyData_Point,
} from '../../historical-energy-chart/_data/models';
import { EnergyDistributionSummary } from './model';

function sumEnergyValues(
  value1: number | null | undefined,
  value2: number | null | undefined,
): number | null {
  if ((value1 === null || value1 === undefined) && (value2 === null || value2 === undefined)) {
    return null;
  }
  if (value1 === null || value1 === undefined) {
    return value2 ?? null;
  }
  if (value2 === null || value2 === undefined) {
    return value1 ?? null;
  }
  return value1 + value2;
}

/**
 * Aggregates historical energy chart data into energy distribution summary.
 * Sums all intervals in the chart data to get the total energy distribution.
 */
export function aggregateEnergyDistributionFromChartData(
  chartData: PVBESSHistoricalEnergyData | undefined,
  plantTimeZone: string | undefined,
): EnergyDistributionSummary | null {
  if (!chartData || !chartData.dataPoints || chartData.dataPoints.length === 0) {
    return null;
  }

  const nowInPlantTimeZone = utcToZonedTimeSafe(new Date(), plantTimeZone);
  const result: EnergyDistributionSummary = {
    zonedUpdatedAt: nowInPlantTimeZone,
    from: chartData.timeRange.from,
    to: chartData.timeRange.to,
    exportedToGridMV: {
      subPlant1: null,
      subPlant2: null,
      total: null,
    },
    importedFromGridMV: {
      subPlant1: null,
      subPlant2: null,
      total: null,
    },
    exportedToGridHV: {
      subPlant1: null,
      subPlant2: null,
      total: null,
    },
    importedFromGridHV: {
      subPlant1: null,
      subPlant2: null,
      total: null,
    },
    chargedToBatteries: {
      subPlant1: null,
      subPlant2: null,
      total: null,
    },
    dischargedFromBatteries: {
      subPlant1: null,
      subPlant2: null,
      total: null,
    },
    pvProduction: {
      subPlant1: null,
      subPlant2: null,
      total: null,
    },
    exportedEnergyLoss: {
      subPlant1: null,
      subPlant2: null,
      total: null,
    },
    importedEnergyLoss: {
      subPlant1: null,
      subPlant2: null,
      total: null,
    },
  };

  chartData.dataPoints.forEach((point: PVBESSHistoricalEnergyData_Point) => {
    result.exportedToGridMV.subPlant1 = sumEnergyValues(
      result.exportedToGridMV.subPlant1,
      point.subPlant1.exportedEnergyMV,
    );
    result.exportedToGridMV.subPlant2 = sumEnergyValues(
      result.exportedToGridMV.subPlant2,
      point.subPlant2.exportedEnergyMV,
    );
    result.exportedToGridMV.total = sumEnergyValues(
      result.exportedToGridMV.total,
      point.total.exportedEnergyMV,
    );
    result.importedFromGridMV.subPlant1 = sumEnergyValues(
      result.importedFromGridMV.subPlant1,
      point.subPlant1.importedEnergyMV,
    );
    result.importedFromGridMV.subPlant2 = sumEnergyValues(
      result.importedFromGridMV.subPlant2,
      point.subPlant2.importedEnergyMV,
    );
    result.importedFromGridMV.total = sumEnergyValues(
      result.importedFromGridMV.total,
      point.total.importedEnergyMV,
    );
    result.exportedToGridHV.subPlant1 = sumEnergyValues(
      result.exportedToGridHV.subPlant1,
      point.subPlant1.exportedEnergyHV ?? null,
    );
    result.exportedToGridHV.subPlant2 = sumEnergyValues(
      result.exportedToGridHV.subPlant2,
      point.subPlant2.exportedEnergyHV ?? null,
    );
    result.exportedToGridHV.total = sumEnergyValues(
      result.exportedToGridHV.total,
      point.total.exportedEnergyHV ?? null,
    );
    result.importedFromGridHV.subPlant1 = sumEnergyValues(
      result.importedFromGridHV.subPlant1,
      point.subPlant1.importedEnergyHV ?? null,
    );
    result.importedFromGridHV.subPlant2 = sumEnergyValues(
      result.importedFromGridHV.subPlant2,
      point.subPlant2.importedEnergyHV ?? null,
    );
    result.importedFromGridHV.total = sumEnergyValues(
      result.importedFromGridHV.total,
      point.total.importedEnergyHV ?? null,
    );
    result.chargedToBatteries.subPlant1 = sumEnergyValues(
      result.chargedToBatteries.subPlant1,
      point.subPlant1.chargedEnergy,
    );
    result.chargedToBatteries.subPlant2 = sumEnergyValues(
      result.chargedToBatteries.subPlant2,
      point.subPlant2.chargedEnergy,
    );
    result.chargedToBatteries.total = sumEnergyValues(
      result.chargedToBatteries.total,
      point.total.chargedEnergy,
    );
    result.dischargedFromBatteries.subPlant1 = sumEnergyValues(
      result.dischargedFromBatteries.subPlant1,
      point.subPlant1.dischargedEnergy,
    );
    result.dischargedFromBatteries.subPlant2 = sumEnergyValues(
      result.dischargedFromBatteries.subPlant2,
      point.subPlant2.dischargedEnergy,
    );
    result.dischargedFromBatteries.total = sumEnergyValues(
      result.dischargedFromBatteries.total,
      point.total.dischargedEnergy,
    );
    result.pvProduction.subPlant1 = sumEnergyValues(
      result.pvProduction.subPlant1,
      point.subPlant1.pvProduction,
    );
    result.pvProduction.subPlant2 = sumEnergyValues(
      result.pvProduction.subPlant2,
      point.subPlant2.pvProduction,
    );
    result.pvProduction.total = sumEnergyValues(
      result.pvProduction.total,
      point.total.pvProduction,
    );

    result.exportedEnergyLoss.subPlant1 = calcDifference(
      result.exportedToGridMV.subPlant1,
      result.exportedToGridHV.subPlant1,
      'export',
    );
    result.exportedEnergyLoss.subPlant2 = calcDifference(
      result.exportedToGridMV.subPlant2,
      result.exportedToGridHV.subPlant2,
      'export',
    );
    result.exportedEnergyLoss.total = calcDifference(
      result.exportedToGridMV.total,
      result.exportedToGridHV.total,
      'export',
    );

    result.importedEnergyLoss.subPlant1 = calcDifference(
      result.importedFromGridMV.subPlant1,
      result.importedFromGridHV.subPlant1,
      'import',
    );
    result.importedEnergyLoss.subPlant2 = calcDifference(
      result.importedFromGridMV.subPlant2,
      result.importedFromGridHV.subPlant2,
      'import',
    );
    result.importedEnergyLoss.total = calcDifference(
      result.importedFromGridMV.total,
      result.importedFromGridHV.total,
      'import',
    );
  });

  return result;
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
