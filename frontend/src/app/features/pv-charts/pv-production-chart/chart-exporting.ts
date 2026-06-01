import { isNumber } from 'highcharts';
import { formatIntervalForDataExport, formatTimestampForDataExport } from '../../../app-locale';
import { IntegrationPeriod } from '../../../constants';
import { seriesById } from '../../../helpers';
import { BaseChartContext } from '../../../shared/base-chart-component/base-chart-component.component';
import { EnergyProduction_DataPoint, PVProductionData } from './_data/pv-production';
import { seriesId_EnergyProduction } from './chart-series-energy-production';

export function updateExportingOptions(
  chart: Highcharts.Chart,
  data: PVProductionData | undefined,
  context: BaseChartContext | null,
  valuesLabel: string,
) {
  if (!data || data.productionDataPoints.length === 0) {
    chart.update(
      {
        chart: {
          events: {
            exportData: undefined,
          },
        },
      },
      false,
    );
    return;
  }

  chart.update(
    {
      exporting: {
        // showTable: true,
        // allowTableSorting: true,
        tableCaption: false,
        csv: {
          dateFormat: undefined,
        },
      },
      chart: {
        events: {
          exportData: function (event: Highcharts.ExportDataEventObject) {
            const targetSeries = seriesById(this, seriesId_EnergyProduction);

            if (!targetSeries) {
              return;
            }

            const customDataRows: string[][] = [];
            const headerRow = [$localize`Date / Time`, valuesLabel];

            customDataRows.push(headerRow);

            type PointType = number[] | any;

            const chartPoints: PointType[] = (targetSeries.options as any).data || [];

            chartPoints.forEach((point: PointType) => {
              const dataPoint: EnergyProduction_DataPoint = point.custom;

              let applicableRange: Interval = {
                start: dataPoint.applicableRange.from,
                end: dataPoint.applicableRange.to,
              };

              let timestamp: number | string | null | undefined = point.x;
              let value: number | string | null | undefined = point.y;

              let valueAsString = '';

              if (value !== undefined && value !== null) {
                valueAsString = JSON.stringify(value);
              }

              if (timestamp === undefined || timestamp === null || !isNumber(timestamp)) {
                // Fallback

                customDataRows.push([JSON.stringify(timestamp), valueAsString]);
                return;
              }

              const showTimeRangeInExport =
                context?.targetRange?.integrationPeriod === IntegrationPeriod.Hours ||
                context?.targetRange?.integrationPeriod === IntegrationPeriod.QuaterOfAnHour;

              let formattedDate = '';
              if (applicableRange && showTimeRangeInExport) {
                formattedDate = formatIntervalForDataExport(
                  applicableRange,
                  context?.plant.timeZone,
                );
              } else {
                formattedDate = formatTimestampForDataExport(
                  timestamp,
                  context?.plant.timeZone,
                  context?.targetRange?.integrationPeriod,
                );
              }

              customDataRows.push([formattedDate, valueAsString]);
            });

            // Remove original rows
            while (event.dataRows.length > 0) {
              event.dataRows.shift();
            }

            // Replace with custom
            event.dataRows.push(...customDataRows);
          },
        },
      },
    },
    false,
  );
}
