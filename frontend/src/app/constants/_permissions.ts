export enum AccessControlPermission {
  AlarmTriggers_Manage = 'alarm-triggers:manage',

  InverterControl_Manage = 'inverter-control:manage',

  PowerLimitSchedule_View = 'power-limit-schedule:view',
  PowerLimitSchedule_Edit = 'power-limit-schedule:edit', // enable/disable
  PowerLimitSchedule_Upload = 'power-limit-schedule:upload', // upload new schedule
  PowerLimitSchedule_Adjust = 'power-limit-schedule:adjust', // manual adjustments

  // We are currently reusing the power limit schedule permissions for the power schedule,
  // but we should create separate permissions for the power schedule in the future.
  PowerSchedule_View = 'power-limit-schedule:view',
  PowerSchedule_Edit = 'power-limit-schedule:edit',
  PowerSchedule_Upload = 'power-limit-schedule:upload',
  PowerSchedule_Adjust = 'power-limit-schedule:adjust',

  GridExportSchedule_View = 'grid-export-schedule:view',
  GridExportSchedule_Manage = 'grid-export-schedule:manage', // enable/disable schedule, change settings

  ServiceReports_View = 'service-reports:view',
  ServiceReports_Manage = 'service-reports:manage', // create, edit, delete (could be separated if needed)
  ServiceReports_Delete = 'service-reports:delete',

  ReactivePower_View = 'reactive-power:view',

  ExtendedPlantMetrics_View = 'extended-plant-metrics:view',

  InverterMetrics_View = 'inverter-metrics:view',

  Alarms_View = 'alarms:view',

  // ExtendedDetails_View_ActivePowerFromGW = 'extended-details:view:active-power-from-gw',

  ThirdEye = 'third-eye',
}

export type AccessControlPermissionValue = `${AccessControlPermission}`;
