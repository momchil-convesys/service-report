import { User } from '../../../data/models';

export type InverterControlRequestType =
  | 'start-inverter'
  | 'stop-inverter'
  | 'limit-inverter-power';

export type InverterControlCommandStatus = 'pending' | 'completed' | 'failed';

export const inverterControlCommandStatusLabels: { [key in InverterControlCommandStatus]: string } =
  {
    ['pending']: $localize`:@@inverterControlCommandStatusPending:pending`,
    ['completed']: $localize`:@@inverterControlCommandStatusCompleted:completed`,
    ['failed']: $localize`:@@inverterControlCommandStatusFailed:failed`,
  };

/**
 * Extend current device model
 *
 * interface Device {
 *    ...
 *    // Note: null instead of undefined, as the property is not optional.
 *    powerLimit: PowerLimitDetails | null;
 * }
 */

// Object of this type will be send in the body of a PUT request.
export interface InverterControlRequestBody {
  // List of device ids
  affectedDevices: string[];

  // Relevant for type 'limit-power'
  // If undefined => not relevant
  // If null => discard current active power limit
  // If number => apply active power limit
  powerLimitValue: number | null | undefined;

  passcode: string;
}

/**
 * PUT /inverter-control/limit-power (limit-power as a command, not power-limit)
 *
 * Request Body: Object of type InverterControlRequestBody
 *
 * Response: OK or Error
 */

/**
 * PUT /inverter-control/start
 *
 * Request Body: Object of type InverterControlRequestBody
 *
 * Response: OK or Error
 */

/**
 * PUT /inverter-control/stop
 *
 * Request Body: Object of type InverterControlRequestBody
 *
 * Response: OK or Error
 */

// TBD: multiple Authorization headers
// TBD: type: 'start-inverter' | 'stop-inverter' | 'limit-power'
//      can be used in request body, but dedicated requests
//      are more explicit and preferred for this kind of operation

/** ---------------------------------------------------------------------------
 *  History
 */

export interface InverterControlCommand {
  deviceId: string;
  status: InverterControlCommandStatus;

  // time of sending the command to GW
  // or undefined if command is still pending
  timestamp?: string | undefined;
}

export interface InverterControlRequest {
  // ID of the event
  id: string;

  // time of receiving the request
  timestamp: string;

  user: User;

  type: InverterControlRequestType;

  commandsStatus: InverterControlCommand[];

  // Relevant for type 'limit-power'
  // If undefined => not relevant
  // If null => discard current active power limit
  // If number => apply active power limit
  powerLimitValue?: number | null | undefined;
}

/**
 * GET /inverter-control?deviceId=1&deviceId=2...
 *
 * Response: Array of type InverterControlRequest
 *    sorted by timestamp
 *    filtered by deviceId
 *
 * TBD: limit by type (E.g: only power limit events)
 */
