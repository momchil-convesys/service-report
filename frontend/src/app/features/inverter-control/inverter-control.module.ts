import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { permissionGuard } from '../../auth/auth.guard';
import { AccessControlPermission } from '../../constants';
import { DeviceLinkModule } from '../../shared/device-link/device-link.module';
import { DeviceStateDynamicComponent } from '../../shared/device-state-dynamic/device-state-dynamic.component';
import { PageRoutingService } from '../../shared/page-routing.service';
import { InverterPowerLimitIndicatorComponent } from '../../shared/power-limit/inverter-power-limit-indicator/inverter-power-limit-indicator.component';
import { RelativeTimestampComponent } from '../../shared/relative-timestamp/relative-timestamp.component';
import { SystemSetupBannerComponent } from '../system-control/system-setup-banner/system-setup-banner.component';
import { InverterControlApiService } from './_data/api.service';
import { InverterControlService } from './_data/inverter-control.service';
import { InverterControlHistoryComponent } from './inverter-control-history/inverter-control-history.component';
import { InverterControlLatestActivityComponent } from './inverter-control-latest-activity/inverter-control-latest-activity.component';
import { InverterControlPageComponent } from './inverter-control-page/inverter-control-page.component';
import { InverterControlFormComponent } from './inverter-control-panel/inverter-control-modal/inverter-control-form/inverter-control-form.component';
import { InverterControlModalComponent } from './inverter-control-panel/inverter-control-modal/inverter-control-modal.component';
import { InverterControlPanelComponent } from './inverter-control-panel/inverter-control-panel.component';
import { InverterControlCommandsStatusComponent } from './inverter-control-request-item/inverter-control-commands-status/inverter-control-commands-status.component';
import { InverterControlRequestItemComponent } from './inverter-control-request-item/inverter-control-request-item.component';

const routes: Routes = [
  {
    path: '',
    component: InverterControlPageComponent,

    canActivate: [permissionGuard],
    canActivateChild: [permissionGuard],
    data: {
      permissions: [AccessControlPermission.InverterControl_Manage],
    },

    children: [
      {
        path: 'control-panel',
        component: InverterControlPanelComponent,
      },
      {
        path: 'history',
        component: InverterControlHistoryComponent,
      },
      {
        path: '',
        redirectTo: 'control-panel',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  declarations: [
    InverterControlPageComponent,
    InverterControlRequestItemComponent,
    InverterControlHistoryComponent,
    InverterControlPanelComponent,
    InverterControlModalComponent,
    InverterControlCommandsStatusComponent,
    InverterControlLatestActivityComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    InverterControlFormComponent,
    RelativeTimestampComponent,
    NzButtonModule,
    NzTableModule,
    NzDividerModule,
    NzIconModule,
    NzPaginationModule,
    NzSpinModule,
    NzAlertModule,
    NzModalModule,
    NzRadioModule,
    NzInputModule,
    NzResultModule,
    NzEmptyModule,
    InverterPowerLimitIndicatorComponent,
    DeviceStateDynamicComponent,
    DeviceLinkModule,
    SystemSetupBannerComponent,
  ],
  providers: [InverterControlApiService, InverterControlService, PageRoutingService],
})
export class InverterControlModule {}
