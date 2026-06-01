export * from './_charts-common-helpers';
export * from './_charts-data-labels';
export * from './_charts-data-max';
export * from './_charts-tooltip-positioner';
export * from './_charts-y-axis';
export * from './_data-export-filename';
export * from './_error-handling';
export * from './_form-controls-mark-dirty';
export * from './_integration-period.helpers';
export * from './_intl-number-format';
export * from './_pls-link';
export * from './_save-file';
export * from './_time-range.helpers';
export * from './_time-zone-convertions';
export * from './_unit-spacing-format';
export * from './_value-format';
export * from './_values-scaling';

export function randomIntFromInterval(min: number, max: number) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function nullOrNumber(value: number | null | undefined): number | null {
  if (value === undefined) {
    return null;
  }

  return value;
}

export function undefinedOrNumber(value: number | null | undefined): number | undefined {
  if (value === null) {
    return undefined;
  }

  return value;
}

export function nullOrBoolean(value: boolean | null | undefined): boolean | null {
  if (value === undefined) {
    return null;
  }

  return value;
}

export function isEmptyArray(array: undefined | null | any[]): boolean {
  if (!array) {
    return true;
  }

  return array.length === 0;
}

export function isString(object: any): boolean {
  return typeof object === 'string' || object instanceof String;
}

export function isNumber(object: any): boolean {
  return typeof object === 'number' || object instanceof Number;
}

export function nullOrNumberFromString(value: string | number | null | undefined): number | null {
  if (value === undefined || value === null) {
    return null;
  }

  return Number(value);
}
