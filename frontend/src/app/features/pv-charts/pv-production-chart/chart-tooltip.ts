import { formatNumber } from '@angular/common';
import { differenceInDays, differenceInMinutes, isWithinInterval, subSeconds } from 'date-fns';
import {
  APP_LOCALE_ID,
  formatIntervalForTooltip,
  formatTimestampForTooltip,
} from '../../../app-locale';
import { seriesById, seriesData } from '../../../helpers';
import {
  seriesId_TargetPowerLimit,
  seriesId_TargetPowerLimitAdjusted,
} from '../../power-limit-schedule/charts/chart-common-definitions';
import { TargetLimit_DataPoint } from './_data/pv-production';
import { deviationFromTargetTreshold } from './chart-common';
import { seriesId_EnergyProduction } from './chart-series-energy-production';
import { seriesId_EnergyProduction_Excess } from './chart-series-energy-production-excess';
import { seriesId_EnergyProduction_Shortage } from './chart-series-energy-production-shortage';
import { seriesId_ExternalSystemControl_Prefix } from './chart-series-external-system-control';
import { seriesId_ManualControl_Prefix } from './chart-series-manual-control';
import { seriesId_ScheduleStatus_Prefix } from './chart-series-schedule-status';
import {
  HoverablePointCustomData,
  seriesId_SharedColumnHover,
} from './chart-series-shared-column-hover';
import { createTooltipForExternalSystemControlSeries } from './chart-tooltip-external-system-control';
import { createTooltipForManualControlSeries } from './chart-tooltip-manual-control';
import { createTooltipForScheduleStatusSeries } from './chart-tooltip-schedule-status';

export const tooltip: Highcharts.TooltipOptions = {
  shared: false,
  valueDecimals: 0,
  valueSuffix: ' kWh',
  style: {
    fontSize: '0.8em',
    lineHeight: '1.1',
    zIndex: 10,
  },
  useHTML: true,
  shape: 'rect',
  outside: true,

  formatter: function (tooltip) {
    if (this.series.options.id?.startsWith(seriesId_ScheduleStatus_Prefix)) {
      return createTooltipForScheduleStatusSeries(this as any);
    }

    if (this.series.options.id?.startsWith(seriesId_ExternalSystemControl_Prefix)) {
      return createTooltipForExternalSystemControlSeries(this as any);
    }

    if (this.series.options.id?.startsWith(seriesId_ManualControl_Prefix)) {
      return createTooltipForManualControlSeries(this as any);
    }

    if (this.series.options.id !== seriesId_SharedColumnHover || !(this as any).custom) {
      return tooltip.defaultFormatter.call(this, tooltip);
    }

    /**
     * Construct tooltip based on
     * seriesId_SharedColumnHover hover point (this.point)
     */

    const dataPoint: HoverablePointCustomData = (this as any).custom;
    const chart: Highcharts.Chart = this.series.chart;

    let points: Highcharts.Point[] = [];

    let applicableRange: Interval = {
      start: dataPoint.applicableRange.from,
      end: dataPoint.applicableRange.to,
    };

    const productionSeries: Highcharts.Series | undefined = seriesById(
      chart,
      seriesId_EnergyProduction,
    );

    // In case of cropping, the `data` array may contain `undefined` values, instead of points.
    const productionSeries_Data: (Highcharts.Point | undefined)[] = productionSeries?.data || [];

    const productionSeries_Point: Highcharts.Point | undefined = productionSeries?.visible
      ? productionSeries_Data.find((p) => p && p.x === this.x)
      : undefined;

    if (productionSeries_Point) {
      points.push(productionSeries_Point);
    }

    const exactInterval: Interval = {
      start: applicableRange.start,
      end: subSeconds(applicableRange.end, 1),
    };

    const now = new Date();
    const isCurrent = isWithinInterval(now, exactInterval);

    //-----------------------
    // Adjusted target

    const scheduleTargetAdjusted_Points =
      seriesById(chart, seriesId_TargetPowerLimitAdjusted)?.data.filter((p) =>
        isWithinInterval(p.x, exactInterval),
      ) || [];

    scheduleTargetAdjusted_Points.forEach((p, index) => {
      if (index < scheduleTargetAdjusted_Points.length - 1) {
        p.options.custom = { strikeThrough: true };
      }
    });

    points.push(...scheduleTargetAdjusted_Points);

    //-----------------------
    // Target unadjusted

    const scheduleTarget_Points =
      seriesById(chart, seriesId_TargetPowerLimit)?.data.filter((p) =>
        isWithinInterval(p.x, exactInterval),
      ) || [];

    scheduleTarget_Points.forEach((p, index) => {
      if (index < scheduleTarget_Points.length - 1) {
        p.options.custom = { strikeThrough: true };
      }
    });

    points.push(...scheduleTarget_Points);

    //--------------------------------------------------------------------------

    const timestamp = this.x;

    let formattedDate: string = '';

    if (applicableRange && differenceInMinutes(applicableRange.end, applicableRange.start) <= 60) {
      formattedDate = formatIntervalForTooltip(
        applicableRange,
        tooltip.chart.options.time?.timezone,
      );
    } else {
      const customFormat =
        applicableRange && differenceInDays(applicableRange.end, applicableRange.start) < 2
          ? 'd MMMM'
          : 'MMMM yyyy';

      formattedDate = formatTimestampForTooltip(timestamp, tooltip.chart.options.time?.timezone, {
        customFormat,
      });
    }

    let tooltipHtml = `
      <table style="border-collapse: separate; width: 100%; margin-top: -2px; margin-bottom: -2px">        
        <tr>
          <td colspan=2 style="text-align: left; line-height: 1.0; padding-bottom:0.25em">
            <span class="secondary-text-color">
              ${formattedDate}
            </span>
          </td>
        </tr>
        `;

    points
      .filter((point) => point.series.visible)
      .map((point) => {
        {
          const value = point.y;

          let formattedPointValue = '';
          let symbol = '';
          let isInvalid = false;

          /**
           * ---------------------------------------------------------------------------------------
           * Power limit points
           */
          if (
            point.series.options.id === seriesId_TargetPowerLimit ||
            point.series.options.id === seriesId_TargetPowerLimitAdjusted
          ) {
            symbol = `<b style="color:${point.series.color}; padding-right: 0.25em">&mdash;</b>`;

            /**
             * In case of cropping, the `data` array may contain `undefined` values, instead of points.
             * So we check the real value from `series.options.data`.
             */
            if (
              seriesData(chart, point.series.options.id).find(
                (dataPoint) => dataPoint.x === point.x,
              )?.y === null
            ) {
              formattedPointValue = $localize`:@@noLimitShort:NL`;
            } else {
              const targetLimitDataPoint: TargetLimit_DataPoint = (point as any).custom;

              if (targetLimitDataPoint.energyLimitEquivalent) {
                /**
                 * Scheduled limit type 'power'
                 */

                const originalPowerValue =
                  point.series.options.id === seriesId_TargetPowerLimit
                    ? targetLimitDataPoint.targetLimitOriginal.value
                    : targetLimitDataPoint.targetLimitOriginal.valueAdjusted;

                formattedPointValue +=
                  originalPowerValue !== undefined && originalPowerValue !== null
                    ? formatNumber(originalPowerValue, APP_LOCALE_ID, '1.0-0') + ' kW'
                    : '&mdash;';

                const energyEquivalentValue =
                  point.series.options.id === seriesId_TargetPowerLimit
                    ? targetLimitDataPoint.energyLimitEquivalent?.targetLimitOriginal.value
                    : targetLimitDataPoint.energyLimitEquivalent?.targetLimitOriginal.valueAdjusted;

                const energyEquivallentValueFormatted = energyEquivalentValue
                  ? formatNumber(energyEquivalentValue, APP_LOCALE_ID, '1.0-0') + ' kWh'
                  : null;

                if (energyEquivallentValueFormatted) {
                  formattedPointValue += ' &rArr; ' + energyEquivallentValueFormatted;
                }
              } else {
                /**
                 * Scheduled limit type 'energy' (initial implementation)
                 */

                formattedPointValue =
                  value !== undefined && value !== null
                    ? formatNumber(value, APP_LOCALE_ID, '1.0-0') + ' kWh'
                    : '&mdash;';
              }
            }
          } else {
            /**
             * ---------------------------------------------------------------------------------------
             * Production points and other (default for all other series)
             */

            if (
              point.series.options.id === seriesId_EnergyProduction &&
              value !== null &&
              value !== undefined &&
              value < 0
            ) {
              isInvalid = true;
              formattedPointValue = $localize`INVALID DATA`;
            } else {
              formattedPointValue =
                value !== undefined && value !== null
                  ? formatNumber(value, APP_LOCALE_ID, '1.0-0') +
                    (tooltip.options.valueSuffix || '')
                  : '&mdash;';
            }

            symbol = `<span style="color:${point.series.color}; padding-right: 0.25em">\u25CF</span>`;
          }

          const strikeThrough = point.options.custom && point.options.custom['strikeThrough'];
          if (!strikeThrough) {
            const invalidDataStyle = isInvalid
              ? 'background-color: #d9343a; color: white; padding: 0 0.5em; border-radius: 2px;'
              : '';

            tooltipHtml += `
            <tr>
              <td style="padding-right: 0.5em;">
                ${symbol}
                <span style="text-decoration: ${strikeThrough ? 'line-through' : 'none'};">${
                  point.series.name
                }</span>
              </td>
              <td style="
                    ${invalidDataStyle}
                    text-align: right; 
                    font-weight: bold;
                    ">
                <span style="text-decoration: ${
                  strikeThrough ? 'line-through' : 'none'
                };">${formattedPointValue}</span>
              </td>
            </tr>`;
          }
        }
      });

    //--------------------------------------------------------------------------
    // Deviation point (Escess or Shortage)

    let deviationPoint: Highcharts.Point | undefined = undefined;
    let sign = '';

    let label = $localize`Deviation from original target`;

    const productionShortage_Point = seriesById(
      chart,
      seriesId_EnergyProduction_Shortage,
    )?.data.find((p) => p.x === this.x);
    if (productionShortage_Point) {
      if (productionShortage_Point?.series.visible) {
        deviationPoint = productionShortage_Point;
        sign = '&minus;';

        if (isCurrent) {
          sign = '';
          label = $localize`Left to produce`;
        }
      }
    } else {
      const productionExcess_Point = seriesById(chart, seriesId_EnergyProduction_Excess)?.data.find(
        (p) => p.x === this.x,
      );
      if (productionExcess_Point && productionExcess_Point.series.visible) {
        deviationPoint = productionExcess_Point;
        sign = '&plus;';

        if (isCurrent) {
          sign = '';
          label = $localize`Produced over target`;
        }
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

        if (value > deviationFromTargetTreshold) {
          valueDanger = true;
        }
      }

      const separatorColor = '#edf0f3';
      const valueColor = !isCurrent && valueDanger ? '#d9343a' : 'inherit';
      const valueFontWeight = !isCurrent ? 'bold' : 'inherit';
      const verticalSpacing = '0.25em';

      tooltipHtml += `
      <tr>
        <td colspan=2
            style="
              border-bottom: 1px solid ${separatorColor};
              padding-top: ${verticalSpacing}
              ">
        </td>
      </tr>`;

      tooltipHtml += `
      <tr>
        <td style="
              padding-top: ${verticalSpacing}
              ">
          <span style="color: #ffffff; padding-right: 0.25em">\u25CF</span>
          ${label}
        </td>
        <td style="
              text-align: right; 
              padding-left: 0.5em;
              font-weight: ${valueFontWeight};
              color: ${valueColor};
              padding-top: ${verticalSpacing}
              ">
          ${formattedPointValue}
        </td>
      </tr>`;
    }

    //--------------------------------------------------------------------------

    tooltipHtml += `
      </table>
    `;

    return tooltipHtml;
  },
};
