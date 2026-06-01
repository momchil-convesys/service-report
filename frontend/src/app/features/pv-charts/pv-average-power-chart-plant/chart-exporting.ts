import { formatIntervalForDataExport, formatTimestampForDataExport } from '../../../app-locale';
import { isNumber } from '../../../helpers';
import { BaseChartContext } from '../../../shared/base-chart-component/base-chart-component.component';
import { calculateApplicableRange } from '../_shared/chart-time-range-formatters';
import { PVAveragePowerData } from './_data/pv-average-power.model';

export function updateExportingOptions(
  chart: Highcharts.Chart,
  data: PVAveragePowerData | undefined,
  context: BaseChartContext | null,
  valuesLabel: string,
) {
  if (!data || data.dataPoints.length === 0) {
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
        // showTable: false,
        // allowTableSorting: true,
        tableCaption: false,
        csv: {
          dateFormat: undefined,
        },
      },
      chart: {
        events: {
          exportData: function (event: Highcharts.ExportDataEventObject) {
            const targetSeries = this.series.length > 0 ? this.series[0] : undefined;

            if (!targetSeries) {
              return;
            }

            const customDataRows: string[][] = [];
            const headerRow = [$localize`Date / Time`, valuesLabel];

            customDataRows.push(headerRow);

            type PointType = number[] | any;

            const chartPoints: PointType[] = (targetSeries.options as any).data || [];

            chartPoints.forEach((point: PointType) => {
              let applicableRange: Interval | undefined;

              let timestamp: number | string | null | undefined;
              let value: number | string | null | undefined;

              if (Array.isArray(point)) {
                // If points are given as array (average power chart)
                // Array format is required for charts with many points.
                // [x, y]

                if (point.length >= 2) {
                  timestamp = point[0];
                  value = point[1];
                }
              } else {
                // If points are given as objects (production chart)

                timestamp = point.x;
                value = point.y;
              }

              let valueAsString = '';

              if (value !== undefined && value !== null) {
                valueAsString = JSON.stringify(value);
              }

              if (timestamp === undefined || timestamp === null || !isNumber(timestamp)) {
                // Fallback

                customDataRows.push([JSON.stringify(timestamp), valueAsString]);
                return;
              }

              /**
               * NOTE that we take into account integration period
               * from the data object as it is hardcoded for the average power chart.
               */
              applicableRange = calculateApplicableRange(
                new Date(timestamp),
                data.integrationPeriod,
                context?.plant.plantSpecificMetadata?.hasPowerMeter || false,
              );

              let formattedDate = '';
              if (applicableRange) {
                formattedDate = formatIntervalForDataExport(
                  applicableRange,
                  context?.plant.timeZone,
                );
              } else {
                formattedDate = formatTimestampForDataExport(timestamp, context?.plant.timeZone);
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
