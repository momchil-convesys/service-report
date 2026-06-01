import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GridstackModule } from 'gridstack/dist/angular';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { CustomDashboardLoaderComponent } from './custom-dashboard-loader/custom-dashboard-loader.component';
import { CustomDashboardComponent } from './custom-dashboard/custom-dashboard.component';
import { CustomDashboardsComponent } from './custom-dashboards.component';
import { CustomDashboardsService } from './custom-dashboards.service';
import { CustomWidgetConfiguratorComponent } from './custom-widget-configurator/custom-widget-configurator.component';
import { CustomDashboardsSideNavComponent } from './side-nav/custom-dashboards-side-nav.component';
import { WidgetPageComponent } from './widget-page/widget-page.component';

const routes: Routes = [
  {
    path: '',
    component: CustomDashboardsComponent,
    children: [
      {
        path: 'widgets/:widgetId',
        component: WidgetPageComponent,
      },
      {
        path: ':dashboardId',
        component: CustomDashboardLoaderComponent,
      },
      // { path: '', pathMatch: 'full', redirectTo: 'new' },
    ],
  },
];

@NgModule({
  declarations: [
    CustomDashboardsComponent,
    CustomDashboardComponent,
    CustomWidgetConfiguratorComponent,
    CustomDashboardsSideNavComponent,
    WidgetPageComponent,
    CustomDashboardLoaderComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    GridstackModule,
    NzButtonModule,
    NzCardModule,
    NzDividerModule,
    NzIconModule,
    NzTooltipModule,
    NzMenuModule,
  ],
  providers: [CustomDashboardsService],
})
export class CustomDashboardsModule {}
