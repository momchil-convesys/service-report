import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { UserLinkComponent } from 'src/app/shared/user-link/user-link.component';
import { permissionGuard } from '../../auth/auth.guard';
import { AccessControlPermission } from '../../constants';
import { DatetimeRangeSelectComponent } from '../../shared/datetime-range-select/datetime-range-select.component';
import { RelativeTimestampComponent } from '../../shared/relative-timestamp/relative-timestamp.component';
import { GesActivityComponent } from './activity/ges-activity.component';
import { GesPreviewChartComponent } from './charts/preview-chart/ges-preview-chart.component';
import { GesDetailPageComponent } from './detail-page/ges-detail-page.component';
import { ToggleGesButtonComponent } from './detail-page/toggle-button/toggle-ges-button.component';
import { GridExportSchedulePageComponent } from './grid-export-schedule-page.component';
import { GesHistoryListLoaderComponent } from './history-list/ges-history-list-loader.component';
import { GesHistoryListComponent } from './history-list/ges-history-list.component';
import { GesPreviewTableComponent } from './preview-table/ges-preview-table.component';
import { GesSettingsPageComponent } from './settings-page/ges-settings-page.component';
import { GesStatusComponent } from './status/ges-status.component';

const routes: Routes = [
  {
    path: '',
    component: GridExportSchedulePageComponent,

    canActivate: [permissionGuard],
    canActivateChild: [permissionGuard],
    data: {
      permissions: [AccessControlPermission.GridExportSchedule_View],
    },

    children: [
      {
        path: 'settings',
        component: GesSettingsPageComponent,

        canActivate: [permissionGuard],
        canActivateChild: [permissionGuard],
        data: {
          permissions: [AccessControlPermission.GridExportSchedule_Manage],
        },
      },

      {
        path: ':scheduleId',
        component: GesDetailPageComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [
    GridExportSchedulePageComponent,
    GesHistoryListComponent,
    GesHistoryListLoaderComponent,
    GesStatusComponent,
    GesPreviewTableComponent,
    GesPreviewChartComponent,
    ToggleGesButtonComponent,
    GesDetailPageComponent,
    GesActivityComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NzTableModule,
    NzUploadModule,
    NzButtonModule,
    NzIconModule,
    NzDividerModule,
    NzSpinModule,
    NzPaginationModule,
    RelativeTimestampComponent,
    NzAlertModule,
    NzTooltipModule,
    NzTimelineModule,
    NzEmptyModule,
    NzCollapseModule,
    UserLinkComponent,
    DatetimeRangeSelectComponent,
    NzSwitchModule,
  ],
  exports: [],
  providers: [],
})
export class GridExportSchedulePageModule {}
