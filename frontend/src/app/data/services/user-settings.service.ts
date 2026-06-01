import { Injectable } from '@angular/core';
import { UserSettings } from '../models';

const LOCAL_STORAGE_KEY_USER_SETTINGS = 'cmsUserSettings';

const defaultUserSettings: UserSettings = {
  parameterIdsVisibleInDeviceMetricsChartsByPlant: {},
  devicesTreeViewExpandedPlantIds: [],
  sidebarVisible: true,
  powerScheduleManualAdjustmentTableVisible: true,
};

@Injectable({
  providedIn: 'root',
})
export class UserSettingsService {
  private _cache: UserSettings | undefined;

  constructor() {
    this._initialize();
  }

  private _initialize() {
    const settings = this.getCurrentUserSettings();

    if (settings.parameterIdsVisibleInDeviceMetricsChartsByPlant === undefined) {
      settings.parameterIdsVisibleInDeviceMetricsChartsByPlant =
        defaultUserSettings.parameterIdsVisibleInDeviceMetricsChartsByPlant;
    }

    if (settings.devicesTreeViewExpandedPlantIds === undefined) {
      settings.devicesTreeViewExpandedPlantIds =
        defaultUserSettings.devicesTreeViewExpandedPlantIds;
    }

    if (settings.sidebarVisible === undefined) {
      settings.sidebarVisible = defaultUserSettings.sidebarVisible;
    }

    if (settings.powerScheduleManualAdjustmentTableVisible === undefined) {
      settings.powerScheduleManualAdjustmentTableVisible =
        defaultUserSettings.powerScheduleManualAdjustmentTableVisible;
    }

    this._cache = settings;
  }

  getCurrentUserSettings(): UserSettings {
    if (this._cache) {
      return this._cache;
    }

    let result = defaultUserSettings;

    const storedItem = localStorage.getItem(LOCAL_STORAGE_KEY_USER_SETTINGS);
    if (storedItem !== null) {
      result = JSON.parse(storedItem);
    }

    this._cache = result;

    return this._cache;
  }

  updateCurrentUserSettings(settings: Partial<UserSettings>): UserSettings {
    const currentValue = this.getCurrentUserSettings();

    if (settings.parameterIdsVisibleInDeviceMetricsChartsByPlant !== undefined) {
      const plantIds = Object.keys(settings.parameterIdsVisibleInDeviceMetricsChartsByPlant);

      for (let plantId of plantIds) {
        currentValue.parameterIdsVisibleInDeviceMetricsChartsByPlant[plantId] =
          settings.parameterIdsVisibleInDeviceMetricsChartsByPlant[plantId];
      }
    }

    if (settings.devicesTreeViewExpandedPlantIds !== undefined) {
      currentValue.devicesTreeViewExpandedPlantIds = settings.devicesTreeViewExpandedPlantIds;
    }

    if (settings.sidebarVisible !== undefined) {
      currentValue.sidebarVisible = settings.sidebarVisible;
    }

    if (settings.powerScheduleManualAdjustmentTableVisible !== undefined) {
      currentValue.powerScheduleManualAdjustmentTableVisible =
        settings.powerScheduleManualAdjustmentTableVisible;
    }

    localStorage.setItem(LOCAL_STORAGE_KEY_USER_SETTINGS, JSON.stringify(currentValue));

    this._cache = currentValue;

    return currentValue;
  }
}
