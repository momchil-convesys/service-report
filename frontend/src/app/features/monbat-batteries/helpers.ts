import { MinMax, MonbatBattery, MonbatBatteryString } from './_data/models';

function minMaxTemperature(
  a: MonbatBattery | null,
  b: MonbatBattery | null,
  min: boolean,
): MonbatBattery | null {
  if (a === null && b === null) {
    return null;
  }

  if (a === null || a.temperature === null) {
    return b;
  }

  if (b === null || b.temperature === null) {
    return a;
  }

  if (min) {
    return a.temperature < b.temperature ? a : b;
  }

  return a.temperature > b.temperature ? a : b;
}

function minMaxVoltage(
  a: MonbatBattery | null,
  b: MonbatBattery | null,
  min: boolean,
): MonbatBattery | null {
  if (a === null && b === null) {
    return null;
  }

  if (a === null || a.voltage === null) {
    return b;
  }

  if (b === null || b.voltage === null) {
    return a;
  }

  if (min) {
    return a.voltage < b.voltage ? a : b;
  }

  return a.voltage > b.voltage ? a : b;
}

export function calcMinMax(batteryString: MonbatBatteryString | undefined): MinMax | undefined {
  if (!batteryString) {
    return undefined;
  }

  let minTemperatureBatt: MonbatBattery | null = null;
  let maxTemperatureBatt: MonbatBattery | null = null;

  let minVoltageBatt: MonbatBattery | null = null;
  let maxVoltageBatt: MonbatBattery | null = null;

  batteryString.batteries.forEach((battery) => {
    minTemperatureBatt = minMaxTemperature(battery, minTemperatureBatt, true);
    maxTemperatureBatt = minMaxTemperature(battery, maxTemperatureBatt, false);

    minVoltageBatt = minMaxVoltage(battery, minVoltageBatt, true);
    maxVoltageBatt = minMaxVoltage(battery, maxVoltageBatt, false);
  });

  const result: MinMax = {
    minTemperatureBatt,
    maxTemperatureBatt,
    minVoltageBatt,
    maxVoltageBatt,
  };

  return result;
}
