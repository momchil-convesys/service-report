//------------------------------------------------------------------------------------
// Plants

import { CurrentFaults } from '../../constants';
import { MonbatActiveSchedule } from '../../features/monbat-batteries-schedule/_data/dto';
import { ActivePowerLimitScheduleDTO } from '../../features/power-limit-schedule/_data/active-schedule';
import { SystemSetupType } from '../../features/system-control/constants';
import { PowerLimitDetails } from '../models';
import { DeviceSpecificMetadata } from './_device-specific-metadata.dto';

export interface DeviceDTO {
  id: string;
  name: string; // Display name (preferably only a number from 1 to <devices count>)
  plantId: string;

  /**
   * Generic mapping of known stable states.
   * 'on'
   * 'wrn'  // warning
   * 'err'  // error / fault
   * 'off'  // off
   * 'nc'   // no communication
   * 'srvc' // service mode
   * 'stb'  // standby
   * 'int'  // intermediate
   */
  state: string;
  intermediateStateCode: number | null; // Should be provided if state == 'int'

  deviceMetadataId: string; // Predefined templates
  type?: string; // 'solar' | 'pump' | 'wind' | 'battery'
  currentFaults?: CurrentFaults | null;
  serialNumber?: string;

  powerLimit: PowerLimitDetails | null;

  deviceSpecificMetadata: DeviceSpecificMetadata | undefined;

  monbatActiveSchedule?: null | MonbatActiveSchedule;
}

export interface PlantDTO {
  id: string;
  name: string; // Display name

  type: string; // 'solar' | 'pump' | 'wind'
  country: string | null | undefined;
  timeZone: string | undefined;

  deviceIds: string[];
  devices?: DeviceDTO[]; // List of devices (if requested)

  relatedClients?: any;

  activePowerLimitSchedule: null | ActivePowerLimitScheduleDTO;
  activeBESSSchedule?: null | ActivePowerLimitScheduleDTO;

  plantSpecificMetadata: null | {
    hasPowerMeter?: boolean;
    maxPowerLimitTreshold?: number | null;

    // Decide whether to show extended metrics in plant reactive power tab
    hasExtendedPlantMetrics?: boolean;

    // Used to adjust power limit target
    powerLimitTargetCoefficient?: number | null;

    // If values are provided in MW or MWh
    powerLimitType?: 'power' | 'energy';

    // Whether schedules are provided in 15 min or 1 hour intervals
    scheduleIntegrationPeriodMinutes?: number | null; // 60 or 15

    // Decide whether to show inverters tab
    hasTsWithInverters?: boolean;

    // Wether the plant can be managed via locally installed offline copy of the system
    hasOnSiteSetup?: boolean;

    // Wether THIS system instance is on site or in the cloud (depending on a property in the data base?)
    thisSetup?: SystemSetupType | null;

    // Wether the faults tab (and fault counters tab) should be shown
    hasFaultsTab?: boolean;

    // Wether the plant has a BESS and if so, the ID of the BESS
    bessId?: string | null;

    // Used to adjust bess setpoint target (to compensate for losses)
    bessSetpointTargetCoefficient?: number | null;
  };
}

// Used over web sockets
export interface DeviceStateChange {
  device: DeviceDTO;
  timestamp: Date;
}
