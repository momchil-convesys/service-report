import { formatIntervalForDataExportFileName } from '../app-locale';
import { Inverter_DTO } from '../data/dtos';
import { Device, Plant } from '../data/models';
import { PlantsService } from '../data/services/plants.service';
import { DatetimeRangeModel } from '../shared/datetime-range-select/models';

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0] || '';
}

export function generateFileNameForExportWithServiceInjected(
  chartName: string,
  plantId: string | undefined,
  deviceId: string | undefined,
  dateOrDateFrom: Date,
  dateTo: Date | undefined,
  includePlantNameOnly: boolean,
  plantsService: PlantsService,
) {
  let result = '';

  let deviceName: string | undefined;
  let plantName: string | undefined;
  let plantTimeZone: string | undefined;

  if (plantId) {
    const plant: Plant | undefined = plantsService.getCachedPlantById(plantId);
    plantName = plant?.name;
    plantTimeZone = plant?.timeZone;
  }

  if (deviceId) {
    const device: Device | undefined = plantsService.getCachedDeviceById(deviceId);
    deviceName = device?.name;

    if (!plantName) {
      plantName = device?.plantName;
    }
  }

  const formatted_dateOrDateFrom = formatDate(dateOrDateFrom);
  result += formatted_dateOrDateFrom;

  if (dateTo) {
    const formatted_dateTo = formatDate(dateTo);

    if (formatted_dateOrDateFrom !== formatted_dateTo) {
      result += `_`;
      result += formatted_dateTo;
    }
  }

  result += `—`;
  result += chartName;

  if (plantName) {
    result += `—`;
    result += plantName.trim();
  }

  if (deviceName && !includePlantNameOnly) {
    result += `—`;
    result += deviceName.trim();
  }

  return result;
}

export function generateFileNameForExportWithServiceInjected_New(
  title: string,
  plantId: string | undefined,
  deviceId: string | undefined,
  targetRange: DatetimeRangeModel,
  plantsService: PlantsService,
  inverter?: Inverter_DTO,
) {
  let result = '';

  let deviceName: string | undefined;
  let plantName: string | undefined;
  let plantTimeZone: string | undefined;

  if (plantId) {
    const plant: Plant | undefined = plantsService.getCachedPlantById(plantId);
    plantName = plant?.name;
    plantTimeZone = plant?.timeZone;
  }

  if (deviceId) {
    const device: Device | undefined = plantsService.getCachedDeviceById(deviceId);
    deviceName = device?.name;

    if (!plantName) {
      plantName = device?.plantName;
    }

    // Obtain plant info from device
    if (!plantId && device?.plantId) {
      const plant: Plant | undefined = plantsService.getCachedPlantById(device.plantId);
      plantTimeZone = plant?.timeZone;
    }
  }

  result += formatIntervalForDataExportFileName(
    { start: targetRange.from, end: targetRange.to },
    plantTimeZone,
  );

  result += `—`;
  result += title;

  if (plantName) {
    result += `—`;
    result += plantName.trim();
  }

  if (deviceName) {
    result += `—`;
    result += deviceName.trim();
  }

  if (inverter) {
    result += `—`;
    result += $localize`Inverter`;
    result += ` ${inverter.displayIndex}`;
  }

  return result;
}

export function generateFileNameForExport(
  title: string,
  plant: Plant,
  targetRange: DatetimeRangeModel,
) {
  return generateFileNameForExport_Simplified(title, plant, {
    from: targetRange.from,
    to: targetRange.to,
  });
}

export function generateFileNameForExport_Simplified(
  title: string,
  plant: Plant,
  targetRange: {
    from: Date;
    to: Date;
  },
) {
  let result = '';

  const plantName = plant.name;
  const plantTimeZone = plant.timeZone;

  result += formatIntervalForDataExportFileName(
    { start: targetRange.from, end: targetRange.to },
    plantTimeZone,
  );

  result += `—`;
  result += title;

  if (plantName) {
    result += `—`;
    result += plantName.trim();
  }

  return result;
}
