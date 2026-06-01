import { differenceInDays, differenceInMinutes } from 'date-fns';
import { formatIntervalForTooltip, formatTimestampForTooltip } from '../../../app-locale';
import { PowerMetersCumulativeDataPoint } from '../../extended-plant-metrics/_data/models';

export const tooltip: Highcharts.TooltipOptions = {
  shared: true,
  distance: 20,
  shape: 'rect',
  outside: false,
  shadow: false,
  borderWidth: 1,
  borderColor: '#edf0f3',
  backgroundColor: '#ffffff',
  positioner: function (labelWidth, labelHeight, point) {
    return { x: 0, y: 0 };
  },
  style: {
    fontSize: '0.8em',
    lineHeight: '1.2',
  },
  useHTML: true,
  formatter: function (tooltip) {
    const defaultTooltip = tooltip.defaultFormatter.call(this, tooltip);

    const dataPoint: PowerMetersCumulativeDataPoint = (this as any).custom;

    if (!dataPoint) {
      return defaultTooltip;
    }

    let applicableRange: Interval = {
      start: dataPoint.interval.from,
      end: dataPoint.interval.to,
    };

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

    if (Array.isArray(defaultTooltip) && defaultTooltip.length > 0) {
      return [`<div style="margin-bottom: 3px">${formattedDate}</div>`, ...defaultTooltip.slice(1)];
    }

    return defaultTooltip;
  },
};
