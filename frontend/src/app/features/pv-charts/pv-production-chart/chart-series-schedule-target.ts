import { seriesById } from '../../../helpers';
import { calcScheduleAdjustmentPercentageFormatted } from '../../../helpers/_schedule-adjustment-coefficient';
import { excludeSeriesFromCrossHairClassName } from '../../../highcharts-global-config';
import {
  seriesColor_TargetPowerLimit,
  seriesId_TargetPowerLimit,
  seriesId_TargetPowerLimitAdjusted,
} from '../../power-limit-schedule/charts/chart-common-definitions';
import { PVProductionData, TargetLimit_DataPoint } from './_data/pv-production';

export interface ExtendedTargetLimitPoint extends Highcharts.PointOptionsObject {
  custom: TargetLimit_DataPoint;
}

const seriesColor_TargetPowerLimitAdjusted = '#b3222c';

const baseName = $localize`Schedule assignment`;

const sharedSeriesOptions: Highcharts.SeriesOptionsType = {
  type: 'xrange',
  colorByPoint: false,
  grouping: false,
  pointWidth: 1,
  className: excludeSeriesFromCrossHairClassName,
  borderWidth: 0,
  // TODO:
  // borderColor is set to transparent, as border is always visible,
  // regardles of borderWidth: 0
  borderColor: '#ffffff00',
  borderRadius: 0,
  stickyTracking: false,
  states: {
    inactive: {
      opacity: 0.9,
    },
  },
  legendSymbol: 'lineMarker',
  name: baseName,
};

export const seriesOptions_ScheduleTarget: Highcharts.SeriesOptionsType[] = [
  {
    ...sharedSeriesOptions,

    id: seriesId_TargetPowerLimit,
    color: seriesColor_TargetPowerLimit,
    visible: true,
  },
  {
    ...sharedSeriesOptions,

    id: seriesId_TargetPowerLimitAdjusted,
    color: seriesColor_TargetPowerLimitAdjusted,
  },
];

export function updateSeriesData_ScheduleTarget(chart: Highcharts.Chart, data: PVProductionData) {
  const targetPowerLimitData: ExtendedTargetLimitPoint[] =
    data.targetPowerLimitData?.map((point) => {
      const targetLimitOriginal =
        point.energyLimitEquivalent?.targetLimitOriginal || point.targetLimitOriginal;

      return {
        x: point.applicableRange.from.getTime(),
        x2: point.applicableRange.to.getTime(),
        y: targetLimitOriginal.value,
        color: seriesColor_TargetPowerLimit + (targetLimitOriginal.value === null ? '00' : 'ff'),
        custom: point,
      };
    }) || [];
  seriesById(chart, seriesId_TargetPowerLimit)?.setData(targetPowerLimitData, false, false);

  const targetPowerLimitDataAdjusted: ExtendedTargetLimitPoint[] =
    data.targetPowerLimitData?.map((point) => {
      const targetLimitOriginal =
        point.energyLimitEquivalent?.targetLimitOriginal || point.targetLimitOriginal;

      return {
        x: point.applicableRange.from.getTime(),
        x2: point.applicableRange.to.getTime(),
        y: targetLimitOriginal.valueAdjusted,
        color:
          seriesColor_TargetPowerLimitAdjusted +
          (targetLimitOriginal.valueAdjusted === null ? '00' : 'ff'),
        custom: point,
      };
    }) || [];
  seriesById(chart, seriesId_TargetPowerLimitAdjusted)?.setData(
    targetPowerLimitDataAdjusted,
    false,
    false,
  );
}

export function updateSeriesOptions_ScheduleTarget(
  chart: Highcharts.Chart,
  showInLegend: boolean,
  powerLimitTargetCoefficient: number,
) {
  seriesById(chart, seriesId_TargetPowerLimit)?.update(
    {
      type: 'xrange',
      name: baseName,
      visible: powerLimitTargetCoefficient !== 1,
      showInLegend: powerLimitTargetCoefficient !== 1 && showInLegend,
    },
    false,
  );

  seriesById(chart, seriesId_TargetPowerLimitAdjusted)?.update(
    {
      type: 'xrange',
      showInLegend,
      name: baseName + calcScheduleAdjustmentPercentageFormatted(powerLimitTargetCoefficient),
    },
    false,
  );
}
