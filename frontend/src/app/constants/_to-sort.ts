import { HttpErrorResponse } from '@angular/common/http';

import { SimpleChange } from '@angular/core';
import { SSE_EventName } from './_sse';

/**
 * NOTE
 * Values of DurationUnit are used in HTTP requests as strings
 * in coordination with backend api.
 */
export enum DurationUnit {
  Years = 'years',
  Months = 'months',
  Weeks = 'weeks',
  Days = 'days',
  Hours = 'hours',
  QuaterOfAnHour = 'quarterOfAnHour',
  Minutes = 'minutes',
  Seconds = 'seconds',
}

export const durationUnitLabels: { [key in DurationUnit]: string } = {
  [DurationUnit.Years]: $localize`:@@years:years`,
  [DurationUnit.Months]: $localize`:@@months:months`,
  [DurationUnit.Weeks]: $localize`:@@weeks:weeks`,
  [DurationUnit.Days]: $localize`:@@days:days`,
  [DurationUnit.Hours]: $localize`:@@hours:hours`,
  [DurationUnit.QuaterOfAnHour]: $localize`:@@QuaterOfAnHour:15 min`,
  [DurationUnit.Minutes]: $localize`:@@minutes:minutes`,
  [DurationUnit.Seconds]: $localize`:@@seconds:seconds`,
};

export const durationUnitLabels_NumericalForm_Single: { [key in DurationUnit]: string } = {
  [DurationUnit.Years]: $localize`:@@year:year`,
  [DurationUnit.Months]: $localize`:@@month:month`,
  [DurationUnit.Weeks]: $localize`:@@week:week`,
  [DurationUnit.Days]: $localize`:@@day:day`,
  [DurationUnit.Hours]: $localize`:@@hour:hour`,
  [DurationUnit.QuaterOfAnHour]: $localize`:@@QuaterOfAnHour:15 min`,
  [DurationUnit.Minutes]: $localize`:@@minute:minute`,
  [DurationUnit.Seconds]: $localize`:@@second:second`,
};

// Used for bulgarian language translations (E.g: 2 часа, вместо 2 часове)
export const durationUnitLabels_NumericalForm_Plural: { [key in DurationUnit]: string } = {
  [DurationUnit.Years]: $localize`:@@years-numerical:years`,
  [DurationUnit.Months]: $localize`:@@months-numerical:months`,
  [DurationUnit.Weeks]: $localize`:@@weeks-numerical:weeks`,
  [DurationUnit.Days]: $localize`:@@days-numerical:days`,
  [DurationUnit.Hours]: $localize`:@@hours-numerical:hours`,
  [DurationUnit.QuaterOfAnHour]: $localize`:@@QuaterOfAnHour:15 min`,
  [DurationUnit.Minutes]: $localize`:@@minutes-numerical:minutes`,
  [DurationUnit.Seconds]: $localize`:@@seconds-numerical:seconds`,
};

export enum EnergyPerHourUnit {
  Wh = 'Wh',
  Kwh = 'Kwh',
  Mwh = 'Mwh',
  Gwh = 'Gwh',
  Twh = 'Twh',
  Pwh = 'Pwh',
}

export enum ElectricCurrentUnit {
  A = 'A',
}

export enum VoltageUnit {
  V = 'V',
}

export enum PredefinedTimeRange {
  Last24Hours = '24h',
  Last7Days = '7d',
  Last30Days = '30d',
  Last12Months = '1y',
  RealTime = 'realTime',
}

// Skip the RealTime option by default
export const defaultPrefefinedTimeranges = Object.values(PredefinedTimeRange).slice(0, -1);

export const predefinedTimeRangeStringValues: string[] = Object.values(PredefinedTimeRange);

export const predefinedTimeRangeLabels = {
  [PredefinedTimeRange.Last24Hours]: $localize`24 hours`,
  [PredefinedTimeRange.Last7Days]: $localize`7 days`,
  [PredefinedTimeRange.Last30Days]: $localize`30 days`,
  [PredefinedTimeRange.Last12Months]: $localize`12 months`,
  [PredefinedTimeRange.RealTime]: $localize`Real Time`,
};

export type IntegrationPeriod = DurationUnit;
export const IntegrationPeriod = { ...DurationUnit };
export const integrationPeriodStringValues: string[] = Object.values(IntegrationPeriod);

export interface TypedChange<T> extends SimpleChange {
  previousValue: T;
  currentValue: T;
}

export interface ListMetadata {
  totalCount: number;
}

export interface DataRequest<T> {
  isLoading: boolean;
  data?: T;
  listMetadata?: ListMetadata;
  error?: HttpErrorResponse | Error;
}

export interface SSE_DataRequest<T> extends DataRequest<T> {
  eventName: SSE_EventName | null;
}

export interface DescriptiveError {
  title: string;
  description: string;
}

export interface CustomError {
  title: string;
  error: HttpErrorResponse | Error | string | null;
}

export enum ErrorStackIndexValue {
  NotAvailable = 0,
  Ok = 1,
  Warning = 2,
  Error = 3,
}

export interface CurrentFaults {
  errorStackId: string;
  values: {
    faultId: string;
    errorStackValue: ErrorStackIndexValue;
  }[];
}

export enum DeviceSide {
  Master = 'master',
  Slave = 'slave',
}

export const deviceSideStringValues = <string[]>Object.values(DeviceSide);

export enum DeviceType {
  Solar = 'solar',
  Pump = 'pump',
  Wind = 'wind',
  BatteryString = 'battery',
}

export const deviceTypeStringValues = <string[]>Object.values(DeviceType);

export const chartColors = [
  '#33B4F4', // 0 @blue-5
  '#19456A', // 1 @gray-9
  '#24E0C4', // 2 @aquamarine-5
  '#FFB43B', // 3 @orange-6
  '#9D80BF', // 4 @purple-5
  '#FF7773', // 5 @red-5
  '#45CC86', // 6 @green-5
  '#0093B0', // 7 @cyan-7
  '#FFE200', // 8 @yellow-6
  '#a7d32e', // 9 @green-fresh-6
];

// The original colors for PV plants without BESS
export const semanticColor_Irradiance = chartColors[0]; // '#0093B0'; // chartColors[3]; // Orange
export const semanticColor_ActivePower = chartColors[8]; // Yellow

// Used in PV plants with BESS
export const semanticColor_PVActivePower = '#9d80bf'; // chartColors[8]; // Yellow
export const semanticColor_PVProduction = '#9d80bf'; // @purple-5

export const chartColorsExclude = (exclude: string[]) =>
  chartColors.filter((color) => exclude.indexOf(color) < 0);

export function chartColorWithOpacity(color: string, cssColorAppend: string): string {
  return color + cssColorAppend;
}

export type PowerLimitScheduleStatus = 'draft' | 'enabled' | 'disabled'; // TBD
export const powerLimitScheduleStatusLabels: { [key in PowerLimitScheduleStatus]: string } = {
  ['draft']: $localize`:@@scheduleDraft:draft`,
  ['enabled']: $localize`:@@scheduleEnabled:enabled`,
  ['disabled']: $localize`:@@scheduleDisabled:disabled`,
};

export type PowerScheduleStatus = 'draft' | 'enabled' | 'disabled';
export const powerScheduleStatusLabels: { [key in PowerScheduleStatus]: string } = {
  ['draft']: $localize`:@@scheduleDraft:draft`,
  ['enabled']: $localize`:@@scheduleEnabled:enabled`,
  ['disabled']: $localize`:@@scheduleDisabled:disabled`,
};

// Used to check against when data is coming from backend
export const celsiusDegreeSymbols = ['℃', '°C'];
export const noSpaceUnits = [...celsiusDegreeSymbols, '°F', '°', '%', '‰', ''];

// Used in templates and wherever it needs to be displayed in the UI
export const celsiusDegreeSymbol = '°C';

export const externalControlWarningText = $localize`Power limit is controlled by an external system!`;

// TODO: This is defined in multiple files
export type PositionInTime = 'past' | 'present' | 'future';
