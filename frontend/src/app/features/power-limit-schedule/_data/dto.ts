import { PowerLimitScheduleStatus } from '../../../constants';

/**
 * PowerLimitScheduleDTO refers to an uploaded schedule file.
 *
 * Enabling a schedule will result in a command to the master gateway
 * to start limiting the power of a plant according to the provided records.
 * Multiple files can be enabled, preferably with no overlapping hours.
 *
 * Enabling and disabling schedules will alter the final schedule,
 * but a status "enabled" does not guarantee that the schedule is actually
 * applied to the gateway.
 *
 * More truthful information (the actual schedule that will be followed)
 * is represented in ActivePowerLimitScheduleDTO model.
 */

export interface PowerLimitScheduleDTO {
  id: string; // Unique accross all schedules (one-to-one relation with the uploaded file)

  plantId: string;

  applicableInterval: {
    timestampWithTimezoneStart: string;
    timestampWithTimezoneEnd: string;
  };

  file: {
    name: string; // E.g: Forecast_SDN_09.06.2023.xlsx
    url: string; // URL to download the uploaded file // Or ID
    uploadedTimestamp: string;
    uploadedByUserDisplayName: string | null | undefined;
  };

  /**
   * Uploaded file contents parsed.
   * Will be used to preview/visualize parsed .xls file
   * as understood and interpeted by backend logic.
   */
  parsedScheduleTable: Array<{
    targetPowerLimit: null | number; // null if No limit or value in MW/MWh

    interval: {
      from: string; // E.g: 10:15
      to: string; // E.g: 10:30 (NOTE: NOT 10:29.999)
    };
  }>;

  status: PowerLimitScheduleStatus;

  statusHistory: Array<{
    statusChangedTo: PowerLimitScheduleStatus;
    byUserDisplayName: string | null | undefined;
    timestamp: string;
  }>;

  // If values are provided in MW or MWh
  powerLimitType?: 'power' | 'energy';

  // Whether the target limit is provided in 15 min or 1 hour intervals
  integrationPeriodMinutes?: number; // 60 or 15
}

/**
 * Enable / disable schedule
 */
export interface PowerLimitScheduleToggleStatusDTO {
  status: PowerLimitScheduleStatus;
  passcode: string;
}

//------------------------------------------------------------------------------

/**
 * Data received from master gateway in response to activated power limit schedule.
 * Included in PVPlantEssentialMetrics model (to be visualized in active power live chart).
 */

export interface MasterGwScheduledPowerLimitDataPoint {
  timestamp: string;

  requestedPowerLimit: number;
  requestedPowerLimitSet: number | null;
  reportedPowerLimit: number | null;

  // This flag has priority when deciding if power is actually limited
  // or is set to the a maximum value (unlimited).
  hasEffectivePowerLimit?: null | boolean;

  // If true, the limit is controlled by an external system
  // This corresponds to "EXTERNAL LIMIT" in the backend.
  controlledByExternalSystem?: boolean;

  // If true, the limit is controlled manually by user
  // This corresponds to "EXTERNAL TARGET" in the backend.
  controlledManually?: boolean;
}

export interface MasterGwScheduledPowerLimitDataPoint_ForDevice
  extends MasterGwScheduledPowerLimitDataPoint {
  deviceId: string;
}

export interface MasterGwScheduledPowerLimitDataPoint_ForPlant
  extends MasterGwScheduledPowerLimitDataPoint {
  plantId: string;
}
