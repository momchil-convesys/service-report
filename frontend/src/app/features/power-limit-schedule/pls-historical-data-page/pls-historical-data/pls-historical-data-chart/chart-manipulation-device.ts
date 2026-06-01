import { Device } from '../../../../../data/models';
import { seriesById } from '../../../../../helpers';
import Highcharts from '../../../../../highcharts-global-config';
import { BaseChartContext } from '../../../../../shared/base-chart-component/base-chart-component.component';

import {
  seriesId_ScheduledPowerLimit_Reported,
  seriesId_ScheduledPowerLimit_Requested,
  seriesId_ScheduledPowerLimit_RequestedSet,
} from '../../../charts/chart-common-definitions';
import { MasterGwScheduledPowerLimitHistoricalData } from '../../_data/dto';

export function patchOptions_Device(commonOptions: Highcharts.Options): Highcharts.Options {
  const result: Highcharts.Options = {
    ...commonOptions,
    legend: {
      enabled: false,
    },
  };
  return result;
}

export function updateOptions_Device(chart: Highcharts.Chart, context: BaseChartContext) {
  const device: Device | undefined = context.plant.devices.find((d) => d.id === context.deviceId);

  chart.update({ title: { text: device?.name || 'Device' } }, false);

  chart.yAxis[0]?.update(
    { max: device?.deviceSpecificMetadata.deviceMaxPower || undefined },
    false,
  );
}

export function setData_Device(
  chart: Highcharts.Chart,
  data: MasterGwScheduledPowerLimitHistoricalData,
  context: BaseChartContext,
) {
  seriesById(chart, seriesId_ScheduledPowerLimit_Requested)?.setData(
    data.dataPoints.map((dataPoint) => {
      const deviceDataPoint = dataPoint.devicesPoints.find(
        (point) => point.deviceId === context?.deviceId,
      );
      if (!deviceDataPoint) {
        return [new Date(dataPoint.plantPoint.timestamp).getTime(), null];
      }

      return [new Date(deviceDataPoint.timestamp).getTime(), deviceDataPoint.requestedPowerLimit];
    }, false),
  );

  seriesById(chart, seriesId_ScheduledPowerLimit_RequestedSet)?.setData(
    data.dataPoints.map((dataPoint) => {
      const deviceDataPoint = dataPoint.devicesPoints.find(
        (point) => point.deviceId === context?.deviceId,
      );
      if (!deviceDataPoint) {
        return [new Date(dataPoint.plantPoint.timestamp).getTime(), null];
      }

      return [
        new Date(deviceDataPoint.timestamp).getTime(),
        deviceDataPoint.requestedPowerLimitSet,
      ];
    }, false),
  );

  seriesById(chart, seriesId_ScheduledPowerLimit_Reported)?.setData(
    data.dataPoints.map((dataPoint) => {
      const deviceDataPoint = dataPoint.devicesPoints.find(
        (point) => point.deviceId === context?.deviceId,
      );
      if (!deviceDataPoint) {
        return [new Date(dataPoint.plantPoint.timestamp).getTime(), null];
      }

      return [new Date(deviceDataPoint.timestamp).getTime(), deviceDataPoint.reportedPowerLimit];
    }, false),
  );
}
