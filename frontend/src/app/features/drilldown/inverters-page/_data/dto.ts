import { DeviceState, ExtendedDeviceState } from '../../../../constants';
import { AlarmSeverity } from '../../alarms-page/_data/dto';

/**
 * Realtime data - updated via SSE
 *
 * TODO (Backend)
 *
 * GET /devices/{deviceId}/transformer-station-metrics
 *        & sse = true
 *
 * Response: Object of type TransformerStation_Metrics_DTO
 *
 * GET /plant/{plantId}/transformer-station-metrics
 *
 * Response: Array of objects of type TransformerStation_Metrics_DTO[]
 */

export interface TransformerStation_Metrics_DTO {
  // or just id
  deviceId: string; // transformer station ID

  plantId: string;

  /**
   * This array will be updated via sse:
   *
   * SSE DATA_INIT (the first message) should should contain
   * all the requested data - a point for each inverter.
   *
   * SSE DATA_PATCH will contain a subset of points corresponding
   * to the inverters with new data.
   *
   * SSE DATA_REPLACE replaces the whole array,
   * but most probably this will not be used,
   * as each inverter data is updated independently.
   */
  inverterMetricsDataPoints: Array<InverterMetrics_DataPoint_DTO>;
}

export interface InverterMetrics_DataPoint_DTO {
  // or just id
  inverterId: string;

  deviceId: string; // transformer station ID
  plantId: string;

  timestamp: string; // time of measurement

  activePower: number | null;
  installedCapacity: number | null;

  performanceRatio: number | null;

  reactivePower: number | null;

  accumulatedEnergy: number | null;
  accumulatedEnergyForDay: number | null;

  state: DeviceState | null;
  intermediateStateCode: number | null;
  alarms: Array<InverterAlarm_DTO> | undefined | null;

  // TODO: will be fetched in a separate request
  stringsData: Array<InverterStringMetrics_DataPoint_DTO> | null;

  // Populated at front end

  timestampZoned: Date;
  extendedState: ExtendedDeviceState | null;
  extendedStateForTooltip: ExtendedDeviceState | null;
}

export interface InverterStringMetrics_DataPoint_DTO {
  // or just id
  stringId: string;

  voltage: number | null;
  electricCurrent: number | null;
}

export interface InverterAlarm_DTO {
  id: string;

  alarmConfigId: string;

  severity: AlarmSeverity;

  /**
   * Title of the alarm.
   */
  title: string;

  /**
   * Timestamp of the alarm. Time of occurrence.
   */
  timestamp: string;

  //Populated at front end

  timestampZoned: Date;
}
