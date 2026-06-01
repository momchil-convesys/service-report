/**
 * Round values
 */

import { PVPowerDataForPlant_NEW } from './pv-power';

function roundValue(value: number | null | undefined): number | null {
  return value ? Math.round(value * 1) / 1 : null;
}

export function roundPVPowerData_Mutable(data: PVPowerDataForPlant_NEW) {
  data.dataPoints.forEach((point) => {
    point.activePower = roundValue(point.activePower);
    point.activePowerPM = roundValue(point.activePowerPM);
  });

  data.scheduledPowerLimitDataPoints.forEach((point) => {
    point.reportedPowerLimit = roundValue(point.reportedPowerLimit);
    point.requestedPowerLimit = roundValue(point.requestedPowerLimit) as number;
    point.requestedPowerLimitSet = roundValue(point.requestedPowerLimitSet) as number;
  });

  data.scheduledPowerLimitDataPoints_Adjusted.forEach((point) => {
    point.reportedPowerLimit = roundValue(point.reportedPowerLimit);
    point.requestedPowerLimit = roundValue(point.requestedPowerLimit) as number;
    point.requestedPowerLimitSet = roundValue(point.requestedPowerLimitSet) as number;
  });
}

// export function roundPVPowerData_ForDevice_Mutable(data: PVPowerDataForDevice_NEW) {
//   data.dataPoints.forEach((point) => {
//     point.activePower = roundValue(point.activePower);
//     if (point.extraSeriesValues) {
//       point.extraSeriesValues = point.extraSeriesValues.map((value) => roundValue(value));
//     }
//   });

//   data.scheduledPowerLimitDataPoints.forEach((point) => {
//     point.reportedPowerLimit = roundValue(point.reportedPowerLimit);
//     point.requestedPowerLimit = roundValue(point.requestedPowerLimit) as number;
//     point.requestedPowerLimitSet = roundValue(point.requestedPowerLimitSet) as number;
//   });
// }
