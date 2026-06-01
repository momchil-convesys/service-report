import { Routes } from '@angular/router';
import { permissionGuard } from '../../auth/auth.guard';
import { AccessControlPermission } from '../../constants';
import { ActiveAlarmsComponent } from './alarms-page/active-alarms/active-alarms.component';
import { AlarmDetailPageComponent } from './alarms-page/alarm-detail-page/alarm-detail-page.component';
import { AlarmsHistoryComponent } from './alarms-page/alarms-history/alarms-history.component';
import { DrilldownPageComponent } from './drilldown-page.component';

export const ROUTES: Routes = [
  {
    path: '',
    component: DrilldownPageComponent,

    canActivate: [permissionGuard],
    canActivateChild: [permissionGuard],
    data: {
      permissions: [AccessControlPermission.InverterMetrics_View],
    },

    children: [
      {
        path: 'inverters',
        loadChildren: () => import('./inverters-page/inverters.routes').then((m) => m.ROUTES),
      },

      {
        path: 'active-alarms',
        component: ActiveAlarmsComponent,
        children: [
          {
            path: ':alarmId',
            component: AlarmDetailPageComponent,
          },
        ],
      },

      {
        path: 'alarms',
        component: AlarmsHistoryComponent,
        children: [
          {
            path: ':alarmId',
            component: AlarmDetailPageComponent,
          },
        ],
      },

      {
        path: '',
        redirectTo: 'inverters',
        pathMatch: 'full',
      },
    ],
  },
];
