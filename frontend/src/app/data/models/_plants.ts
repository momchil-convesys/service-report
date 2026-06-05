import { BehaviorSubject } from 'rxjs';
import { ActivePowerLimitSchedule } from 'src/app/features/power-limit-schedule/_data/active-schedule';
import { PowerLimitDetails } from '.';
import { CurrentFaults, DeviceType, ExtendedDeviceState } from '../../constants';
import { MonbatActiveSchedule } from '../../features/monbat-batteries-schedule/_data/dto';
import { SystemSetupType } from '../../features/system-control/constants';
import { DeviceSpecificMetadata } from '../dtos';
import { DeviceMetadata } from './_device-metadata';

export interface Device {
  id: string;
  name: string;
  plantId: string;
  deviceMetadataId: string; // Predefined templates
  type: DeviceType;
  assetType?: string;
  serialNumber?: string | null;
  installedPowerKw?: string | null;

  state: ExtendedDeviceState;
  stateSubject: BehaviorSubject<ExtendedDeviceState>;

  currentFaults: CurrentFaults | undefined;
  currentFaultsSubject: BehaviorSubject<CurrentFaults | undefined>;

  powerLimit: PowerLimitDetails | null;
  powerLimitSubject: BehaviorSubject<PowerLimitDetails | null>;

  deviceSpecificMetadata: DeviceSpecificMetadata;

  monbatActiveSchedule?: null | MonbatActiveSchedule;
  monbatActiveScheduleSubject?: BehaviorSubject<null | MonbatActiveSchedule>;

  // TODO:
  // the following properties are filled from a service,
  // because the adapter concept is incomplete
  metadata?: DeviceMetadata;
  plantName?: string;
}

export interface Plant {
  id: string;
  name: string;

  type: DeviceType;
  assetType?: string;
  country: string | null | undefined;
  installedPowerMwp?: string | null;
  timeZone: string | undefined; // IANA Time Zone

  deviceIds: string[];
  devices: Device[];
  relatedClients?: {
    id: string;
    name: string;
    address: string;
  }[];

  activePowerLimitSchedule$: BehaviorSubject<null | ActivePowerLimitSchedule>;
  activeBESSSchedule$: BehaviorSubject<null | ActivePowerLimitSchedule>;

  plantSpecificMetadata: null | {
    hasPowerMeter: boolean;
    maxPowerLimitTreshold: number | undefined;
    hasExtendedPlantMetrics: boolean;
    powerLimitTargetCoefficient: number | undefined;
    powerLimitType: 'power' | 'energy';
    scheduleIntegrationPeriodMinutes: number; // 60 or 15
    hasTsWithInverters: boolean;
    hasOnSiteSetup: boolean;
    thisSetup: SystemSetupType | null;
    hasFaultsTab?: boolean;
    bessId?: string | null;
    bessSetpointTargetCoefficient?: number | null;

    // Flag to enable parameter grouping by name for device metrics
    shouldUseParameterGroupingByName?: boolean;
  };
}

export interface DeviceTreeItem {
  plantId: string;
  deviceId?: string;
  deviceType?: DeviceType;
  openInNewTab?: boolean;
}
