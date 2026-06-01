import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { DevicesTreeModule } from '../../shared/devices-tree/devices-tree.module';
import { DeviceComponent } from '../device-page/device.component';
import { DeviceModule } from '../device-page/device.module';
import { NoPlantSelectedComponent } from '../no-plant-selected/no-plant-selected.component';
import { NotAuthorizedComponent } from '../not-authorized/not-authorized.component';
import { NotFoundComponent } from '../not-found/not-found.component';
import { PlantComponent } from '../plant-page/plant.component';
import { PlantModule } from '../plant-page/plant.module';
import { HomeComponent } from './home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      // {
      //   path: 'all',
      //   component: AllPlantsComponent,
      // },
      {
        path: ':plantId/monbat-batteries-module',
        loadChildren: () =>
          import('../../features/monbat-batteries/monbat-batteries.module').then(
            (m) => m.MonbatBatteriesModule,
          ),
      },
      {
        path: ':plantId/devices/:deviceId',
        component: DeviceComponent,
        children: [
          {
            path: 'overview',
            loadChildren: () =>
              import('../device-overview-page/device-overview-page.module').then(
                (m) => m.DeviceOverviewPageModule,
              ),
          },

          {
            path: 'faults',
            loadChildren: () =>
              import('../error-stacks-page/error-stacks-page.module').then(
                (m) => m.ErrorStacksPageModule,
              ),
          },

          {
            path: 'fault-counters',
            loadChildren: () =>
              import('../fault-counters-page/fault-counters-page.module').then(
                (m) => m.FaultCountersPageModule,
              ),
          },

          {
            path: 'inverter-control',
            loadChildren: () =>
              import('../../features/inverter-control/inverter-control.module').then(
                (m) => m.InverterControlModule,
              ),
          },

          {
            path: 'device-metrics',
            loadChildren: () =>
              import('../../features/device-metrics/device-metrics-page.module').then(
                (m) => m.DeviceMetricsPageModule,
              ),
          },

          {
            path: 'drilldown',
            loadChildren: () =>
              import('../../features/drilldown/drilldown.routes').then((m) => m.ROUTES),
          },

          {
            path: 'strings',
            loadChildren: () =>
              import('../../features/monbat-batteries/monbat-batteries.module').then(
                (m) => m.MonbatBatteriesModule,
              ),
          },

          {
            path: 'monbat-schedule',
            loadChildren: () =>
              import('../../features/monbat-batteries-schedule/monbat-schedule-page.module').then(
                (m) => m.MonbatSchedulePageModule,
              ),
          },

          {
            path: 'power-limit-schedule',
            loadChildren: () =>
              import('../../features/power-limit-schedule/power-limit-schedule-page.module').then(
                (m) => m.PowerLimitSchedulePageModule,
              ),
          },

          {
            path: 'temperature-sensors',
            loadComponent: () =>
              import(
                '../../features/inverter-temperature-sensors/inverter-temperature-sensors-page/inverter-temperature-sensors-page.component'
              ).then((m) => m.InverterTemperatureSensorsPageComponent),
          },

          // {
          //   path: 'alarms',
          //   loadComponent: () =>
          //     import('../../features/alarms/alarms-page/alarms-page.component').then(
          //       (m) => m.AlarmsPageComponent
          //     ),
          // },

          {
            path: '',
            redirectTo: 'overview',
            pathMatch: 'full',
          },
        ],
      },
      {
        path: ':plantId',
        component: PlantComponent,
        children: [
          {
            path: 'pv-bess-overview',
            loadChildren: () =>
              import(
                '../../features/client-dashboard-pv-bess/client-dashboard-pv-bess.module'
              ).then((m) => m.ClientDashboardPvBessModule),
          },

          {
            path: 'bess/:bessId',
            loadChildren: () => import('../../features/bess/bess.module').then((m) => m.BessModule),
          },

          {
            path: 'overview',
            loadChildren: () =>
              import('../plant-overview-page/plant-overview-page.module').then(
                (m) => m.PlantOverviewPageModule,
              ),
          },

          {
            path: 'reactive-power',
            loadChildren: () =>
              import('../../features/reactive-power/reactive-power.module').then(
                (m) => m.ReactivePowerModule,
              ),
          },

          {
            path: 'plant-metrics',
            loadChildren: () =>
              import('../../features/extended-plant-metrics/extended-plant-metrics.module').then(
                (m) => m.ExtendedPlantMetricsModule,
              ),
          },

          {
            path: 'device-metrics',
            loadChildren: () =>
              import('../../features/device-metrics/device-metrics-page.module').then(
                (m) => m.DeviceMetricsPageModule,
              ),
          },

          {
            path: 'drilldown',
            loadChildren: () =>
              import('../../features/drilldown/drilldown.routes').then((m) => m.ROUTES),
          },

          {
            path: 'faults',
            loadChildren: () =>
              import('../error-stacks-page/error-stacks-page.module').then(
                (m) => m.ErrorStacksPageModule,
              ),
          },

          {
            path: 'inverter-control',
            loadChildren: () =>
              import('../../features/inverter-control/inverter-control.module').then(
                (m) => m.InverterControlModule,
              ),
          },

          {
            path: 'monbat-schedule',
            loadChildren: () =>
              import('../../features/monbat-batteries-schedule/monbat-schedule-page.module').then(
                (m) => m.MonbatSchedulePageModule,
              ),
          },

          {
            path: 'power-limit-schedule',
            loadChildren: () =>
              import('../../features/power-limit-schedule/power-limit-schedule-page.module').then(
                (m) => m.PowerLimitSchedulePageModule,
              ),
          },

          {
            path: 'power-schedule',
            loadChildren: () =>
              import('../../features/power-schedule/power-schedule-page.module').then(
                (m) => m.PowerSchedulePageModule,
              ),
          },

          // {
          //   path: 'grid-export-schedule',
          //   loadChildren: () =>
          //     import('../../features/grid-export-schedule/grid-export-schedule.module').then(
          //       (m) => m.GridExportSchedulePageModule
          //     ),
          // },

          // {
          //   path: 'weather',
          //   loadChildren: () =>
          //     import('../../features/weather/weather.module').then((m) => m.WeatherModule),
          // },

          {
            path: '',
            loadComponent: () =>
              import('../plant-default-redirect/plant-default-redirect.component').then(
                (m) => m.PlantDefaultRedirectComponent,
              ),
          },

          { path: '404', component: NotFoundComponent },
          { path: '403', component: NotAuthorizedComponent },
        ],
      },
      {
        path: '',
        component: NoPlantSelectedComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    DevicesTreeModule,
    NzSpaceModule,
    NzSpinModule,
    NzResultModule,
    NzButtonModule,
    NzDrawerModule,
    PlantModule,
    DeviceModule,
  ],
})
export class HomeModule {}
