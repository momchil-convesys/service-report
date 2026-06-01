import { PowerScheduleStatus } from './power-schedule.dto';

interface Interval {
  start: Date;
  end: Date;
}

export interface PowerScheduleParsedTableRow {
  interval: Interval;
  zonedInterval: Interval;

  pvPowerSetpoint: number | null; // in kW (upper limit / target)
  pvPowerSetpointAdjusted: number | null; // in kW (adjusted for plant-specific coefficient)

  bessPowerSetpoint: number | null; // in kW (positive/negative = discharge/charge or vice versa)
  bessPowerSetpointAdjusted: number | null; // in kW (adjusted for plant-specific coefficient)

  pvEnergyEquivalent: number | null; // in kWh
  bessEnergyEquivalent: number | null; // in kWh

  // Grid power calculations based on PV and BESS setpoints
  gridPowerSetpoint: number | null; // Sum of original PV + BESS setpoints (null if either is null)
  gridExportEnergyEquivalent: number | null;
  gridImportEnergyEquivalent: number | null;

  mode?: any; // TBD: enum with priority modes
}

export interface PowerScheduleHistoryItem {
  statusChangedTo: PowerScheduleStatus;
  byUserDisplayName: string | null | undefined;
  timestamp: string;
}

export interface PowerSchedule {
  id: string; // Unique identifier across all schedules

  plantId: string;

  /**
   * The time interval during which this schedule is applicable
   */
  applicableRange: {
    from: string; // Start of first interval
    to: string; // End of last interval
  };

  /**
   * Uploaded file information
   */
  file: {
    name: string; // E.g: PowerSchedule_ForDate.xlsx
    url: string; // URL to download the uploaded file
    uploadedTimestamp: string;
    uploadedByUserDisplayName: string | null | undefined;
  };

  parsedScheduleTable: PowerScheduleParsedTableRow[];

  status: PowerScheduleStatus;

  statusHistory: PowerScheduleHistoryItem[];

  // Populated at frontend

  plantTimeZone: string | undefined;
  coefficientForPvPowerSetpoint: number | null;
  coefficientForBessPowerSetpoint: number | null;
}
