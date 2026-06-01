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
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { PowerLimitScheduleIndicatorComponent } from 'src/app/shared/power-limit/power-limit-schedule-indicator/power-limit-schedule-indicator.component';
import { UserLinkComponent } from 'src/app/shared/user-link/user-link.component';
import { permissionGuard } from '../../auth/auth.guard';
import { AccessControlPermission } from '../../constants';
import { CustomAlertComponent } from '../../shared/custom-alert/custom-alert.component';
import { DatetimeRangeSelectComponent } from '../../shared/datetime-range-select/datetime-range-select.component';
import { PageRoutingService } from '../../shared/page-routing.service';
import { PowerLimitIconComponent } from '../../shared/power-limit/power-limit-icon/power-limit-icon.component';
import { RelativeTimestampComponent } from '../../shared/relative-timestamp/relative-timestamp.component';
import { MonbatActivityComponent } from './monbat-activity/monbat-activity.component';
import { MonbatDetailPageComponent } from './monbat-detail-page/monbat-detail-page.component';
import { MonbatToggleButtonComponent } from './monbat-detail-page/monbat-toggle-button/monbat-toggle-button.component';
import { MonbatFileUploadComponent } from './monbat-file-upload/monbat-file-upload.component';
import { MonbatHistoryListLoaderComponent } from './monbat-history-list-loader/monbat-history-list-loader.component';
import { MonbatHistoryListComponent } from './monbat-history-list/monbat-history-list.component';
import { MonbatPreviewTableComponent } from './monbat-preview-table/monbat-preview-table.component';
import { MonbatSchedulePageComponent } from './monbat-schedule-page.component';
import { MonbatStatusComponent } from './monbat-status/monbat-status.component';

const routes: Routes = [
  {
    path: '',
    component: MonbatSchedulePageComponent,
    canActivate: [permissionGuard],
    canActivateChild: [permissionGuard],
    data: {
      permissions: [AccessControlPermission.PowerLimitSchedule_View],
    },
    children: [{ path: ':scheduleId', component: MonbatDetailPageComponent }],
  },
];

@NgModule({
  declarations: [
    MonbatPreviewTableComponent,
    MonbatHistoryListComponent,
    MonbatStatusComponent,
    MonbatFileUploadComponent,
    MonbatHistoryListLoaderComponent,
    MonbatDetailPageComponent,
    MonbatActivityComponent,
    MonbatToggleButtonComponent,
    MonbatSchedulePageComponent,
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
    CustomAlertComponent,
  ],
  exports: [RouterModule],
  providers: [PageRoutingService, NzModalService],
})
export class MonbatSchedulePageModule {}
