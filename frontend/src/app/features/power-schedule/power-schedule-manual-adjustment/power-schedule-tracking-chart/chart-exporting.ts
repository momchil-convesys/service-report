import { formatIntervalForDataExport } from 'src/app/app-locale';
import { calcScheduleAdjustmentPercentageFormatted } from 'src/app/helpers/_schedule-adjustment-coefficient';
import { BaseChartContext } from 'src/app/shared/base-chart-component/base-chart-component.component';
import { roundValue } from '../../../../helpers/_values-scaling';
import {
  PowerScheduleTracking,
  PowerScheduleTrackingInterval,
} from '../_data/power-schedule-tracking.model';

export function updateExportingOptions(
  chart: Highcharts.Chart,
  data: PowerScheduleTracking | undefined,
  context: BaseChartContext | null,
) {
  if (!data || data.intervals.length === 0) {
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
        tableCaption: false,
        csv: {
          dateFormat: undefined,
        },
      },
      // chart: {
      //   events: {
      //     exportData: function (event: Highcharts.ExportDataEventObject) {
      //       const customDataRows: string[][] = [];

      //       // Check if coefficients are different from 1
      //       const showPvAdjusted = data.pvSetpointTargetCoefficient !== 1;
      //       const showBessAdjusted = data.bessSetpointTargetCoefficient !== 1;

      //       // Format percentage for header - same as table (difference from 100%)
      //       const formatPercentageForHeader = (coefficient: number): string => {
      //         const formatted = calcScheduleAdjustmentPercentageFormatted(coefficient);
      //         // Remove parentheses and spaces, same as table does
      //         return formatted.replace('(', '').replace(')', '').replace(' ', '');
      //       };

      //       // Build comprehensive header row with all columns - matching table order
      //       const headerRow: string[] = [
      //         $localize`Date / Time`,
      //         $localize`Schedule status`,
      //         $localize`Priority mode`,
      //         $localize`PV Power Setpoint (kW)`,
      //       ];

      //       if (showPvAdjusted) {
      //         const pvPercentage = formatPercentageForHeader(data.pvSetpointTargetCoefficient);
      //         headerRow.push(`${pvPercentage}`);
      //       }

      //       headerRow.push($localize`Custom`);

      //       if (showPvAdjusted) {
      //         const pvPercentage = formatPercentageForHeader(data.pvSetpointTargetCoefficient);
      //         headerRow.push(`Custom ${pvPercentage}`);
      //       }

      //       headerRow.push(
      //         $localize`Energy Equivalent (kWh)`,
      //         $localize`PV Production (kWh)`,
      //         $localize`Deviation (kWh)`,
      //         $localize`BESS Power Setpoint (kW)`,
      //       );

      //       if (showBessAdjusted) {
      //         const bessPercentage = formatPercentageForHeader(data.bessSetpointTargetCoefficient);
      //         headerRow.push(`${bessPercentage}`);
      //       }

      //       headerRow.push($localize`Custom`);

      //       if (showBessAdjusted) {
      //         const bessPercentage = formatPercentageForHeader(data.bessSetpointTargetCoefficient);
      //         headerRow.push(`Custom ${bessPercentage}`);
      //       }

      //       headerRow.push(
      //         $localize`Energy Equivalent (kWh)`,
      //         $localize`BESS Charged Energy (kWh)`,
      //         $localize`BESS Discharged Energy (kWh)`,
      //         $localize`Deviation (kWh)`,
      //         $localize`Grid Power Setpoint (kW)`,
      //         $localize`Energy Equivalent (kWh)`,
      //         $localize`Exported Energy (kWh)`,
      //         $localize`Imported Energy (kWh)`,
      //         $localize`Deviation (kWh)`,
      //       );

      //       customDataRows.push(headerRow);

      //       // Export all intervals from the data
      //       data.intervals.forEach((interval: PowerScheduleTrackingInterval) => {
      //         const applicableRange: Interval = {
      //           start: interval.interval.start,
      //           end: interval.interval.end,
      //         };

      //         const formattedDate = formatIntervalForDataExport(
      //           applicableRange,
      //           context?.plant.timeZone,
      //         );

      //         // Helper function to format values with zero decimal places
      //         const formatValue = (value: number | null | undefined): string => {
      //           if (value === null || value === undefined) {
      //             return '';
      //           }
      //           return JSON.stringify(Math.round(value));
      //         };

      //         // Helper function to format custom value - returns empty string if same as original
      //         const formatCustomValue = (
      //           customValue: number | null | undefined,
      //           originalValue: number | null | undefined,
      //         ): string => {
      //           if (customValue === null || customValue === undefined) {
      //             return '';
      //           }
      //           // Compare rounded values
      //           const customRounded = Math.round(customValue);
      //           const originalRounded =
      //             originalValue !== null && originalValue !== undefined
      //               ? Math.round(originalValue)
      //               : null;
      //           // If custom equals original, return empty string
      //           if (originalRounded !== null && customRounded === originalRounded) {
      //             return '';
      //           }
      //           return JSON.stringify(customRounded);
      //         };

      //         // Build data row - match header structure (same order as table)
      //         const dataRow: string[] = [
      //           formattedDate,
      //           interval.scheduleStatus ?? '',
      //           interval.priorityModeCustom ?? '',
      //           formatValue(interval.pvPowerSetpoint.value),
      //         ];

      //         if (showPvAdjusted) {
      //           dataRow.push(formatValue(interval.pvPowerSetpoint.valueAdjusted));
      //         }

      //         dataRow.push(
      //           formatCustomValue(
      //             interval.pvPowerSetpointCustom?.value ?? null,
      //             interval.pvPowerSetpoint.value,
      //           ),
      //         );

      //         if (showPvAdjusted) {
      //           dataRow.push(
      //             formatCustomValue(
      //               interval.pvPowerSetpointCustom?.valueAdjusted ?? null,
      //               interval.pvPowerSetpoint.valueAdjusted,
      //             ),
      //           );
      //         }

      //         dataRow.push(
      //           formatValue(interval.pvEffectiveSetpointEnergyEquivalent),
      //           formatValue(interval.pvProduction),
      //           formatValue(interval.pvProductionDeviation),
      //           formatValue(interval.bessPowerSetpoint.value),
      //         );

      //         if (showBessAdjusted) {
      //           dataRow.push(formatValue(interval.bessPowerSetpoint.valueAdjusted));
      //         }

      //         dataRow.push(
      //           formatCustomValue(
      //             interval.bessPowerSetpointCustom?.value ?? null,
      //             interval.bessPowerSetpoint.value,
      //           ),
      //         );

      //         if (showBessAdjusted) {
      //           dataRow.push(
      //             formatCustomValue(
      //               interval.bessPowerSetpointCustom?.valueAdjusted ?? null,
      //               interval.bessPowerSetpoint.valueAdjusted,
      //             ),
      //           );
      //         }

      //         // Grid energy equivalent: use export if available, otherwise import
      //         const gridEnergyEquivalent =
      //           interval.gridExportEnergyEquivalent !== null
      //             ? interval.gridExportEnergyEquivalent
      //             : interval.gridImportEnergyEquivalent;

      //         dataRow.push(
      //           formatValue(interval.bessEffectiveSetpointEnergyEquivalent),
      //           formatValue(interval.bessChargedEnergy),
      //           formatValue(interval.bessDischargedEnergy),
      //           formatValue(interval.bessEnergyDeviation),
      //           formatValue(interval.gridPowerSetpoint),
      //           formatValue(gridEnergyEquivalent),
      //           formatValue(interval.exportedEnergy),
      //           formatValue(interval.importedEnergy),
      //           formatValue(interval.gridEnergyDeviation),
      //         );

      //         customDataRows.push(dataRow);
      //       });

      //       // Remove original rows
      //       while (event.dataRows.length > 0) {
      //         event.dataRows.shift();
      //       }

      //       // Replace with custom
      //       event.dataRows.push(...customDataRows);
      //     },
      //   },
      // },
    },
    false,
  );

  (chart as any).customExportCallback_getDataRows = () => {
    return getDataRows(data, context?.plant.timeZone);
  };
}

export function getDataRows(
  data: PowerScheduleTracking,
  timeZone: string | undefined,
): (string | number | undefined)[][] {
  const customDataRows: (string | number)[][] = [];

  // Check if coefficients are different from 1
  const showPvAdjusted = data.pvSetpointTargetCoefficient !== 1;
  const showBessAdjusted = data.bessSetpointTargetCoefficient !== 1;

  // Format percentage for header - same as table (difference from 100%)
  const formatPercentageForHeader = (coefficient: number): string => {
    const formatted = calcScheduleAdjustmentPercentageFormatted(coefficient);
    // Remove parentheses and spaces, same as table does
    return formatted.replace('(', '').replace(')', '').replace(' ', '');
  };

  // Build comprehensive header row with all columns - matching table order
  const headerRow: string[] = [
    $localize`Date / Time`,
    $localize`Schedule status`,
    $localize`Priority mode`,
    $localize`PV Power Setpoint (kW)`,
  ];

  if (showPvAdjusted) {
    const pvPercentage = formatPercentageForHeader(data.pvSetpointTargetCoefficient);
    headerRow.push(`${pvPercentage}`);
  }

  headerRow.push($localize`Custom`);

  if (showPvAdjusted) {
    const pvPercentage = formatPercentageForHeader(data.pvSetpointTargetCoefficient);
    headerRow.push(`Custom ${pvPercentage}`);
  }

  headerRow.push(
    $localize`Energy Equivalent (kWh)`,
    $localize`PV Production (kWh)`,
    $localize`Deviation (kWh)`,
    $localize`BESS Power Setpoint (kW)`,
  );

  if (showBessAdjusted) {
    const bessPercentage = formatPercentageForHeader(data.bessSetpointTargetCoefficient);
    headerRow.push(`${bessPercentage}`);
  }

  headerRow.push($localize`Custom`);

  if (showBessAdjusted) {
    const bessPercentage = formatPercentageForHeader(data.bessSetpointTargetCoefficient);
    headerRow.push(`Custom ${bessPercentage}`);
  }

  headerRow.push(
    $localize`Energy Equivalent (kWh)`,
    $localize`BESS Charged Energy (kWh)`,
    $localize`BESS Discharged Energy (kWh)`,
    $localize`Deviation (kWh)`,
    $localize`Grid Power Setpoint (kW)`,
    $localize`Energy Equivalent (kWh)`,
    $localize`Exported Energy (kWh)`,
    $localize`Imported Energy (kWh)`,
    $localize`Deviation (kWh)`,
  );

  customDataRows.push(headerRow);

  // Export all intervals from the data
  data.intervals.forEach((interval: PowerScheduleTrackingInterval) => {
    const applicableRange: Interval = {
      start: interval.interval.start,
      end: interval.interval.end,
    };

    const formattedDate = formatIntervalForDataExport(applicableRange, timeZone);

    // Build data row - match header structure (same order as table)
    const dataRow: any[] = [
      formattedDate,
      interval.scheduleStatus,
      interval.priorityModeCustom,
      interval.pvPowerSetpoint.value,
    ];

    if (showPvAdjusted) {
      dataRow.push(interval.pvPowerSetpoint.valueAdjusted);
    }

    dataRow.push(interval.pvPowerSetpointCustom?.value);

    if (showPvAdjusted) {
      dataRow.push(interval.pvPowerSetpointCustom?.valueAdjusted);
    }

    dataRow.push(
      roundValue(interval.pvEffectiveSetpointEnergyEquivalent, 1),
      interval.pvProduction,
      roundValue(interval.pvProductionDeviation, 1),
      interval.bessPowerSetpoint.value,
    );

    if (showBessAdjusted) {
      dataRow.push(interval.bessPowerSetpoint.valueAdjusted);
    }

    dataRow.push(interval.bessPowerSetpointCustom?.value);

    if (showBessAdjusted) {
      dataRow.push(interval.bessPowerSetpointCustom?.valueAdjusted);
    }

    // Grid energy equivalent: use export if available, otherwise import
    const gridEnergyEquivalent =
      interval.gridExportEnergyEquivalent !== null
        ? interval.gridExportEnergyEquivalent
        : interval.gridImportEnergyEquivalent;

    dataRow.push(
      roundValue(interval.bessEffectiveSetpointEnergyEquivalent, 1),
      interval.bessChargedEnergy,
      interval.bessDischargedEnergy,
      roundValue(interval.bessEnergyDeviation, 1),
      interval.gridPowerSetpoint,
      roundValue(gridEnergyEquivalent, 1),
      interval.exportedEnergy,
      interval.importedEnergy,
      roundValue(interval.gridEnergyDeviation, 1),
    );

    customDataRows.push(dataRow);
  });

  return customDataRows;
}
