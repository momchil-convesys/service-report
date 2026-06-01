import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { permissionGuard } from '../../auth/auth.guard';
import { AccessControlPermission } from '../../constants';
import { BessPageComponent } from './bess-page/bess-page.component';

export const ROUTES: Routes = [
  {
    path: '',
    component: BessPageComponent,

    canActivate: [permissionGuard],
    canActivateChild: [permissionGuard],
    data: {
      permissions: [AccessControlPermission.ThirdEye],
    },

    children: [
      {
        path: 'bess-overview',
        loadComponent: () =>
          import('./bess-overview-page/bess-overview-page.component').then(
            (m) => m.BessOverviewPageComponent,
          ),
      },
      {
        path: 'bess-live-metrics',
        loadComponent: () =>
          import('./bess-live-metrics/bess-live-metrics.component').then(
            (m) => m.BessLiveMetricsComponent,
          ),
      },
      {
        path: 'bess-assets',
        loadComponent: () =>
          import('./bess-assets-page/bess-assets-page.component').then(
            (m) => m.BessAssetsPageComponent,
          ),
      },
      {
        path: 'bess-parameters',
        loadComponent: () =>
          import('./bess-parameters-page/bess-parameters-page.component').then(
            (m) => m.BessParametersPageComponent,
          ),
      },
      {
        path: 'bess-tree',
        loadComponent: () =>
          import('./bess-tree/bess-tree.component').then((m) => m.BessTreeComponent),
      },
      { path: '', redirectTo: 'bess-overview', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(ROUTES)],
})
export class BessModule {}
