import { Injectable } from '@angular/core';
import { GridStackWidget } from 'gridstack';
import { GridstackComponent } from 'gridstack/dist/angular';
import { BehaviorSubject, Observable, Subject, map } from 'rxjs';
import { CustomWidgetConfiguratorComponent } from './custom-widget-configurator/custom-widget-configurator.component';

const LOCAL_STORAGE_KEY_CUSTOM_DASHBOARDS = 'cmsCustomDashboardsConfig';

export interface CustomDashboardConfig {
  id: string;
  name: string;
  widgets: GridStackWidget[];
}

@Injectable()
export class CustomDashboardsService {
  deleteWidget$ = new Subject<string>();

  private _dashboards$ = new BehaviorSubject<CustomDashboardConfig[]>([]);

  constructor() {
    GridstackComponent.addComponentToSelectorType([CustomWidgetConfiguratorComponent]);

    this.getCustomDashboards();
  }

  getNewId(): string {
    return new Date().toISOString();
  }

  saveCustomDashboard(dashboard: CustomDashboardConfig) {
    const dashboards = this._dashboards$.getValue();

    let existingDashboardIndex: number = dashboards.findIndex((d) => d.id === dashboard.id);

    if (existingDashboardIndex >= 0) {
      dashboards[existingDashboardIndex] = dashboard;
    } else {
      dashboards.push(dashboard);
    }

    localStorage.setItem(LOCAL_STORAGE_KEY_CUSTOM_DASHBOARDS, JSON.stringify(dashboards));

    this._dashboards$.next(dashboards);
  }

  deleteCustomDashboard(dashboardId: string) {
    const dashboards = this._dashboards$.getValue().filter((d) => d.id !== dashboardId);

    localStorage.setItem(LOCAL_STORAGE_KEY_CUSTOM_DASHBOARDS, JSON.stringify(dashboards));

    this._dashboards$.next(dashboards);
  }

  getCustomDashboards(): Observable<CustomDashboardConfig[]> {
    let result: CustomDashboardConfig[] = [];

    const storedItem = localStorage.getItem(LOCAL_STORAGE_KEY_CUSTOM_DASHBOARDS);

    if (storedItem !== null) {
      result = JSON.parse(storedItem);
    }

    this._dashboards$.next(result);

    return this._dashboards$.asObservable();
  }

  getCustomDashboardById(dashboardId: string): Observable<CustomDashboardConfig | null> {
    return this._dashboards$.pipe(
      map((dashboards) => dashboards.find((dashboard) => dashboard.id === dashboardId) || null),
    );
  }
}
