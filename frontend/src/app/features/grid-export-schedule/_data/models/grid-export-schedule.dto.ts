import { User_DTO } from '../../../../data/dtos';

/**
 * A data record represents a table row (typically for one hour)
 * plus related events that happened in this interval.
 */
export interface GridExportSchedule_DataRecord_DTO {
  interval: {
    from: string;
    to: string;
  };

  ibex: {
    priceMWh: number;
    volumeMWh: number;
  };

  // positionInTime: 'past' | 'current' | 'upcoming';

  /**
   * The target of this schedule record.
   */
  objective: {
    /**
     * Minimum price setting at the time being (for past records)
     * or current setting for records in the future.
     */
    minPriceToEnableExport: number;

    /**
     * Calculated based on ibex price and settings at the time being
     */
    exportToGrid: boolean;
  };

  events: Array<{
    timestamp: string;
    freeText: string;

    // Type and details:
    // E.g:
    //    Schedule was disabled
    //    Device was not responding
    //    Device failed to observe schedule
    //    Schedule OK
    //    Settings changed (if we decide to allow preconfiguring of current objective)
  }>;
}

export interface GridExportSchedule_ForDay_DTO {
  id: string;

  plantId: string;

  applicableInterval: {
    from: string; // start of day
    to: string; // end of day
  };

  // positionInTime: 'past' | 'current' | 'upcoming';

  scheduleUploaded: {
    timestamp: string;

    by: User_DTO;
  };

  /**
   * Status of daily schedule.
   * If Settings -> autoenable is ON
   *      then new schedules will be 'enabled' by default.
   * If Settings -> autoenable is OFF
   *      then new schedules will be with status 'draft' by default.
   */
  status: 'draft' | 'enabled' | 'disabled';

  statusHistory: Array<{
    timestamp: string;

    statusChangedTo: 'draft' | 'enabled' | 'disabled';

    by: User_DTO;
  }>;

  dataRecords: Array<GridExportSchedule_DataRecord_DTO>;
}
