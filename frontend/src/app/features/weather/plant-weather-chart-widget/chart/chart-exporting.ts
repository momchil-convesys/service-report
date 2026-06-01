import { formatIntervalForDataExport, formatTimestampForDataExport } from '../../../../app-locale';
import { IntegrationPeriod } from '../../../../constants';
import { DataSeriesConfiguration_DTO } from '../../../../data/definitions';
import { undefinedOrNumber } from '../../../../helpers';
import { PlantWeatherDataChartIdentifier } from '../../_data/constants';
import { PlantWeather_HistoricalTimelineData_DTO } from '../../_data/dto';
import { DataRequestWithContext } from '../../_data/interfaces';

function constructHeaderForSeries(seriesConfig: DataSeriesConfiguration_DTO): string {
  let title = seriesConfig.seriesDisplayName;

  if (seriesConfig.unit) {
    title += ` (${seriesConfig.unit})`;
  }

  return title;
}

export function getDataRows(
  req: undefined | DataRequestWithContext<PlantWeather_HistoricalTimelineData_DTO>,
): (string | number | undefined)[][] {
  const data: PlantWeather_HistoricalTimelineData_DTO | undefined = req?.dataRequest.data;
  const timeZone: string | undefined = req?.plant.timeZone;

  if (!data) {
    return [];
  }

  const headerRow = [$localize`Date / Time`];

  data.seriesConfigurations.forEach((seriesConfig) =>
    headerRow.push(constructHeaderForSeries(seriesConfig)),
  );

  const bodyRows: (string | number | undefined)[][] = [];

  const rowsByIntervalStart: {
    [intervalStart: string]: {
      interval: Interval;
      rowDataBySeriesId: {
        [seriesId: string]: undefined | null | number;
      };
    };
  } = {};

  Object.keys(data.seriesData).forEach((seriesId) => {
    const seriesData = data.seriesData[seriesId];

    seriesData.forEach((dataPoint) => {
      let row = rowsByIntervalStart[dataPoint.interval.start];
      if (!row) {
        rowsByIntervalStart[dataPoint.interval.start] = {
          interval: {
            start: new Date(dataPoint.interval.start),
            end: new Date(dataPoint.interval.end),
          },
          rowDataBySeriesId: {},
        };

        row = rowsByIntervalStart[dataPoint.interval.start];
      }

      row.rowDataBySeriesId[seriesId] = dataPoint.value;
    });
  });

  const integrationPeriod =
    req?.chartSpecifics.chartIdentifier !== PlantWeatherDataChartIdentifier.MomentaryPerTS
      ? req?.targetRange.integrationPeriod
      : undefined;

  const showInterval =
    integrationPeriod === IntegrationPeriod.Hours ||
    integrationPeriod === IntegrationPeriod.QuaterOfAnHour;

  Object.keys(rowsByIntervalStart)
    .sort((a: string, b: string) => new Date(a).getTime() - new Date(b).getTime())
    .forEach((intervalStart) => {
      const row = rowsByIntervalStart[intervalStart];

      const formattedDate = showInterval
        ? formatIntervalForDataExport(row.interval, timeZone, true)
        : formatTimestampForDataExport(row.interval.start, timeZone, integrationPeriod);

      bodyRows.push([
        formattedDate,
        ...data.seriesConfigurations.map((seriesConfig) => {
          const value = undefinedOrNumber(
            row.rowDataBySeriesId[seriesConfig.seriesConfigurationId],
          );

          return value;
        }),
      ]);
    });

  // Add empty row before sum
  // bodyRows.push([undefined, ...new Array(data.seriesConfigurations.length).fill(undefined)]);

  //   // Add row with sums
  //   bodyRows.push([
  //     $localize`Total`,
  //     undefinedOrNumber(data.sum.energy_Consumed),
  //     undefinedOrNumber(data.sum.energy_Generated),
  //     undefinedOrNumber(data.sum.reactiveEnergy_Consumed),
  //     undefinedOrNumber(data.sum.reactiveEnergy_Generated),
  //     undefinedOrNumber(data.sum.calculated_reactiveEnergy_Consumed),
  //     undefinedOrNumber(data.sum.calculated_reactiveEnergy_Generated),
  //   ]);
  // }

  return [headerRow, ...bodyRows];
}
