/**
 
Energy distribution (energy flow) can be controlled using the following mechanisms, 
listed from lowest to highest priority:

  1. Daily Schedule
  Energy flow is controlled according to a daily schedule 
  provided via an uploaded .xlsx file.
  
  2. Manual Schedule Adjustment
  Energy flow is controlled by manual modifications 
  applied to future time intervals of an active daily schedule.
  
  3. Manual Control
  Energy flow is controlled manually via a dedicated control interface. 
  Manual control works independently of schedules and time-based intervals.

  4. External System Control
  Energy flow is controlled by an external system interfaced with the system.

When multiple control mechanisms are active, 
the system applies the one with the highest priority. 
Therefore, external system control overrides manual control, 
which overrides manual schedule adjustments, 
which in turn override the daily schedule from the active .xlsx file.
 
*/

export type ControlMechanismDTO =
  | 'DailySchedule'
  | 'ManualScheduleAdjustment'
  | 'ManualControl'
  | 'ExternalSystemControl';
