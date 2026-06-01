export type MonbatPowerLimitScheduleStatus = 'draft' | 'enabled' | 'disabled'; // TBD
export const monbatPowerLimitScheduleStatusLabels: {
  [key in MonbatPowerLimitScheduleStatus]: string;
} = {
  ['draft']: $localize`:@@scheduleDraft:draft`,
  ['enabled']: $localize`:@@scheduleEnabled:enabled`,
  ['disabled']: $localize`:@@scheduleDisabled:disabled`,
};
