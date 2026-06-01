/**
 * Describes the current control state of the system.
 * Whether it is controlled by a daily schedule,
 * manual schedule adjustments,
 * manual control or external system control.
 */
export interface CurrentControlStateDTO {
  id: string;
  timestamp: string; // information is actual as of this timestamp

  // What was requested by the user
  requestedSetpoints: {
    pvPower: number | null; // in kW (upper limit / target)
    bessPower: number | null; // in kW (positive/negative = discharge/charge or vice versa)
    mode?: any; // TBD: enum with priority modes
  };

  // What is actually applied to the system by the controller
  appliedSetpoints: {
    pvPower: number | null; // in kW (upper limit / target)
    bessPower: number | null; // in kW (positive/negative = discharge/charge or vice versa)
    mode?: any; // TBD: enum with priority modes
  };

  // What was measured by the system
  measured: {
    timestamp: string; // TBD: time of measurement?
    pvPower: number | null; // in kW
    bessPower: number | null; // in kW (positive/negative = discharge/charge or vice versa)
  };

  // What mechanism is currently controlling the system
  // and specific details about the mechanism
  controlMechanism:
    | {
        type: 'DailySchedule';

        scheduleId: string; // enabled PowerScheduleDTO id
        interval: {
          start: string; // ISO timestamp
          end: string; // ISO timestamp
        };
      }
    | {
        type: 'ManualScheduleAdjustment';

        scheduleId: string; // base enabled PowerScheduleDTO id
        interval: {
          start: string; // ISO timestamp
          end: string; // ISO timestamp
        };

        userDisplayName: string; // user display name - who made the adjustment
        timestamp: string; // ISO timestamp - when the adjustment was made

        originalSetpoints: {
          pvPower: number | null; // in kW (upper limit / target)
          bessPower: number | null; // in kW (positive/negative = discharge/charge or vice versa)
        };
      }
    | {
        type: 'ManualControl';

        userDisplayName: string; // user display name - who made the request
        timestamp: string; // ISO timestamp - when the specific setpoints were requested
      }
    | {
        type: 'ExternalSystemControl';

        timestamp: string; // ISO timestamp - when the external control started
      };
}
