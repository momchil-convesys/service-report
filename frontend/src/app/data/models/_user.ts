import { AccessControlPermission } from '../../constants';

export interface User {
  id: string;
  email: string;
  displayName: string;
  permissions: (AccessControlPermission | string)[];
  relatedPlantIds: string[];
}

export interface UserSettings {
  devicesTreeViewExpandedPlantIds: string[];

  parameterIdsVisibleInDeviceMetricsChartsByPlant: {
    [plantId: string]: string[];
  };

  sidebarVisible: boolean;

  powerScheduleManualAdjustmentTableVisible: boolean;
}
