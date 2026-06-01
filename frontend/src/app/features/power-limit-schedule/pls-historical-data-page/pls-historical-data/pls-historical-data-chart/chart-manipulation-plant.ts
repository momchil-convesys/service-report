import { seriesById } from '../../../../../helpers';
import Highcharts from '../../../../../highcharts-global-config';
import { BaseChartContext } from '../../../../../shared/base-chart-component/base-chart-component.component';

import {
  seriesId_ScheduledPowerLimit_Reported,
  seriesId_ScheduledPowerLimit_Requested,
  seriesId_ScheduledPowerLimit_RequestedSet,
} from '../../../charts/chart-common-definitions';
import { MasterGwScheduledPowerLimitHistoricalData } from '../../_data/dto';

export function patchOptions_Plant(commonOptions: Highcharts.Options): Highcharts.Options {
  return { ...commonOptions };
}

export function updateOptions_Plant(chart: Highcharts.Chart, context: BaseChartContext) {
  chart.update({ title: { text: context.plant.name || 'Plant' } }, false);

  const maxPowerValues: number[] =
    (context.plant.devices || [])
      .map((device) => device.deviceSpecificMetadata.deviceMaxPower)
      .filter((x): x is number => x !== undefined) || [];
  const maxPowerValueForPlant = maxPowerValues.reduce((partialSum, a) => partialSum + a, 0);

  chart.yAxis[0]?.update({ max: maxPowerValueForPlant || undefined }, false);
}

export function setData_Plant(
  chart: Highcharts.Chart,
  data: MasterGwScheduledPowerLimitHistoricalData,
  context: BaseChartContext,
) {
  seriesById(chart, seriesId_ScheduledPowerLimit_Requested)?.setData(
    data.dataPoints.map(
      (dataPoint) => [
        new Date(dataPoint.plantPoint.timestamp).getTime(),
        dataPoint.plantPoint.requestedPowerLimit,
      ],
      false,
    ),
  );

  seriesById(chart, seriesId_ScheduledPowerLimit_RequestedSet)?.setData(
    data.dataPoints.map(
      (dataPoint) => [
        new Date(dataPoint.plantPoint.timestamp).getTime(),
        dataPoint.plantPoint.requestedPowerLimitSet,
      ],
      false,
    ),
  );

  seriesById(chart, seriesId_ScheduledPowerLimit_Reported)?.setData(
    data.dataPoints.map(
      (dataPoint) => [
        new Date(dataPoint.plantPoint.timestamp).getTime(),
        dataPoint.plantPoint.reportedPowerLimit,
      ],
      false,
    ),
  );
}
