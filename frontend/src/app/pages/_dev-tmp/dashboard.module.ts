import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { InverterControlFormTestComponent } from 'src/app/features/inverter-control/inverter-control-panel/inverter-control-modal/inverter-control-form-test/inverter-control-form-test.component';
import { PowerLimitScheduleIndicatorTestComponent } from 'src/app/shared/power-limit/power-limit-schedule-indicator-test/power-limit-schedule-indicator-test.component';
import { PlsManualAdjustmentComponent } from '../../features/power-limit-schedule/pls-manual-adjustment/pls-manual-adjustment.component';
import { DatetimeRangeSelectTestComponent } from '../../shared/datetime-range-select/datetime-range-select-test/datetime-range-select-test.component';
import { StateVariantsComponent } from '../../shared/device-state/state-variants/state-variants.component';
import { DashboardComponent } from './dashboard.component';
import { PercentageSummaryTestComponent } from './test-components/percentage-summary-test.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: 'percentage-summary',
        component: PercentageSummaryTestComponent,
      },
      {
        path: 'state-variants',
        component: StateVariantsComponent,
      },
      {
        path: 'datetime-range',
        component: DatetimeRangeSelectTestComponent,
      },
      {
        path: 'inverter-control',
        component: InverterControlFormTestComponent,
      },
      {
        path: 'power-limit-schedule',
        component: PowerLimitScheduleIndicatorTestComponent,
      },
      {
        path: 'pls-manual-adjustment/:plantId',
        component: PlsManualAdjustmentComponent,
      },
      {
        path: 'weather/:plantId',
        loadChildren: () =>
          import('../../features/weather/weather.module').then((m) => m.WeatherModule),
      },
      {
        path: 'custom-data-views',
        loadChildren: () =>
          import('../../features/custom-data-views/custom-data-views.module').then(
            (m) => m.CustomDataViewsModule,
          ),
      },
      {
        path: 'custom-dashboards',
        loadChildren: () =>
          import('../../features/custom-dashboards/custom-dashboards.module').then(
            (m) => m.CustomDashboardsModule,
          ),
      },
      {
        path: 'plant-topology',
        loadChildren: () =>
          import('../../features/plant-topology/plant-topology.module').then(
            (m) => m.PlantTopologyModule,
          ),
      },
      {
        path: 'wind-widgets',
        loadComponent: () =>
          import('../../shared/wind-widgets/wind-widgets-page/wind-widgets-page.component').then(
            (m) => m.WindWidgetsPageComponent,
          ),
      },
      {
        path: 'power-limit-manual-control',
        loadComponent: () =>
          import('../../features/aratiden-specific-control/control-limit-widget.component').then(
            (m) => m.ControlLimitWidgetComponent,
          ),
      },
      {
        path: 'bess/:bessId',
        loadChildren: () => import('../../features/bess/bess.module').then((m) => m.BessModule),
      },
      { path: '', pathMatch: 'full', redirectTo: 'bess/PLACE_BESS_ID_HERE' },
    ],
  },
];

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NzCardModule,
    NzLayoutModule,
    NzMenuModule,
  ],
})
export class DashboardModule {}
