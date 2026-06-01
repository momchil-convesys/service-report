import { PowerLimitScheduleStatus } from '../../../../constants';

export interface PVProductionDataDTO {
  from: string;
  to: string;

  deviceIds: string[];
  integrationPeriod: string; //  'hours' | 'days' | 'months'

  totalProduction: null | number; // Total production for selected period
  totalProductionPM: null | number; // Total production from Power Meter

  /**
   * SSE Specifics
   *      Any of the arrays could be empty
   *      if there is nothing to patch or append.
   */

  /**
   * Each point represents PV production for a specified duration (integrationPeriod).
   *
   * For plants WITH power meters
   *      timestamp denotes the END of this period.
   *      [timestamp minus integrationPeriod .................... timestamp]
   *
   * For plants WITHOUT power meters
   *      timestamp denotes the BEGINNING of the period.
   *      [timestamp ..................... integrationPeriod plus timestamp]
   *
   * SSE Specifics:
   *      Could be empty if nothing to patch here
   *
   */
  productionDataPoints: Array<{
    timestamp: string;

    value: null | number;
    valuePM: null | number;
  }>;

  //----------------------------------------------------------------------------

  /**
   * The following properties are only applicable
   * if intergation period is one hour or less.
   * Otherwise are set to null;
   */

  /**
   * Each point represents the target power limit according to the uploaded schedule file.
   *
   * SSE Specifics:
   *      Could be empty if nothing to patch here
   */
  targetPowerLimitData?: null | Array<{
    targetPowerLimit: undefined | null | number; // MWh
    originalTargetPowerLimit: undefined | null | number; // MWh (as provided in the file, without adjustment)

    interval: {
      from: string;
      to: string;
    };

    fileRefId: string;

    scheduleStatus: PowerLimitScheduleStatus;
  }>;

  /**
   * Each point represents a change in schedule status (enable / disable).
   *
   * SSE Specifics:
   *      Could be empty if nothing to patch here
   *
   *      This collection is only APPENDED E.g: when file status is changed (enabled/disabled).
   *      There is no use case for PATCH here.
   */
  scheduleStatusHistory?: null | Array<{
    timestamp: string;

    statusChangedTo: PowerLimitScheduleStatus;
    by: string;

    fileRefId: string;
  }>;

  /**
   * Array of intervals when the system or part of it was controlled by an external system.
   *
   * SSE Specifics:
   *      Could be empty if nothing to patch here
   *
   *      This collection is only APPENDED E.g: when the external control flag changes.
   *      There is no use case for PATCH here.
   *
   * This corresponds to "EXTERNAL LIMIT" in the backend.
   */
  controlledByExternalSystemHistory?: null | Array<{
    timestamp: string;

    controlledByExternalSystem: boolean;
  }>;

  /**
   * Array of intervals when the system was controlled manually
   * via the extra panel on plant overview page.
   *
   * SSE Specifics:
   *      Could be empty if nothing to patch here
   *
   *      This collection is only APPENDED E.g: when the controlled manually flag changes.
   *      There is no use case for PATCH here.
   *
   * This corresponds to "EXTERNAL TARGET" in the backend.
   */
  controlledManuallyHistory?: null | Array<{
    timestamp: string;

    controlledManually: boolean;
    byUserDisplayName: string | null; // null if controlledManually = false
  }>;
}
