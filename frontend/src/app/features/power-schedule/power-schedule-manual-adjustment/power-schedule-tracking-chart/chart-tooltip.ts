import { formatNumber } from '@angular/common';
import { APP_LOCALE_ID, formatIntervalForTooltip } from 'src/app/app-locale';
import {
  semanticColor_BESSSetpointCharging,
  semanticColor_BESSSetpointDischarging,
} from 'src/app/constants/_chart-series-colors';
import {
  seriesName_BESSChargedEnergy,
  seriesName_BESSDischargedEnergy,
  seriesName_BESSPowerSetpoint,
  seriesName_BESSSetpointEnergyEquivalent,
  seriesName_DeviationFromSetpointEquivalent,
  seriesName_ExportedToGridMV,
  seriesName_GridPowerSetpoint,
  seriesName_GridSetpointEnergyEquivalent,
  seriesName_ImportedFromGridMV,
  seriesName_PVPowerSetpoint,
  seriesName_PVProduction,
  seriesName_PVSetpointEnergyEquivalent,
} from 'src/app/constants/_chart-series-titles';
import { seriesById } from 'src/app/helpers';
import { calcScheduleAdjustmentPercentageFormatted } from 'src/app/helpers/_schedule-adjustment-coefficient';
import { PriorityMode } from '../../_data/priority-modes.dto';
import {
  seriesId_BESSCharged_Excess,
  seriesId_BESSCharged_Shortage,
  seriesId_BESSDischarged_Excess,
  seriesId_BESSDischarged_Shortage,
} from './chart-series-bess-deviation';
import {
  seriesColor_BESSCharged,
  seriesColor_BESSDischarged,
  seriesId_BESSCharged,
  seriesId_BESSDischarged,
} from './chart-series-bess-energy';
import { seriesId_BESSSetpointAdjusted } from './chart-series-bess-setpoints';
import { deviationFromTargetTreshold } from './chart-series-deviation-common';
import {
  seriesId_GridExported_Excess,
  seriesId_GridExported_Shortage,
  seriesId_GridImported_Excess,
  seriesId_GridImported_Shortage,
} from './chart-series-grid-deviation';
import { seriesColor_GridExported, seriesColor_GridImported } from './chart-series-grid-energy';
import { seriesId_GridSetpoint } from './chart-series-grid-setpoints';
import {
  seriesId_PVProduction_Excess,
  seriesId_PVProduction_Shortage,
} from './chart-series-pv-deviation';
import { seriesColor_PVProduction, seriesId_PVProduction } from './chart-series-pv-production';
import { seriesId_PVSetpointAdjusted } from './chart-series-pv-setpoints';
import { seriesId_ScheduleStatus_Prefix } from './chart-series-schedule-status';
import {
  HoverablePointCustomData,
  seriesId_SharedColumnHover,
} from './chart-series-shared-column-hover';
import { createTooltipForScheduleStatusSeries } from './chart-tooltip-schedule-status';
// Color constants for setpoints (not exported, using values directly)
const seriesColor_PVSetpointAdjusted = '#b3222c';

export const tooltipResponsiveOptions: Highcharts.TooltipOptions = {
  style: {
    fontSize: '0.8em',
    lineHeight: '1.0',
    minWidth: '0px',
  },
  outside: true,
  fixed: true,
  positioner: function (labelWidth, labelHeight, point) {
    return {
      x: 0,
      y: this.chart.plotTop - labelHeight,
    };
  },
};

export const tooltip: Highcharts.TooltipOptions = {
  shared: false,
  valueDecimals: 0,
  valueSuffix: ' kWh',
  style: {
    fontSize: '0.8em',
    lineHeight: '1.3',
    zIndex: 10,
    minWidth: '300px',
  },
  borderWidth: 1,
  borderColor: '#d4dce3',
  useHTML: true,
  shape: 'rect',
  // outside: true,
  fixed: true,
  position: {
    align: 'left',
    verticalAlign: 'top',
    x: 0,
    y: 0,
    relativeTo: 'chart',
  },
  formatter: function (tooltip) {
    if (this.series.options.id?.startsWith(seriesId_ScheduleStatus_Prefix)) {
      return createTooltipForScheduleStatusSeries(this as any);
    }

    if (this.series.options.id !== seriesId_SharedColumnHover || !(this as any).custom) {
      return tooltip.defaultFormatter.call(this, tooltip);
    }

    /**
     * Construct tooltip based on
     * seriesId_SharedColumnHover hover point (this.point)
     */

    const dataPoint: HoverablePointCustomData = (this as any).custom;
    const intervalData = dataPoint.intervalData;
    const chart: Highcharts.Chart = this.series.chart;

    // Determine chart type by checking which series exist
    const isPVChart = seriesById(chart, seriesId_PVProduction) !== undefined;
    const isBESSChart =
      !isPVChart &&
      (seriesById(chart, seriesId_BESSCharged) !== undefined ||
        seriesById(chart, seriesId_BESSDischarged) !== undefined);
    const isGridChart =
      !isPVChart && !isBESSChart && seriesById(chart, seriesId_GridSetpoint) !== undefined;

    //--------------------------------------------------------------------------

    let formattedDate: string = formatIntervalForTooltip(
      intervalData.interval,
      tooltip.chart.options.time?.timezone,
    );

    let tooltipHtml = `
      <table style="border-collapse: collapse; width: 100%; margin-top: -2px; margin-bottom: -2px" class="tooltip-table-compact">        
        <tr>
          <td colspan=3 style="text-align: left; line-height: 1.0; padding-bottom:0.25em">
            <span class="secondary-text-color">
              ${formattedDate}
            </span>
          </td>
        </tr>
        `;

    // Use interval data directly instead of chart series
    if (!intervalData) {
      return tooltipHtml + `</table>`;
    }

    const pvSetpointTargetCoefficient = dataPoint.pvSetpointTargetCoefficient;
    const bessSetpointTargetCoefficient = dataPoint.bessSetpointTargetCoefficient;
    const showPVAdjusted = pvSetpointTargetCoefficient !== 1;
    const showBESSAdjusted = bessSetpointTargetCoefficient !== 1;

    // PV Chart: Show PV Production, PV Setpoint Energy Equivalent, and PV Setpoint (power)
    if (isPVChart) {
      // PV Production - show row if value exists or if null in past period
      const isPast = intervalData.interval?.end?.getTime
        ? intervalData.interval.end.getTime() < Date.now()
        : false;
      const shouldShowPVProduction =
        intervalData.pvProduction !== null && intervalData.pvProduction !== undefined;
      const shouldShowNA = intervalData.pvProduction === null && isPast;

      if (shouldShowPVProduction || shouldShowNA) {
        let formattedPointValue = '';
        let isInvalid = false;

        if (shouldShowNA) {
          formattedPointValue = $localize`N/A`;
        } else {
          const value = intervalData.pvProduction!;
          if (value < 0) {
            isInvalid = true;
            formattedPointValue = $localize`INVALID DATA`;
          } else {
            formattedPointValue =
              formatNumber(value, APP_LOCALE_ID, '1.0-0') + (tooltip.options.valueSuffix || '');
          }
        }

        const symbol = `<span style="color:${seriesColor_PVProduction}; padding-right: 0.25em">\u25CF</span>`;
        const invalidDataStyle = isInvalid
          ? 'background-color: #d9343a; color: white; padding: 0 0.5em; border-radius: 2px;'
          : '';

        tooltipHtml += `
          <tr>
            <td style="padding-right: 0.5em; width: 1em;">
              ${symbol}
            </td>
            <td style="padding-right: 0.5em;">
              <span>${seriesName_PVProduction}</span>
            </td>
            <td style="
                  ${invalidDataStyle}
                  text-align: right; 
                  font-weight: bold;
                  ">
              <span>${formattedPointValue}</span>
            </td>
          </tr>`;
      }

      // PV Setpoint Energy Equivalent - use pre-calculated value
      const pvSetpointSeries = seriesById(chart, seriesId_PVSetpointAdjusted);
      const pvSetpoint = intervalData.pvPowerSetpointCustom ?? intervalData.pvPowerSetpoint;
      const pvSetpointValueAdjusted = showPVAdjusted ? pvSetpoint.valueAdjusted : pvSetpoint.value;

      // Only show PV setpoint energy equivalent if the series is visible
      if (pvSetpointSeries && pvSetpointSeries.visible) {
        // Always show PV setpoint row (even if null to show '-')
        // Use pre-calculated energy equivalent (prefer custom, then original, then effective)
        const pvEnergyEquivalent = intervalData.pvEffectiveSetpointEnergyEquivalent;

        const pvSetpointFormattedValue =
          pvEnergyEquivalent === null
            ? '&mdash;'
            : formatNumber(pvEnergyEquivalent, APP_LOCALE_ID, '1.0-0') + ' kWh';
        const pvSetpointSymbol = `<b style="color:${seriesColor_PVSetpointAdjusted}; padding-right: 0.25em">&mdash;</b>`;

        tooltipHtml += `
          <tr>
            <td style="padding-right: 0.5em; width: 1em;">
              ${pvSetpointSymbol}
            </td>
            <td style="padding-right: 0.5em;">
              <span>${seriesName_PVSetpointEnergyEquivalent}</span>
            </td>
            <td style="text-align: right; font-weight: bold;">
              <span>${pvSetpointFormattedValue}</span>
            </td>
          </tr>`;

        // Add PV power setpoint row immediately after energy equivalent
        const pvPowerFormatted =
          pvSetpointValueAdjusted !== null
            ? formatNumber(pvSetpointValueAdjusted, APP_LOCALE_ID, '1.0-0') + ' kW'
            : $localize`:@@noLimitShort:NL`;

        tooltipHtml += `
          <tr>
            <td style="padding-right: 0.5em; width: 1em;">
            </td>
            <td style="padding-right: 0.5em;">
              <span>${seriesName_PVPowerSetpoint}${
                showPVAdjusted
                  ? calcScheduleAdjustmentPercentageFormatted(pvSetpointTargetCoefficient)
                  : ''
              }</span>
            </td>
            <td style="text-align: right;">
              ${pvPowerFormatted}
            </td>
          </tr>`;
      }

      // PV Deviation from setpoint equivalent
      const pvExcessPoint = seriesById(chart, seriesId_PVProduction_Excess)?.data.find(
        (p) => p.x === (this as any).x,
      );
      const pvShortagePoint = seriesById(chart, seriesId_PVProduction_Shortage)?.data.find(
        (p) => p.x === (this as any).x,
      );

      let deviationPoint: Highcharts.Point | undefined = undefined;
      let sign = '';
      let label = seriesName_DeviationFromSetpointEquivalent;

      if (pvShortagePoint && pvShortagePoint.series.visible) {
        deviationPoint = pvShortagePoint;
        sign = '&minus;';
      } else if (pvExcessPoint && pvExcessPoint.series.visible) {
        deviationPoint = pvExcessPoint;
        sign = '&plus;';
      }

      if (deviationPoint) {
        const value =
          deviationPoint.high !== undefined && deviationPoint.low !== undefined
            ? deviationPoint.high - deviationPoint.low
            : undefined;

        let valueDanger = false;
        let formattedPointValue = '&mdash;';

        if (value !== undefined && value !== null) {
          formattedPointValue = `${sign}${formatNumber(value, APP_LOCALE_ID, '1.0-0')} ${
            tooltip.options.valueSuffix || ''
          }`;

          if (Math.abs(value) > deviationFromTargetTreshold) {
            valueDanger = true;
          }
        }

        const separatorColor = '#edf0f3';
        const valueColor = valueDanger ? '#d9343a' : 'inherit';
        const valueFontWeight = 'bold';
        const verticalSpacing = '0.15em';

        tooltipHtml += `
        <tr>
          <td colspan=3
              style="
                border-bottom: 1px solid ${separatorColor};
                padding-top: ${verticalSpacing}
                ">
          </td>
        </tr>`;

        tooltipHtml += `
        <tr>
          <td style="padding-right: 0.5em; width: 1em; padding-top: ${verticalSpacing}">
            <span style="color: #ffffff; padding-right: 0.25em">\u25CF</span>
          </td>
          <td style="padding-right: 0.5em; padding-top: ${verticalSpacing}">
            <span>${label}</span>
          </td>
          <td style="
                text-align: right; 
                font-weight: ${valueFontWeight};
                color: ${valueColor};
                padding-top: ${verticalSpacing}
                ">
            <span>${formattedPointValue}</span>
          </td>
        </tr>`;
      }
    }

    // BESS Chart: Show BESS Charged/Discharged energy, BESS Setpoint Energy Equivalent, and BESS Setpoint (power)
    if (isBESSChart) {
      const isPast = intervalData.interval?.end?.getTime
        ? intervalData.interval.end.getTime() < Date.now()
        : false;

      // BESS Charged energy - show row if value exists or if null in past period
      const shouldShowCharged =
        intervalData.bessChargedEnergy !== null && intervalData.bessChargedEnergy !== undefined;
      const shouldShowChargedNA = intervalData.bessChargedEnergy === null && isPast;

      if (shouldShowCharged || shouldShowChargedNA) {
        const formattedPointValue = shouldShowChargedNA
          ? $localize`N/A`
          : formatNumber(intervalData.bessChargedEnergy!, APP_LOCALE_ID, '1.0-0') + ' kWh';
        const symbol = `<span style="color:${seriesColor_BESSCharged}; padding-right: 0.25em">\u25CF</span>`;

        tooltipHtml += `
          <tr>
            <td style="padding-right: 0.5em; width: 1em;">
              ${symbol}
            </td>
            <td style="padding-right: 0.5em;">
              <span>${seriesName_BESSChargedEnergy}</span>
            </td>
            <td style="text-align: right; font-weight: bold;">
              <span>${formattedPointValue}</span>
            </td>
          </tr>`;
      }

      // BESS Discharged energy - show row if value exists or if null in past period
      const shouldShowDischarged =
        intervalData.bessDischargedEnergy !== null &&
        intervalData.bessDischargedEnergy !== undefined;
      const shouldShowDischargedNA = intervalData.bessDischargedEnergy === null && isPast;

      if (shouldShowDischarged || shouldShowDischargedNA) {
        const formattedPointValue = shouldShowDischargedNA
          ? $localize`N/A`
          : formatNumber(intervalData.bessDischargedEnergy!, APP_LOCALE_ID, '1.0-0') + ' kWh';
        const symbol = `<span style="color:${seriesColor_BESSDischarged}; padding-right: 0.25em">\u25CF</span>`;

        tooltipHtml += `
          <tr>
            <td style="padding-right: 0.5em; width: 1em;">
              ${symbol}
            </td>
            <td style="padding-right: 0.5em;">
              <span>${seriesName_BESSDischargedEnergy}</span>
            </td>
            <td style="text-align: right; font-weight: bold;">
              <span>${formattedPointValue}</span>
            </td>
          </tr>`;
      }

      // TODO: use precalculated effective setpoint

      // BESS Setpoint Energy Equivalent - use pre-calculated value
      const bessSetpointSeries = seriesById(chart, seriesId_BESSSetpointAdjusted);
      const bessSetpoint = intervalData.bessPowerSetpointCustom ?? intervalData.bessPowerSetpoint;
      const bessSetpointValueAdjusted = showBESSAdjusted
        ? bessSetpoint.valueAdjusted
        : bessSetpoint.value;

      // Only show BESS setpoint energy equivalent if the series is visible
      if (bessSetpointSeries && bessSetpointSeries.visible) {
        // Always show BESS setpoint row (even if null to show '-')
        // Use pre-calculated energy equivalent (prefer custom, then original, then effective)
        const bessEnergyEquivalent = intervalData.bessEffectiveSetpointEnergyEquivalent;

        const bessSetpointFormattedValue =
          bessEnergyEquivalent === null
            ? '&mdash;'
            : formatNumber(bessEnergyEquivalent, APP_LOCALE_ID, '1.0-0') + ' kWh';

        // Set color based on charge/discharge: negative = charging (darker cyan/blue), positive = discharging (darker green)
        const bessSetpointColor =
          bessSetpointValueAdjusted !== null && bessSetpointValueAdjusted < 0
            ? semanticColor_BESSSetpointCharging
            : semanticColor_BESSSetpointDischarging;
        const bessSetpointSymbol = `<b style="color:${bessSetpointColor}; padding-right: 0.25em">&mdash;</b>`;

        tooltipHtml += `
          <tr>
            <td style="padding-right: 0.5em; width: 1em;">
              ${bessSetpointSymbol}
            </td>
            <td style="padding-right: 0.5em;">
              <span>${seriesName_BESSSetpointEnergyEquivalent}</span>
            </td>
            <td style="text-align: right; font-weight: bold;">
              <span>${bessSetpointFormattedValue}</span>
            </td>
          </tr>`;

        // Add BESS power setpoint row immediately after energy equivalent
        const bessPowerFormatted =
          bessSetpointValueAdjusted !== null
            ? formatNumber(bessSetpointValueAdjusted, APP_LOCALE_ID, '1.0-0') + ' kW'
            : $localize`:@@noLimitShort:NL`;

        tooltipHtml += `
          <tr>
            <td style="padding-right: 0.5em; width: 1em;">
            </td>
            <td style="padding-right: 0.5em;">
              <span>${seriesName_BESSPowerSetpoint}${
                showBESSAdjusted
                  ? calcScheduleAdjustmentPercentageFormatted(bessSetpointTargetCoefficient)
                  : ''
              }</span>
            </td>
            <td style="text-align: right;">
              ${bessPowerFormatted}
            </td>
          </tr>`;
      }

      // BESS Deviation from setpoint equivalent
      // Check for charged deviation (when setpoint is negative)
      let deviationPoint: Highcharts.Point | undefined = undefined;
      let sign = '';
      let label = '';

      if (bessSetpointValueAdjusted !== null && bessSetpointValueAdjusted < 0) {
        // Charging mode
        const chargedExcessPoint = seriesById(chart, seriesId_BESSCharged_Excess)?.data.find(
          (p) => p.x === (this as any).x,
        );
        const chargedShortagePoint = seriesById(chart, seriesId_BESSCharged_Shortage)?.data.find(
          (p) => p.x === (this as any).x,
        );

        if (chargedShortagePoint && chargedShortagePoint.series.visible) {
          deviationPoint = chargedShortagePoint;
          sign = '&minus;';
          label = seriesName_DeviationFromSetpointEquivalent;
        } else if (chargedExcessPoint && chargedExcessPoint.series.visible) {
          deviationPoint = chargedExcessPoint;
          sign = '&plus;';
          label = seriesName_DeviationFromSetpointEquivalent;
        }
      } else if (bessSetpointValueAdjusted !== null && bessSetpointValueAdjusted > 0) {
        // Discharging mode
        const dischargedExcessPoint = seriesById(chart, seriesId_BESSDischarged_Excess)?.data.find(
          (p) => p.x === (this as any).x,
        );
        const dischargedShortagePoint = seriesById(
          chart,
          seriesId_BESSDischarged_Shortage,
        )?.data.find((p) => p.x === (this as any).x);

        if (dischargedShortagePoint && dischargedShortagePoint.series.visible) {
          deviationPoint = dischargedShortagePoint;
          sign = '&minus;';
          label = seriesName_DeviationFromSetpointEquivalent;
        } else if (dischargedExcessPoint && dischargedExcessPoint.series.visible) {
          deviationPoint = dischargedExcessPoint;
          sign = '&plus;';
          label = seriesName_DeviationFromSetpointEquivalent;
        }
      }

      if (deviationPoint) {
        const value =
          deviationPoint.high !== undefined && deviationPoint.low !== undefined
            ? deviationPoint.high - deviationPoint.low
            : undefined;

        let valueDanger = false;
        let formattedPointValue = '&mdash;';

        if (value !== undefined && value !== null) {
          formattedPointValue = `${sign}${formatNumber(value, APP_LOCALE_ID, '1.0-0')} ${
            tooltip.options.valueSuffix || ''
          }`;

          if (Math.abs(value) > deviationFromTargetTreshold) {
            valueDanger = true;
          }
        }

        const separatorColor = '#edf0f3';
        const valueColor = valueDanger ? '#d9343a' : 'inherit';
        const valueFontWeight = 'bold';
        const verticalSpacing = '0.15em';

        tooltipHtml += `
        <tr>
          <td colspan=3
              style="
                border-bottom: 1px solid ${separatorColor};
                padding-top: ${verticalSpacing}
                ">
          </td>
        </tr>`;

        tooltipHtml += `
        <tr>
          <td style="padding-right: 0.5em; width: 1em; padding-top: ${verticalSpacing}">
            <span style="color: #ffffff; padding-right: 0.25em">\u25CF</span>
          </td>
          <td style="padding-right: 0.5em; padding-top: ${verticalSpacing}">
            <span>${label}</span>
          </td>
          <td style="
                text-align: right; 
                font-weight: ${valueFontWeight};
                color: ${valueColor};
                padding-top: ${verticalSpacing}
                ">
            <span>${formattedPointValue}</span>
          </td>
        </tr>`;
      }
    }

    // Grid Chart: Show Grid Exported/Imported energy, Grid Setpoint Energy Equivalent, and Grid Setpoint (power)
    if (isGridChart) {
      const priorityMode = intervalData.priorityModeCustom || PriorityMode.DEFAULT;
      if (priorityMode) {
        const backgroundColor = priorityMode === PriorityMode.DEFAULT ? '#edf0f3' : '#fff9e6';
        tooltipHtml += `
           <tr>
             <td style="padding: 0;" colspan=3>
              <div style="
                      display: flex; 
                      background-color: ${backgroundColor};
                      margin: 0 -0.5em 0 -0.45em;
                      padding: 0.25em 0.5em;
              ">
                <span style="flex: 0 0 1.8em;"></span>
                <span>${$localize`Priority Mode`}</span>
                <b style="margin-left: auto;">${priorityMode}</b>
              </div>
             </td>
           </tr>`;
      }

      const isPast = intervalData.interval?.end?.getTime
        ? intervalData.interval.end.getTime() < Date.now()
        : false;

      // Grid Exported energy - show row if value exists or if null in past period
      const shouldShowExported =
        intervalData.exportedEnergy !== null && intervalData.exportedEnergy !== undefined;
      const shouldShowExportedNA = intervalData.exportedEnergy === null && isPast;

      if (shouldShowExported || shouldShowExportedNA) {
        const formattedPointValue = shouldShowExportedNA
          ? $localize`N/A`
          : formatNumber(intervalData.exportedEnergy!, APP_LOCALE_ID, '1.0-0') + ' kWh';
        const symbol = `<span style="color:${seriesColor_GridExported}; padding-right: 0.25em">\u25CF</span>`;

        tooltipHtml += `
          <tr>
            <td style="padding-right: 0.5em; width: 1em;">
              ${symbol}
            </td>
            <td style="padding-right: 0.5em;">
              <span>${seriesName_ExportedToGridMV}</span>
            </td>
            <td style="text-align: right; font-weight: bold;">
              <span>${formattedPointValue}</span>
            </td>
          </tr>`;
      }

      // Grid Imported energy - show row if value exists or if null in past period
      const shouldShowImported =
        intervalData.importedEnergy !== null && intervalData.importedEnergy !== undefined;
      const shouldShowImportedNA = intervalData.importedEnergy === null && isPast;

      if (shouldShowImported || shouldShowImportedNA) {
        const formattedPointValue = shouldShowImportedNA
          ? $localize`N/A`
          : formatNumber(intervalData.importedEnergy!, APP_LOCALE_ID, '1.0-0') + ' kWh';
        const symbol = `<span style="color:${seriesColor_GridImported}; padding-right: 0.25em">\u25CF</span>`;

        tooltipHtml += `
          <tr>
            <td style="padding-right: 0.5em; width: 1em;">
              ${symbol}
            </td>
            <td style="padding-right: 0.5em;">
              <span>${seriesName_ImportedFromGridMV}</span>
            </td>
            <td style="text-align: right; font-weight: bold;">
              <span>${formattedPointValue}</span>
            </td>
          </tr>`;
      }

      // Grid Setpoint Energy Equivalent - use pre-calculated value
      const gridSetpointSeries = seriesById(chart, seriesId_GridSetpoint);
      const gridPowerSetpoint = intervalData.gridPowerSetpoint;

      // Only show Grid setpoint energy equivalent if the series is visible
      if (gridSetpointSeries && gridSetpointSeries.visible) {
        // Determine which energy equivalent to show based on setpoint direction
        const gridEnergyEquivalent =
          gridPowerSetpoint !== null && gridPowerSetpoint > 0
            ? intervalData.gridExportEnergyEquivalent
            : intervalData.gridImportEnergyEquivalent;

        const gridSetpointFormattedValue =
          gridEnergyEquivalent === null
            ? '&mdash;'
            : formatNumber(gridEnergyEquivalent, APP_LOCALE_ID, '1.0-0') + ' kWh';

        // Set color based on export/import: positive = exporting (red), negative = importing (blue)
        const gridSetpointColor =
          gridPowerSetpoint !== null && gridPowerSetpoint > 0
            ? seriesColor_GridExported
            : seriesColor_GridImported;
        const gridSetpointSymbol = `<b style="color:${gridSetpointColor}; padding-right: 0.25em">&mdash;</b>`;

        tooltipHtml += `
          <tr>
            <td style="padding-right: 0.5em; width: 1em;">
              ${gridSetpointSymbol}
            </td>
            <td style="padding-right: 0.5em;">
              <span>${seriesName_GridSetpointEnergyEquivalent}</span>
            </td>
            <td style="text-align: right; font-weight: bold;">
              <span>${gridSetpointFormattedValue}</span>
            </td>
          </tr>`;

        // Add Grid power setpoint row immediately after energy equivalent
        const gridPowerFormatted =
          gridPowerSetpoint !== null
            ? formatNumber(gridPowerSetpoint, APP_LOCALE_ID, '1.0-0') + ' kW'
            : $localize`:@@noLimitShort:NL`;

        tooltipHtml += `
          <tr>
            <td style="padding-right: 0.5em; width: 1em;">
            </td>
            <td style="padding-right: 0.5em;">
              <span>${seriesName_GridPowerSetpoint}</span>
            </td>
            <td style="text-align: right;">
              ${gridPowerFormatted}
            </td>
          </tr>`;
      }

      // Grid Deviation from setpoint equivalent
      let deviationPoint: Highcharts.Point | undefined = undefined;
      let sign = '';
      let label = seriesName_DeviationFromSetpointEquivalent;

      if (gridPowerSetpoint !== null && gridPowerSetpoint > 0) {
        // Exporting mode
        const exportedExcessPoint = seriesById(chart, seriesId_GridExported_Excess)?.data.find(
          (p) => p.x === (this as any).x,
        );
        const exportedShortagePoint = seriesById(chart, seriesId_GridExported_Shortage)?.data.find(
          (p) => p.x === (this as any).x,
        );

        if (exportedShortagePoint && exportedShortagePoint.series.visible) {
          deviationPoint = exportedShortagePoint;
          sign = '&minus;';
        } else if (exportedExcessPoint && exportedExcessPoint.series.visible) {
          deviationPoint = exportedExcessPoint;
          sign = '&plus;';
        }
      } else if (gridPowerSetpoint !== null && gridPowerSetpoint < 0) {
        // Importing mode
        const importedExcessPoint = seriesById(chart, seriesId_GridImported_Excess)?.data.find(
          (p) => p.x === (this as any).x,
        );
        const importedShortagePoint = seriesById(chart, seriesId_GridImported_Shortage)?.data.find(
          (p) => p.x === (this as any).x,
        );

        if (importedShortagePoint && importedShortagePoint.series.visible) {
          deviationPoint = importedShortagePoint;
          sign = '&minus;';
        } else if (importedExcessPoint && importedExcessPoint.series.visible) {
          deviationPoint = importedExcessPoint;
          sign = '&plus;';
        }
      }

      if (deviationPoint) {
        const value =
          deviationPoint.high !== undefined && deviationPoint.low !== undefined
            ? deviationPoint.high - deviationPoint.low
            : undefined;

        let valueDanger = false;
        let formattedPointValue = '&mdash;';

        if (value !== undefined && value !== null) {
          // For imported (negative), the values are negated, so we need to adjust the sign
          const absoluteValue = Math.abs(value);
          formattedPointValue = `${sign}${formatNumber(absoluteValue, APP_LOCALE_ID, '1.0-0')} ${
            tooltip.options.valueSuffix || ''
          }`;

          if (absoluteValue > deviationFromTargetTreshold) {
            valueDanger = true;
          }
        }

        const separatorColor = '#edf0f3';
        const valueColor = valueDanger ? '#d9343a' : 'inherit';
        const valueFontWeight = 'bold';
        const verticalSpacing = '0.15em';

        tooltipHtml += `
        <tr>
          <td colspan=3
              style="
                border-bottom: 1px solid ${separatorColor};
                padding-top: ${verticalSpacing}
                ">
          </td>
        </tr>`;

        tooltipHtml += `
        <tr>
          <td style="padding-right: 0.5em; width: 1em; padding-top: ${verticalSpacing}">
            <span style="color: #ffffff; padding-right: 0.25em">\u25CF</span>
          </td>
          <td style="padding-right: 0.5em; padding-top: ${verticalSpacing}">
            <span>${label}</span>
          </td>
          <td style="
                text-align: right; 
                font-weight: ${valueFontWeight};
                color: ${valueColor};
                padding-top: ${verticalSpacing}
                ">
            <span>${formattedPointValue}</span>
          </td>
        </tr>`;
      }
    }

    //--------------------------------------------------------------------------

    tooltipHtml += `
      </table>
    `;

    return tooltipHtml;
  },
};
