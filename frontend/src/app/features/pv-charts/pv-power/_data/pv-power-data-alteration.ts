import { differenceInSeconds, isSameSecond } from 'date-fns';
import { MasterGwScheduledPowerLimitDataPoint_ForPlant } from '../../../power-limit-schedule/_data/dto';

// Cloudy point conditions:
//    active power goes down
//    power limit goes up
//    power limit - active power > shadyDivergeTreshold

// const shadyDivergeTreshold = 5000;

interface ActivePowerPoints {
  timestamp: Date;

  activePower: number | null;
  activePowerPM?: number | null;

  extraSeriesValues: (number | null)[]; // Corresponding to extraSeriesLabels in the same order
}
[];

export function adjustPVPowerData(
  originalDataPoints: MasterGwScheduledPowerLimitDataPoint_ForPlant[],
  activePowerPoints: ActivePowerPoints[],
  hasPowerMeter: boolean,
  maxPowerLimitTreshold: number | undefined,
  limitType: 'power' | 'energy' | undefined,
): MasterGwScheduledPowerLimitDataPoint_ForPlant[] {
  if (limitType === 'power') {
    return adjustPVPowerData_LimitTypePower(
      originalDataPoints,
      activePowerPoints,
      hasPowerMeter,
      maxPowerLimitTreshold,
    );
  }

  return adjustPVPowerData_LimitTypeEnergy(
    originalDataPoints,
    activePowerPoints,
    hasPowerMeter,
    maxPowerLimitTreshold,
  );
}

function adjustPVPowerData_LimitTypeEnergy(
  originalDataPoints: MasterGwScheduledPowerLimitDataPoint_ForPlant[],
  activePowerPoints: ActivePowerPoints[],
  hasPowerMeter: boolean,
  maxPowerLimitTreshold: number | undefined,
): MasterGwScheduledPowerLimitDataPoint_ForPlant[] {
  let result: MasterGwScheduledPowerLimitDataPoint_ForPlant[] = originalDataPoints.map((point) => ({
    ...point,
  }));

  /**
   * Replace reportedPowerLimit with activePower
   */

  result.forEach((point) => {
    const equvallentActivePowerPoint = activePowerPoints.find((p) =>
      isSameSecond(p.timestamp, new Date(point.timestamp)),
    );

    if (!equvallentActivePowerPoint) {
      return;
    }

    point.reportedPowerLimit =
      hasPowerMeter &&
      equvallentActivePowerPoint.activePowerPM !== undefined &&
      equvallentActivePowerPoint.activePowerPM !== null
        ? equvallentActivePowerPoint.activePowerPM
        : equvallentActivePowerPoint.activePower;
  });

  /**
   * The shady (cloudy) filter.
   *
   * Handle cloud conditions (when limit starts to go up and active power goes down).
   * Note that this is better done on the original data set, before other filtering,
   * as we calculate consecutive points with preferably no gaps.
   */

  let nonCloudyPoints: MasterGwScheduledPowerLimitDataPoint_ForPlant[] = [];

  result.forEach((point, index) => {
    if (index === 0) {
      return;
    }

    const previousPoint = result[index - 1];

    if (point.requestedPowerLimitSet === null || previousPoint.requestedPowerLimitSet === null) {
      return;
    }

    const diffInSeconds = differenceInSeconds(
      new Date(previousPoint.timestamp),
      new Date(point.timestamp),
    );

    // If there is a gap
    if (Math.abs(diffInSeconds) > 60) {
      return;
    }

    const activePowerForPoint = point.reportedPowerLimit;

    if (activePowerForPoint === null) {
      return;
    }

    const activePowerForPreviousPoint = previousPoint.reportedPowerLimit;

    if (activePowerForPreviousPoint === null) {
      return;
    }

    if (
      // point.hasEffectivePowerLimit !== true && // hasEffectivePowerLimit flag has priority
      point.requestedPowerLimitSet > previousPoint.requestedPowerLimitSet &&
      activePowerForPoint < activePowerForPreviousPoint
      // point.requestedPowerLimitSet - activePowerForPoint > shadyDivergeTreshold
    ) {
      // Point should be removed
    } else {
      nonCloudyPoints.push(point);
    }
  });

  result = nonCloudyPoints;

  /**
   * Remove points above maxPowerLimitTreshold
   */

  result.forEach((point) => {
    if (
      // point.hasEffectivePowerLimit !== true && // hasEffectivePowerLimit flag has priority
      maxPowerLimitTreshold !== undefined &&
      point.requestedPowerLimitSet !== null &&
      point.requestedPowerLimitSet > maxPowerLimitTreshold &&
      point.controlledByExternalSystem !== true
    ) {
      point.requestedPowerLimitSet = null;
    }
  });

  /**
   * Reduce limit value to active power
   */

  result.forEach((point) => {
    if (point.requestedPowerLimitSet === null || point.reportedPowerLimit === null) {
      return;
    }

    const activePower = point.reportedPowerLimit;

    if (activePower !== null) {
      const diff: number = point.requestedPowerLimitSet - activePower;
      if (diff > 0 && point.controlledByExternalSystem !== true) {
        point.requestedPowerLimitSet = activePower;
      }
    }
  });

  /**
   * Reset negative power limit values to zero.
   * NOTE that this should be done after all other alterations,
   * as some of them may result in negative values.
   */

  result.forEach((point) => {
    if (point.requestedPowerLimitSet !== null && point.requestedPowerLimitSet < 0) {
      point.requestedPowerLimitSet = null;
    }
  });

  /**
   * Remove points with hasEffectivePowerLimit === false
   */

  result.forEach((point) => {
    if (point.hasEffectivePowerLimit === false) {
      point.requestedPowerLimitSet = null;
    }
  });

  return result;
}

function adjustPVPowerData_LimitTypePower(
  originalDataPoints: MasterGwScheduledPowerLimitDataPoint_ForPlant[],
  activePowerPoints: ActivePowerPoints[],
  hasPowerMeter: boolean,
  maxPowerLimitTreshold: number | undefined,
): MasterGwScheduledPowerLimitDataPoint_ForPlant[] {
  let result: MasterGwScheduledPowerLimitDataPoint_ForPlant[] = originalDataPoints.map((point) => ({
    ...point,
  }));

  /**
   * Replace reportedPowerLimit with activePower
   */

  // result.forEach((point) => {
  //   const equvallentActivePowerPoint = activePowerPoints.find((p) =>
  //     isSameSecond(p.timestamp, new Date(point.timestamp))
  //   );

  //   if (!equvallentActivePowerPoint) {
  //     return;
  //   }

  //   point.reportedPowerLimit =
  //     hasPowerMeter &&
  //     equvallentActivePowerPoint.activePowerPM !== undefined &&
  //     equvallentActivePowerPoint.activePowerPM !== null
  //       ? equvallentActivePowerPoint.activePowerPM
  //       : equvallentActivePowerPoint.activePower;
  // });

  /**
   * Remove points above maxPowerLimitTreshold
   */

  result.forEach((point) => {
    // hasEffectivePowerLimit flag has priority
    if (point.hasEffectivePowerLimit === true) {
      return;
    }

    if (
      maxPowerLimitTreshold !== undefined &&
      point.requestedPowerLimitSet !== null &&
      point.requestedPowerLimitSet > maxPowerLimitTreshold &&
      point.controlledByExternalSystem !== true
    ) {
      point.requestedPowerLimitSet = null;
    }
  });

  /**
   * Hide points if original power limit is greater than active power.
   */

  result.forEach((point) => {
    // hasEffectivePowerLimit flag has priority
    if (point.hasEffectivePowerLimit === true) {
      return;
    }

    if (point.requestedPowerLimitSet !== null && point.reportedPowerLimit !== null) {
      if (
        point.requestedPowerLimitSet > point.reportedPowerLimit &&
        point.controlledByExternalSystem !== true
      ) {
        point.requestedPowerLimitSet = null;
      }
    }
  });

  /**
   * Reset negative power limit values to zero.
   * NOTE that this should be done after all other alterations,
   * as some of them may result in negative values.
   */

  result.forEach((point) => {
    if (point.requestedPowerLimitSet !== null && point.requestedPowerLimitSet < 0) {
      point.requestedPowerLimitSet = null;
    }
  });

  return result;
}
