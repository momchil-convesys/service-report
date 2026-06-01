export type AlarmSeverity = 'major' | 'warning' | 'minor' | 'info';

export const ALARM_SEVERITY_ORDER = ['major', 'warning', 'minor', 'info'] as const;

export interface InverterAlarmHistoricalItem_DTO {
  /**
   * Unique identifier for the alarm configuration.
   * Alarm config ID
   */
  id: string;

  /**
   * Severity of the alarm.
   */
  severity: AlarmSeverity;

  /**
   * Short title of the alarm.
   */
  title: string;

  /**
   * Suggestion to the user how to resolve the alarm.
   */
  suggestion: string;

  /**
   * List of occurrences in time.
   * List can contain multiple occurrences for the same inverter when historical data is fetched.
   * For active alarms, the list contains only one occurrence per inverter.
   */
  inverterEvents: Array<{
    inverterId: string;
    tsId: string;

    interval: {
      start: string;
      end: string | null;
    };

    // Populated at front end

    intervalZoned: {
      start: Date;
      end: Date | null;
    };
  }>;
}
