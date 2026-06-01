import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { permissionGuard } from '../../auth/auth.guard';
import { AccessControlPermission } from '../../constants';

import { NotImplementedComponent } from '../../shared/not-implemented/not-implemented.component';
import { ExtendedPlantMetricsApiService } from './_data/api.service';
import { ExtendedPlantMetricsDataService } from './_data/data.service';
import { EpmTabContentComponent } from './epm-tab-content/epm-tab-content.component';
import { ExtendedPlantMetricsComponent } from './extended-plant-metrics.component';

const routes: Routes = [
  {
    path: '',
    component: ExtendedPlantMetricsComponent,

    canActivate: [permissionGuard],
    canActivateChild: [permissionGuard],

    data: {
      permissions: [AccessControlPermission.ExtendedPlantMetrics_View],
    },

    children: [
      {
        path: 'transformer-stations',
        component: NotImplementedComponent,
      },
      {
        path: 'weather',
        loadChildren: () =>
          import('../../features/weather/weather.module').then((m) => m.WeatherModule),
      },
      {
        path: ':level',
        component: EpmTabContentComponent,
      },
      {
        path: '',
        redirectTo: 'weather',
        pathMatch: 'full',
      },
    ],

    providers: [ExtendedPlantMetricsApiService, ExtendedPlantMetricsDataService],
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes), ExtendedPlantMetricsComponent],
  exports: [RouterModule],
})
export class ExtendedPlantMetricsModule {}
