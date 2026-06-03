import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { environment } from '../environments/environment';
import { CustomPreloadingStrategy } from './app-custom-preload-strategy';
import { loginGuard } from './auth/auth.guard';
import { permissionGuard } from './auth/auth.guard';
import { AccessControlPermission } from './constants';
import { NotAuthorizedComponent } from './pages/not-authorized/not-authorized.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () => import('./app-content.component').then((m) => m.AppContentComponent),
    children: [
      {
        path: 'service-reports',
        loadChildren: () =>
          import('./features/service-reports/service-reports.module').then(
            (m) => m.ServiceReportsModule,
          ),
        canActivate: [loginGuard],
        canActivateChild: [loginGuard],
      },
      {
        path: 'admin/assets',
        loadComponent: () =>
          import('./pages/admin-assets/admin-assets.component').then(
            (m) => m.AdminAssetsComponent,
          ),
        canActivate: [loginGuard, permissionGuard],
        data: { permissions: [AccessControlPermission.Admin_Manage] },
      },
      {
        path: 'admin/clients',
        loadComponent: () =>
          import('./pages/admin-clients/admin-clients.component').then(
            (m) => m.AdminClientsComponent,
          ),
        canActivate: [loginGuard, permissionGuard],
        data: { permissions: [AccessControlPermission.Admin_Manage] },
      },
      { path: '', pathMatch: 'full', redirectTo: '/service-reports/mock-plant-1' },
      { path: '404', component: NotFoundComponent },
      { path: '403', component: NotAuthorizedComponent },
      { path: '**', redirectTo: '/service-reports/mock-plant-1' },
    ],
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      paramsInheritanceStrategy: 'always',
      preloadingStrategy: CustomPreloadingStrategy,
      ...(environment.electron ? { useHash: true } : {}),
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
