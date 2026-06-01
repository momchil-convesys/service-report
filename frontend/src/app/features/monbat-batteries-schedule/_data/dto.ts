import { MonbatPowerLimitScheduleStatus } from './constants';

/**
 * MonbatPowerLimitScheduleDTO refers to an uploaded schedule file.
 */

export interface MonbatPowerLimitScheduleDTO {
  id: string; // Unique accross all schedules (one-to-one relation with the uploaded file)

  plantId: string;
  deviceId: string;

  file: {
    name: string;
    url: string; // URL to download the uploaded file // Or ID
    uploadedTimestamp: string;
    uploadedByUserDisplayName: string | null | undefined;
  };

  /**
   * [
   *    {
   *      id: "A",
   *      title: "From",
   *      semanticColor: null or undefined
   *    },
   *
   *    ...
   *
   *    {
   *      id: "E",
   *      title: "Discharging_permitted",
   *      semanticColor: 'discharge'
   *    }
   * ]
   */
  scheduleTableColumns: Array<{
    id: string; // E.g: "A", "B", "C", as in excel file
    title: string;
    semanticColor?: 'charge' | 'discharge' | null;
  }>;

  /**
   * [
   *    Array starts from the first data row (excluding headers).
   *    ["00:00", "01:00", "1", "", "1" ....],
   *    ["", ""]
   * ]
   *
   */
  parsedScheduleTable: Array<Array<string>>;

  status: MonbatPowerLimitScheduleStatus;

  statusHistory: Array<{
    statusChangedTo: MonbatPowerLimitScheduleStatus;
    byUserDisplayName: string | null | undefined;
    timestamp: string;
  }>;
}

/**
 * Enable / disable schedule
 */
export interface MonbatPowerLimitScheduleToggleStatusDTO {
  status: MonbatPowerLimitScheduleStatus;
  passcode: string;
}

/**
 * Schedule feedback updated over web socket.
 */

export interface MonbatActiveSchedule {
  fileRefId: null | string;
}

export interface WsTopicMessage_MonbatActiveScheduleDTO {
  plantId: string;
  deviceId: string;

  /**
   * null if no active schedule schedule
   */
  activeSchedule: null | MonbatActiveSchedule;
}
