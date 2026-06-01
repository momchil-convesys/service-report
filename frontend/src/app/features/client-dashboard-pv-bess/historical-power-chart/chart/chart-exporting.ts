import { formatTimestampForDataExport } from '../../../../app-locale';
import { undefinedOrNumber } from '../../../../helpers';
import { PVBESSHistoricalPowerData } from '../_data/models';

export function getDataRows(
  data: PVBESSHistoricalPowerData | undefined,
  timeZone: string | undefined,
): (string | number | undefined)[][] {
  if (!data || data.dataPoints.length === 0) {
    return [];
  }

  const headerRow: (string | number | undefined)[] = [
    $localize`Date / Time`,
    $localize`PV Active Power (kW)`,
    $localize`BESS Power (kW)`,
    $localize`Grid Power Export (MV) (kW)`,
    $localize`Grid Power Import (MV) (kW)`,
    $localize`Grid Power Export (HV) (kW)`,
    $localize`Grid Power Import (HV) (kW)`,
    $localize`Chargeable Energy (kWh)`,
    $localize`Dischargeable Energy (kWh)`,
  ];

  const bodyRows: (string | number | undefined)[][] = [];

  data.dataPoints.forEach((dataPoint) => {
    const timestamp = new Date(dataPoint.timestamp);
    const pointData = dataPoint.total;

    const formattedDate = formatTimestampForDataExport(timestamp, timeZone, undefined);

    // Export actual values from data model:
    // - bessPower: positive when discharging, negative when charging
    // - gridPower: positive when exporting, negative when importing

    const row: (string | number | undefined)[] = [
      formattedDate,
      undefinedOrNumber(pointData?.pvPower),
      undefinedOrNumber(pointData?.bessPower),
      undefinedOrNumber(pointData?.gridPowerExportMV),
      undefinedOrNumber(pointData?.gridPowerImportMV),
      undefinedOrNumber(pointData?.gridPowerExportHV),
      undefinedOrNumber(pointData?.gridPowerImportHV),
      undefinedOrNumber(pointData?.chargeableEnergy),
      undefinedOrNumber(pointData?.dischargeableEnergy),
    ];

    bodyRows.push(row);
  });

  return [headerRow, ...bodyRows];
}
