/**
 * PowerScheduleDTO refers to a power schedule file uploaded by the user.
 *
 * This is a variation of the power limit schedule specifically designed
 * for plants with BESS.
 */

export interface PowerScheduleDTO {
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

  parsedScheduleTable: Array<{
    interval: {
      start: string; // E.g: 10:15
      end: string; // E.g: 10:30
    };

    pvPowerSetpoint: number | null; // in kW (upper limit / target)
    bessPowerSetpoint: number | null; // in kW (positive/negative = discharge/charge or vice versa)

    mode?: any; // TBD: enum with priority modes
  }>;

  /**
   * Current status of the schedule
   */
  status: 'draft' | 'enabled' | 'disabled';

  /**
   * History of status changes
   */
  statusHistory: Array<{
    statusChangedTo: 'draft' | 'enabled' | 'disabled';
    byUserDisplayName: string | null | undefined;
    timestamp: string;
  }>;
}

export type PowerScheduleStatus = 'draft' | 'enabled' | 'disabled';

/**
 * Enable / disable schedule request DTO
 */
export interface PowerScheduleToggleStatusDTO {
  status: PowerScheduleStatus;
  passcode: string;
}
