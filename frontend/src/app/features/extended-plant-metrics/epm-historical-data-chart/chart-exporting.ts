import { formatIntervalForDataExport } from '../../../app-locale';
import { undefinedOrNumber } from '../../../helpers';
import { PowerMetersCumulativeData } from '../../extended-plant-metrics/_data/models';

export function getDataRows(
  data: PowerMetersCumulativeData | undefined,
): (string | number | undefined)[][] {
  const headerRow = [
    $localize`Date / Time`,
    $localize`Energy (Consumed)`,
    $localize`Energy (Generated)`,
    $localize`Reactive energy (Consumed)`,
    $localize`Reactive energy (Generated)`,
    $localize`Calculated reactive energy (Consumed)`,
    $localize`Calculated reactive energy (Generated)`,
  ];

  const bodyRows: (string | number | undefined)[][] = [];

  if (data) {
    data.dataPoints.forEach((dataPoint) => {
      const interval: Interval = {
        start: dataPoint.interval.from,
        end: dataPoint.interval.to,
      };
      const formattedDate = formatIntervalForDataExport(interval, data.plantTimeZone, true);

      bodyRows.push([
        formattedDate,
        undefinedOrNumber(dataPoint.energy_Consumed),
        undefinedOrNumber(dataPoint.energy_Generated),
        undefinedOrNumber(dataPoint.reactiveEnergy_Consumed),
        undefinedOrNumber(dataPoint.reactiveEnergy_Generated),
        undefinedOrNumber(dataPoint.calculated_reactiveEnergy_Consumed),
        undefinedOrNumber(dataPoint.calculated_reactiveEnergy_Generated),
      ]);
    });

    // Add empty row before sum
    bodyRows.push([undefined, undefined, undefined, undefined, undefined, undefined, undefined]);

    // Add row with sums
    bodyRows.push([
      $localize`Total`,
      undefinedOrNumber(data.sum.energy_Consumed),
      undefinedOrNumber(data.sum.energy_Generated),
      undefinedOrNumber(data.sum.reactiveEnergy_Consumed),
      undefinedOrNumber(data.sum.reactiveEnergy_Generated),
      undefinedOrNumber(data.sum.calculated_reactiveEnergy_Consumed),
      undefinedOrNumber(data.sum.calculated_reactiveEnergy_Generated),
    ]);
  }

  return [headerRow, ...bodyRows];
}
