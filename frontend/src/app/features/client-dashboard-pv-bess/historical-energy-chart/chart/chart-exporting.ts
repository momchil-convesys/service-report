import { formatIntervalForDataExport, formatTimestampForDataExport } from '../../../../app-locale';
import { IntegrationPeriod } from '../../../../constants';
import {
  seriesName_BESSChargedEnergy,
  seriesName_BESSDischargedEnergy,
  seriesName_ExportedToGridHV,
  seriesName_ExportedToGridMV,
  seriesName_ImportedFromGridHV,
  seriesName_ImportedFromGridMV,
  seriesName_PVProduction,
} from '../../../../constants/_chart-series-titles';
import { undefinedOrNumber } from '../../../../helpers';
import { DataRequestWithContext } from '../_data/interfaces';
import { PVBESSHistoricalEnergyData } from '../_data/models';

const SERIES_IDS = [
  'pv-production',
  'charged-energy',
  'discharged-energy',
  'exported-energy-mv',
  'imported-energy-mv',
  'exported-energy-hv',
  'imported-energy-hv',
  'imported-energy-loss',
  'exported-energy-loss',
] as const;

const SERIES_NAMES: { [seriesId: string]: string } = {
  'pv-production': seriesName_PVProduction,
  'charged-energy': seriesName_BESSChargedEnergy,
  'discharged-energy': seriesName_BESSDischargedEnergy,
  'exported-energy-mv': seriesName_ExportedToGridMV,
  'imported-energy-mv': seriesName_ImportedFromGridMV,
  'exported-energy-hv': seriesName_ExportedToGridHV,
  'imported-energy-hv': seriesName_ImportedFromGridHV,
  'imported-energy-loss': $localize`Import Loss (HV - MV)`,
  'exported-energy-loss': $localize`Export Loss (MV - HV)`,
};

export function getDataRows(
  req: undefined | DataRequestWithContext<PVBESSHistoricalEnergyData>,
): (string | number | undefined)[][] {
  const data: PVBESSHistoricalEnergyData | undefined = req?.dataRequest.data;
  const timeZone: string | undefined = req?.plant.timeZone;
  const integrationPeriod = req?.targetRange?.integrationPeriod;

  if (!data || data.dataPoints.length === 0) {
    return [];
  }

  const headerRow: (string | number | undefined)[] = [$localize`Date / Time`];
  SERIES_IDS.forEach((seriesId) => {
    headerRow.push(SERIES_NAMES[seriesId] || seriesId);
  });

  const bodyRows: (string | number | undefined)[][] = [];

  const showInterval =
    integrationPeriod === IntegrationPeriod.Hours ||
    integrationPeriod === IntegrationPeriod.QuaterOfAnHour;

  data.dataPoints.forEach((dataPoint) => {
    const timestamp = new Date(dataPoint.timestamp);
    const pointData = dataPoint.total;

    let formattedDate = '';
    if (dataPoint.interval && showInterval) {
      formattedDate = formatIntervalForDataExport(
        {
          start: new Date(dataPoint.interval.start),
          end: new Date(dataPoint.interval.end),
        },
        timeZone,
      );
    } else {
      formattedDate = formatTimestampForDataExport(timestamp, timeZone, integrationPeriod);
    }

    // Note: charged-energy and imported-energy are negated in the chart for display,
    // but we export the actual values (not negated)
    const row: (string | number | undefined)[] = [
      formattedDate,
      undefinedOrNumber(pointData.pvProduction),
      undefinedOrNumber(pointData.chargedEnergy),
      undefinedOrNumber(pointData.dischargedEnergy),
      undefinedOrNumber(pointData.exportedEnergyMV),
      undefinedOrNumber(pointData.importedEnergyMV),
      undefinedOrNumber(pointData.exportedEnergyHV),
      undefinedOrNumber(pointData.importedEnergyHV),
      undefinedOrNumber(pointData.importedEnergyLoss),
      undefinedOrNumber(pointData.exportedEnergyLoss),
    ];

    bodyRows.push(row);
  });

  return [headerRow, ...bodyRows];
}
