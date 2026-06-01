import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { PlsActivityComponent } from 'src/app/features/power-limit-schedule/pls-activity/pls-activity.component';
import { PowerLimitScheduleIndicatorComponent } from 'src/app/shared/power-limit/power-limit-schedule-indicator/power-limit-schedule-indicator.component';
import { UserLinkComponent } from 'src/app/shared/user-link/user-link.component';
import { permissionGuard } from '../../auth/auth.guard';
import { AccessControlPermission } from '../../constants';
import { CustomAlertComponent } from '../../shared/custom-alert/custom-alert.component';
import { DatetimeRangeSelectComponent } from '../../shared/datetime-range-select/datetime-range-select.component';
import { PageRoutingService } from '../../shared/page-routing.service';
import { PlsEquivalentIconComponent } from '../../shared/power-limit/pls-equivalent-icon/pls-equivalent-icon.component';
import { PlsValueFormattedComponent } from '../../shared/power-limit/pls-value-formatted/pls-value-formatted.component';
import { PowerLimitIconComponent } from '../../shared/power-limit/power-limit-icon/power-limit-icon.component';
import { RelativeTimestampComponent } from '../../shared/relative-timestamp/relative-timestamp.component';
import { SystemSetupBannerComponent } from '../system-control/system-setup-banner/system-setup-banner.component';
import { PlsActiveScheduleChartComponent } from './charts/pls-active-schedule-chart/pls-active-schedule-chart.component';
import { PlsPreviewChartComponent } from './charts/pls-preview-chart/pls-preview-chart.component';
import { PlsActiveSchedulePageComponent } from './pls-active-schedule-page/pls-active-schedule-page.component';
import { PlsDetailPageComponent } from './pls-detail-page/pls-detail-page.component';
import { TogglePlsButtonComponent } from './pls-detail-page/toggle-pls-button/toggle-pls-button.component';
import { PlsFileUploadComponent } from './pls-file-upload/pls-file-upload.component';
import { PlsHistoryListLoaderComponent } from './pls-history-list-loader/pls-history-list-loader.component';
import { PlsHistoryListComponent } from './pls-history-list/pls-history-list.component';
import { PlsManualAdjustmentComponent } from './pls-manual-adjustment/pls-manual-adjustment.component';
import { PlsPreviewTableComponent } from './pls-preview-table/pls-preview-table.component';
import { PlsStatusComponent } from './pls-status/pls-status.component';
import { PowerLimitSchedulePageComponent } from './power-limit-schedule-page.component';

const routes: Routes = [
  {
    path: '',
    component: PowerLimitSchedulePageComponent,

    canActivate: [permissionGuard],
    canActivateChild: [permissionGuard],
    data: {
      permissions: [AccessControlPermission.PowerLimitSchedule_View],
    },

    children: [
      { path: 'active-schedule', component: PlsActiveSchedulePageComponent },

      {
        path: 'manual-adjust',
        component: PlsManualAdjustmentComponent,

        canActivate: [permissionGuard],
        canActivateChild: [permissionGuard],
        data: {
          permissions: [AccessControlPermission.PowerLimitSchedule_Adjust],
        },
      },

      // { path: 'history', component: PlsHistoricalDataPageComponent },
      { path: ':scheduleId', component: PlsDetailPageComponent },
    ],
  },
];

@NgModule({
  declarations: [
    PowerLimitSchedulePageComponent,
    PlsPreviewTableComponent,
    PlsHistoryListComponent,
    PlsDetailPageComponent,
    PlsStatusComponent,
    PlsFileUploadComponent,
    PlsHistoryListLoaderComponent,
    PlsPreviewChartComponent,
    PlsActivityComponent,
    PlsActiveSchedulePageComponent,
    TogglePlsButtonComponent,
    PlsActiveScheduleChartComponent,
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
    NzCollapseModule,
    NzEmptyModule,
    UserLinkComponent,
    PowerLimitScheduleIndicatorComponent,
    PowerLimitIconComponent,
    DatetimeRangeSelectComponent,
    PlsValueFormattedComponent,
    PlsManualAdjustmentComponent,
    PlsEquivalentIconComponent,
    SystemSetupBannerComponent,
    CustomAlertComponent,
    NzResultModule,
  ],
  exports: [RouterModule],
  providers: [PageRoutingService, NzModalService],
})
export class PowerLimitSchedulePageModule {}
