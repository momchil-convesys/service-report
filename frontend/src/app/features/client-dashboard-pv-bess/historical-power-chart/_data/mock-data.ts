import { isSameDay, startOfDay } from 'date-fns';
import { PVBESSHistoricalPowerData_DTO } from './dto';

interface PowerDataState {
  pvPower: number | null;
  bessPower: number | null; // Positive when discharging, negative when charging
  gridPower: number | null; // Positive when exporting, negative when importing
  consumption: number | null;
}

function generatePowerDataPoint(timestamp: Date, previousState: PowerDataState): PowerDataState {
  const hour = timestamp.getHours();
  const state: PowerDataState = {
    pvPower: null,
    bessPower: null,
    gridPower: null,
    consumption: null,
  };

  // Simulate PV power: high during day (6-18), zero at night
  let pvTargetValue: number;
  if (hour >= 6 && hour < 18) {
    const normalizedHour = (hour - 6) / 12; // 0 to 1
    const sineValue = Math.sin(normalizedHour * Math.PI);
    pvTargetValue = sineValue * 50000 + Math.random() * 5000; // 0-55000 kW
  } else {
    pvTargetValue = 0;
  }

  // Smooth PV power transition
  if (previousState.pvPower === null) {
    state.pvPower = Math.round(pvTargetValue);
  } else {
    const smoothingFactor = 0.15;
    const smoothedValue = previousState.pvPower + (pvTargetValue - previousState.pvPower) * smoothingFactor;
    state.pvPower = Math.round(smoothedValue);
  }

  // BESS behavior: charge during day (negative), discharge during evening/night (positive)
  let bessTargetValue: number | null = null;
  if (hour >= 8 && hour < 16) {
    // Charging during day (negative)
    bessTargetValue = -(Math.random() * 20000 + 5000); // -5000 to -25000 kW
  } else if (hour >= 18 || hour < 6) {
    // Discharging during evening/night (positive) - scaled to ~18000 kW peak
    bessTargetValue = Math.random() * 15000 + 3000; // 3000-18000 kW
  }

  // Smooth BESS power transition
  if (bessTargetValue === null) {
    if (previousState.bessPower === null) {
      state.bessPower = null;
    } else {
      const smoothingFactor = 0.2;
      const smoothedValue = previousState.bessPower * (1 - smoothingFactor);
      state.bessPower = Math.abs(smoothedValue) < 500 ? null : Math.round(smoothedValue);
    }
  } else {
    if (previousState.bessPower === null) {
      state.bessPower = Math.round(bessTargetValue);
    } else {
      const smoothingFactor = 0.15;
      const smoothedValue = previousState.bessPower + (bessTargetValue - previousState.bessPower) * smoothingFactor;
      state.bessPower = Math.round(smoothedValue);
    }
  }

  // Consumption: base load + variations
  const baseConsumption = 10000;
  const consumptionVariation = Math.random() * 3000 - 1500; // ±1500 kW
  state.consumption = Math.round(baseConsumption + consumptionVariation);

  // Grid power calculation:
  // When exporting: gridPower = pvPower + bessPower (discharging)
  // When importing: gridPower = consumption - pvPower - bessPower (to maintain power balance)
  if (
    state.pvPower !== null &&
    state.bessPower !== null &&
    state.consumption !== null
  ) {
    const isDischarging = state.bessPower > 0;
    const pvPlusBattery = state.pvPower + (isDischarging ? state.bessPower : 0);

    // When exporting: gridPower = PV + battery discharge
    // When importing: use power balance: Grid = Consumption - PV - Battery
    let gridPowerCalculated: number;
    if (isDischarging && pvPlusBattery > 0) {
      // Exporting: exported power equals sum of PV and battery discharge
      gridPowerCalculated = pvPlusBattery;
    } else {
      // Importing: use power balance equation
      gridPowerCalculated = state.consumption - state.pvPower - state.bessPower;
    }

    // Smooth grid power transition
    if (previousState.gridPower === null) {
      state.gridPower = Math.round(gridPowerCalculated);
    } else {
      const smoothingFactor = 0.15;
      const smoothedValue = previousState.gridPower + (gridPowerCalculated - previousState.gridPower) * smoothingFactor;
      state.gridPower = Math.round(smoothedValue);
    }
  } else {
    state.gridPower = null;
  }

  return state;
}

export function generateMockPowerData(
  plantId: string,
  from: Date,
  to: Date,
): PVBESSHistoricalPowerData_DTO {
  // Check if the date range is for the current day
  const now = new Date();
  const startOfToday = startOfDay(now);
  const isCurrentDay = isSameDay(from, now) && from.getTime() >= startOfToday.getTime();

  // If it's the current day, cap the 'to' date to the current moment
  if (isCurrentDay && to.getTime() > now.getTime()) {
    to = now;
  }

  const dataPoints: PVBESSHistoricalPowerData_DTO['dataPoints'] = [];
  let current = new Date(from);
  const intervalMs = 1 * 60 * 1000; // 1 minute intervals
  let previousState: PowerDataState = {
    pvPower: null,
    bessPower: null,
    gridPower: null,
    consumption: null,
  };

  while (current < to) {
    const state = generatePowerDataPoint(current, previousState);
    previousState = state;

    dataPoints.push({
      timestamp: current.toISOString(),
      total: {
        pvPower: state.pvPower,
        bessPower: state.bessPower,
        gridPower: state.gridPower,
        consumption: state.consumption,
        chargeableEnergy: null,
        dischargeableEnergy: null,
      },
      subPlant1: {
        pvPower: state.pvPower,
        bessPower: state.bessPower,
        gridPower: state.gridPower,
        consumption: state.consumption,
        chargeableEnergy: null,
        dischargeableEnergy: null,
      },
      subPlant2: {
        pvPower: state.pvPower,
        bessPower: state.bessPower,
        gridPower: state.gridPower,
        consumption: state.consumption,
        chargeableEnergy: null,
        dischargeableEnergy: null,
      },
    });

    current = new Date(current.getTime() + intervalMs);
  }

  return {
    plantId,
    res: '1s',
    agg: 'last',
    timeRange: {
      from: from.toISOString(),
      to: to.toISOString(),
    },
    dataPoints,
  };
}
