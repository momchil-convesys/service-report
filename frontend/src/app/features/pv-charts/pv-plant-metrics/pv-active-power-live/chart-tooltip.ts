import { formatNumber } from '@angular/common';
import { APP_LOCALE_ID, formatTimestampForTooltip } from '../../../../app-locale';
import { externalControlWarningText } from '../../../../constants/_to-sort';
import { PowerLimitDetails } from '../../../../data/models';
import Highcharts from '../../../../highcharts-global-config';
import {
  MasterGwScheduledPowerLimitDataPoint_ForDevice,
  MasterGwScheduledPowerLimitDataPoint_ForPlant,
} from '../../../power-limit-schedule/_data/dto';
import { powerLimitSeriesColor, seriesId_PlantActivePowerPM } from '../chart-constants';

const externalControlWarningHtml = `
      <div class="external-control-warning">
          ${externalControlWarningText}
      </div>`;

interface PointCustomData {
  timestamp?: string; // raw iso string from request
  scheduledLimitForDevice?: MasterGwScheduledPowerLimitDataPoint_ForDevice;
  scheduledLimitForPlant?: MasterGwScheduledPowerLimitDataPoint_ForPlant;
  powerLimitForDevice?: PowerLimitDetails;
  valueSuffix: string;
  tooltipTitle: string | undefined;
  hasPowerMeter?: boolean;

  // This is used for debugging purposes
  // and should be visible to developers only
  activePowerFromGW?: {
    value: number | null;
    timestamp: string;
  };

  hasPermissionToSeeAllDetails: boolean;

  // If true, the limit is controlled by an external system
  controlledByExternalSystem?: boolean;
}

export interface PointOptionsWithCustomDataForTooltip extends Highcharts.PointOptionsObject {
  custom?: PointCustomData;
}

export interface PointWithCustomDataForTooltip extends Highcharts.Point {
  custom?: PointCustomData;
}

export const tooltip: Highcharts.TooltipOptions = {
  shared: true,
  shape: 'rect',
  valueDecimals: 1,
  valueSuffix: ' kW',
  distance: 42,
  followPointer: false,
  outside: true,
  style: {
    fontSize: '0.8em',
    lineHeight: '1.1',
    zIndex: 1000,
  },
  useHTML: true,
  positioner: function (labelWidth, labelHeight, point) {
    const chart = this.chart;

    return {
      x: point.plotX + chart.plotLeft - labelWidth / 2,
      y: chart.plotTop - labelHeight,
    };
  },
  formatter: function (tooltip) {
    const point: PointWithCustomDataForTooltip = (this as any).point;

    const timestamp: string | undefined = point.custom?.timestamp;
    if (!timestamp) {
      const defaultTooltip = tooltip.defaultFormatter.call(this, tooltip);
      if (point.custom?.controlledByExternalSystem) {
        return externalControlWarningHtml + defaultTooltip;
      }

      return defaultTooltip;
    }

    const precisionFormat = point.custom?.hasPowerMeter ? '0.0-0' : '0.1-1';

    const timestampFormatted = formatTimestampForTooltip(
      timestamp,
      tooltip.chart.options.time?.timezone,
    );

    const customPowerLimitDetails = point.custom?.powerLimitForDevice;

    const scheduledLimitDataPoint =
      point.custom?.scheduledLimitForPlant || point.custom?.scheduledLimitForDevice;

    const hasPowerLimit = customPowerLimitDetails || scheduledLimitDataPoint;

    const borderSpacing = '0 0.25em';
    const horizontalPadding = '0.5em';
    const verticalPadding = '0.25em';

    let tooltipHtml = `
      <div style="
        padding-bottom: ${horizontalPadding}; 
        margin-bottom: ${verticalPadding}; 
        font-weight: bold; 
        border-bottom: 1px solid #d4dce3">
          ${point.custom?.tooltipTitle || point.category}
      </div>

      <div style="padding: 
          ${hasPowerLimit ? verticalPadding : '0'} 
          ${hasPowerLimit ? '0' : '0'}; 
          padding-top: 0">
        <table style="border-spacing: ${borderSpacing}; border-collapse: separate; width: 100%">

          <tr>
            <td colspan=2 style="text-align: left; line-height: 1.0">
              <span class="secondary-text">
                ${timestampFormatted}
              </span>
            </td>
          </tr>`;

    /**
     * If showing one of the bars with power limit...
     * Otherwise iterate over all points (E.g: power meters)
     */
    const points: PointWithCustomDataForTooltip[] = hasPowerLimit
      ? [(this as any).point]
      : (this as any).points || [];
    // : this.points?.map((context) => context.point) || []; TODO: check

    points.map((point, index) => {
      {
        let secondarySeries = false;

        if (index !== 0 && point.series.options.id?.startsWith(seriesId_PlantActivePowerPM)) {
          // Single power meters
          secondarySeries = true;
        }

        // Round value if grouped
        const value = point.y && (this as any).point?.dataGroup ? Math.round(point.y) : point.y;

        const formattedPointValue =
          value !== undefined
            ? formatNumber(value, APP_LOCALE_ID, precisionFormat) + point.custom?.valueSuffix || ''
            : '&mdash;';

        tooltipHtml += `
          <tr>
            <td>
              <span style="
                      color:${point.color || point.series.color}; 
                      padding-right: 0.25em; 
                      padding-left:${hasPowerLimit ? horizontalPadding : '0'};
                      ">\u25CF</span>
              ${point.series.name}
            </td>
            <td style="
                  text-align: right; 
                  padding-left: 0.5em;
                  padding-right:${hasPowerLimit ? horizontalPadding : '0'};
                  font-weight: ${secondarySeries ? 'normal' : 'bold'}">
              ${formattedPointValue}
            </td>
          </tr>`;
      }
    });

    tooltipHtml += `
        </table>
      </div>
      `;

    // Power limit set from inverter control panel

    if (customPowerLimitDetails) {
      tooltipHtml += `
        <div style="padding: ${verticalPadding} ${horizontalPadding}; background: #d9343a11;">
          <table style="border-spacing: ${borderSpacing}; border-collapse: separate; width: 100%">
            <tbody>
              <tr>
                <td>
                  <span style="color:${powerLimitSeriesColor}; padding-right: 0.25em">\u25CF</span> Power limit
                </td>
                <td style="text-align: right; font-weight: bold">
                  ${formatNumber(customPowerLimitDetails.value, APP_LOCALE_ID, precisionFormat)} kW
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }

    // Scheduled power limit

    if (scheduledLimitDataPoint) {
      const scheduledPowerLimitSet_Formatted =
        scheduledLimitDataPoint.requestedPowerLimitSet === null
          ? $localize`Unlimited`
          : `${formatNumber(
              scheduledLimitDataPoint.requestedPowerLimitSet,
              APP_LOCALE_ID,
              precisionFormat,
            )} kW`;

      const color = point.custom?.controlledByExternalSystem ? '#00000011' : '#ffdb8c33';

      tooltipHtml += `
        <div style="padding: ${verticalPadding} ${horizontalPadding}; background: ${color};">
          <table style="border-spacing: ${borderSpacing}; border-collapse: separate; width: 100%">
            <tbody>`;

      // Show timestamp only for plant schedule as active power value comes from different collection.
      // Otherwise show only if different.
      if (point.custom?.scheduledLimitForPlant || scheduledLimitDataPoint.timestamp !== timestamp) {
        const scheduledLimitTimestampFormatted = formatTimestampForTooltip(
          scheduledLimitDataPoint.timestamp,
          tooltip.chart.options.time?.timezone,
        );

        tooltipHtml += `
        <tr>
            <td colspan=2 style="text-align: left; line-height: 1.0">
              <span class="secondary-text">
                ${scheduledLimitTimestampFormatted}
              </span>
            </td>
          </tr>
      `;
      }

      const seriesColor = point.custom?.controlledByExternalSystem
        ? '#000000'
        : powerLimitSeriesColor;

      tooltipHtml +=
        `
              <tr>
                <td>
                  <span style="color:${seriesColor}; padding-right: 0.25em">\u25CF</span> 
                  <span>
                    ` +
        $localize`Scheduled power limit` +
        `
                  </span>
                </td>
                <td style="text-align: right; padding-left: 0.5em; font-weight: bold">
                  ${scheduledPowerLimitSet_Formatted}
                </td>
              </tr>
        
              <tr>
                <td> 
                  <span style="color:#ffffff00; padding-right: 0.25em">\u25CF</span> 
                  <span>
                    ` +
        $localize`Requested limit` +
        `
                  </span>
                </td>
                <td style="text-align: right; padding-left: 0.5em;">
                  <span>
                  ${formatNumber(
                    scheduledLimitDataPoint.requestedPowerLimit,
                    APP_LOCALE_ID,
                    precisionFormat,
                  )} kW
                  </span>
                </td>
              </tr>`;

      if (point.custom?.hasPermissionToSeeAllDetails) {
        tooltipHtml +=
          `<tr>
                <td> 
                  <span style="color:#ffffff00; padding-right: 0.25em">\u25CF</span> 
                  <span>
                    ` +
          $localize`Reported limit` +
          `
                  </span>
                </td>
                <td style="text-align: right; padding-left: 0.5em;">
                  <span>
                  ${
                    scheduledLimitDataPoint.reportedPowerLimit
                      ? formatNumber(
                          scheduledLimitDataPoint.reportedPowerLimit,
                          APP_LOCALE_ID,
                          precisionFormat,
                        )
                      : '&mdash;'
                  } kW
                  </span>
                </td>
              </tr>`;
      }

      tooltipHtml += `
            </tbody>
          </table>
        </div>
        `;
    }

    // Active power reported from GW

    const activePowerFromGW = point.custom?.activePowerFromGW;
    if (activePowerFromGW) {
      const activePowerFromGW_FormattedValue =
        activePowerFromGW.value !== null
          ? `${formatNumber(activePowerFromGW.value, APP_LOCALE_ID, precisionFormat)} kW`
          : '&mdash;';

      const timestampFormatted = formatTimestampForTooltip(
        activePowerFromGW.timestamp,
        tooltip.chart.options.time?.timezone,
      );

      tooltipHtml +=
        `
        <div style="padding: ${verticalPadding} 0; background: #f5f7f800;">
          <table style="border-spacing: ${borderSpacing}; border-collapse: separate; width: 100%">
            <tbody>

              <tr>
                <td colspan=2 style="text-align: left">
                  <div class="secondary-text">
                    ${timestampFormatted}
                  </div>
                </td>
              </tr>

              <tr>
                <td>
                  <span style="
                          color:#d4dce3; 
                          padding-right: 0.25em; 
                          padding-left:${hasPowerLimit ? horizontalPadding : '0'};
                        ">\u25CF</span>
                    ` +
        $localize`Active power from GW` +
        `
                </td>
                <td style="
                      text-align: right; 
                      padding-left: 0.5em;
                      padding-right:${hasPowerLimit ? horizontalPadding : '0'};">
                  ${activePowerFromGW_FormattedValue}
                </td>
              </tr>

            </tbody>
          </table>
        </div>
        `;
    }

    if (point.custom?.controlledByExternalSystem) {
      tooltipHtml += externalControlWarningHtml;
    }

    return tooltipHtml;
  },
};
