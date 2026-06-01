import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { permissionGuard } from '../../auth/auth.guard';
import { AccessControlPermission } from '../../constants';
import { CustomAlertComponent } from '../../shared/custom-alert/custom-alert.component';
import { DatetimeRangeSelectComponent } from '../../shared/datetime-range-select/datetime-range-select.component';
import { HighchartsExportOptionComponent } from '../../shared/highcharts-export-option/highcharts-export-option.component';
import { NavUpComponent } from '../../shared/nav-up/nav-up.component';
import { PageRoutingService } from '../../shared/page-routing.service';
import { PlsEquivalentIconComponent } from '../../shared/power-limit/pls-equivalent-icon/pls-equivalent-icon.component';
import { RelativeTimestampComponent } from '../../shared/relative-timestamp/relative-timestamp.component';
import { ValueDisplayComponent } from '../../shared/value-display/value-display.component';
import { PowerScheduleGridPreviewChartComponent } from './charts/power-schedule-grid-preview-chart/power-schedule-grid-preview-chart.component';
import { PowerSchedulePreviewChartComponent } from './charts/power-schedule-preview-chart/power-schedule-preview-chart.component';
import { PowerScheduleActivityComponent } from './power-schedule-activity/power-schedule-activity.component';
import { PowerScheduleDetailPageComponent } from './power-schedule-detail-page/power-schedule-detail-page.component';
import { TogglePowerScheduleButtonComponent } from './power-schedule-detail-page/toggle-power-schedule-button/toggle-power-schedule-button.component';
import { PowerScheduleFileUploadComponent } from './power-schedule-file-upload/power-schedule-file-upload.component';
import { PowerScheduleHistoryListLoaderComponent } from './power-schedule-history-list-loader/power-schedule-history-list-loader.component';
import { PowerScheduleHistoryListComponent } from './power-schedule-history-list/power-schedule-history-list.component';
import { PowerScheduleManualAdjustmentTableComponent } from './power-schedule-manual-adjustment/power-schedule-manual-adjustment-table/power-schedule-manual-adjustment-table.component';
import { PowerScheduleManualAdjustmentComponent } from './power-schedule-manual-adjustment/power-schedule-manual-adjustment.component';
import { PowerScheduleTrackingChartBESSComponent } from './power-schedule-manual-adjustment/power-schedule-tracking-chart/power-schedule-tracking-chart-bess.component';
import { PowerScheduleTrackingChartPVComponent } from './power-schedule-manual-adjustment/power-schedule-tracking-chart/power-schedule-tracking-chart-pv.component';
import { PowerSchedulePageComponent } from './power-schedule-page.component';
import { PowerSchedulePreviewTableComponent } from './power-schedule-preview-table/power-schedule-preview-table.component';
import { PowerSchedulePriorityModesListComponent } from './power-schedule-priority-modes-list/power-schedule-priority-modes-list.component';
import { PowerScheduleSetpointValueComponent } from './power-schedule-setpoint-value/power-schedule-setpoint-value.component';
import { PowerScheduleStatusComponent } from './power-schedule-status/power-schedule-status.component';

const routes: Routes = [
  {
    path: '',
    component: PowerSchedulePageComponent,
    canActivate: [permissionGuard],
    canActivateChild: [permissionGuard],
    data: {
      permissions: [AccessControlPermission.PowerSchedule_View],
    },

    children: [
      {
        path: 'manual-adjust',
        component: PowerScheduleManualAdjustmentComponent,
        canActivate: [permissionGuard],
        canActivateChild: [permissionGuard],
        // Part of this module is used on the master dashboard page,
        // so we need to allow access to it for all users with view permission.
        // data: {
        //   permissions: [AccessControlPermission.PowerSchedule_Manage],
        // },
      },
      {
        path: 'priority-modes',
        component: PowerSchedulePriorityModesListComponent,
        canActivate: [permissionGuard],
        canActivateChild: [permissionGuard],
      },
      { path: ':scheduleId', component: PowerScheduleDetailPageComponent },
    ],
  },
];

@NgModule({
  declarations: [
    PowerSchedulePageComponent,
    PowerScheduleHistoryListComponent,
    PowerScheduleHistoryListLoaderComponent,
    PowerScheduleStatusComponent,
    PowerSchedulePreviewTableComponent,
    PowerSchedulePreviewChartComponent,
    PowerScheduleGridPreviewChartComponent,
    PowerScheduleDetailPageComponent,
    PowerScheduleActivityComponent,
    PowerScheduleFileUploadComponent,
    PowerSchedulePriorityModesListComponent,
    TogglePowerScheduleButtonComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    NzButtonModule,
    NzIconModule,
    NzDividerModule,
    NzSpinModule,
    NzEmptyModule,
    NzTableModule,
    NzTagModule,
    NzCollapseModule,
    NzTimelineModule,
    NzUploadModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzRadioModule,
    NzAlertModule,
    NzResultModule,
    NzSelectModule,
    NzPaginationModule,
    NzTooltipModule,
    PowerScheduleManualAdjustmentTableComponent,
    RelativeTimestampComponent,
    CustomAlertComponent,
    NavUpComponent,
    PowerScheduleSetpointValueComponent,
    ValueDisplayComponent,
    PlsEquivalentIconComponent,
    DatetimeRangeSelectComponent,
    HighchartsExportOptionComponent,
    PowerScheduleTrackingChartPVComponent,
    PowerScheduleTrackingChartBESSComponent,
  ],
  exports: [RouterModule],
  providers: [PageRoutingService, NzModalService],
})
export class PowerSchedulePageModule {}
