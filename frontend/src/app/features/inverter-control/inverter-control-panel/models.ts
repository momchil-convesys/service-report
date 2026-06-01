import { Device } from '../../../data/models';

export interface ExtendedDevice extends Device {
  powerLimitSettingMin: number | undefined;
  powerLimitSettingMax: number | undefined;
}
