export interface WTPowerDataPointDTO {
  powerValue: number; // kW

  voltage1Value: number; // V
  voltage2Value: number; // V
  voltage3Value: number; // V

  electricCurrent1Value: number; // A
  electricCurrent2Value: number; // A
  electricCurrent3Value: number; // A

  speedGenerator: number; // RPM

  timestamp: string;
}

export interface WTCombinedChartDataPointDTO {
  timestamp: string;
  powerGrid: number;
  speed: number;
  v_LSC_Grid: number;
  i_LSC_Grid: number;
  v1_Line_phase_to_phase: number;
  v2_Line_phase_to_phase: number;
  v3_Line_phase_to_phase: number;
  i_Stator: number;
  v1_MSC: number;
  v2_MSC: number;
  v3_MSC: number;
  i1_MSC: number;
  i2_MSC: number;
  i3_MSC: number;
}

export interface WTPowerDataForDeviceDTO {
  deviceId: string;
  deviceName: string;

  data: WTPowerDataPointDTO[];
}

export interface WTCombinedChartDataForDeviceDTO {
  deviceId: string;
  deviceName: string;

  data: WTCombinedChartDataPointDTO[];
}

export interface WTPowerDataDTO {
  targetDate: string; // ISO timestamp
  deviceIds: string[];

  data: WTPowerDataForDeviceDTO[];
}

export interface WTCombinedChartDataDTO {
  targetDate: string; // ISO timestamp
  deviceIds: string[];

  data: WTCombinedChartDataForDeviceDTO[];
}

// GET /wt-line-side-power?&deviceId=1&deviceId=2&targetDate=2023-07-05T00:00:00.000Z
// GET /wt-generator-side-power?&deviceId=1&deviceId=2&targetDate=2023-07-05T00:00:00.000Z
// GET /wt-combined-chart-data?&deviceId=1&deviceId=2&targetDate=2023-07-05T00:00:00.000Z

// Query params:
// deviceId - one or multiple
// targetDate - ISO timestamp string

// Response:
// Object of type WTPowerDataDTO
