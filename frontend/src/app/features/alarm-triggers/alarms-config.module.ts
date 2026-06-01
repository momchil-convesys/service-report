import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { permissionGuard } from '../../auth/auth.guard';
import { AccessControlPermission } from '../../constants';
import { AlarmTypeComponent } from '../../shared/alarm-type/alarm-type.component';
import { DeviceLinkModule } from '../../shared/device-link/device-link.module';
import { DeviceSelectModule } from '../../shared/device-select/device-select.module';
import { DeviceStateModule } from '../../shared/device-state/device-state.module';
import { FaultsSelectModule } from '../../shared/faults-select/faults-select.module';
import { FilterByAlarmTypeComponent } from '../../shared/filter-by-alarm-type/filter-by-alarm-type.component';
import { RelativeTimestampComponent } from '../../shared/relative-timestamp/relative-timestamp.component';
import { AlarmTriggerAffectedDevicesComponent } from './alarm-trigger-affected-devices/alarm-trigger-affected-devices.component';
import { AlarmTriggerConditionPreviewComponent } from './alarm-trigger-condition-preview/alarm-trigger-condition-preview.component';
import { AlarmConfigConditionDeviceStateChangeComponent } from './alarm-trigger-conditions/alarm-config-condition-device-state-change/alarm-config-condition-device-state-change.component';
import { AlarmsConfigConditionFaultOccurenceComponent } from './alarm-trigger-conditions/alarms-config-condition-fault-occurence/alarms-config-condition-fault-occurence.component';
import { AlarmsConfigConditionParameterBoundariesComponent } from './alarm-trigger-conditions/alarms-config-condition-parameter-boundaries/alarms-config-condition-parameter-boundaries.component';
import { AlarmTriggerDeleteActionComponent } from './alarm-trigger-delete-action/alarm-trigger-delete-action.component';
import { AlarmsConfigDetailComponent } from './alarm-trigger-detail/alarms-config-detail.component';
import { AlarmConfigFormComponent } from './alarm-trigger-form/alarm-config-form.component';
import { DeviceMetadataDisplayComponent } from './alarm-trigger-form/device-metadata-display/device-metadata-display.component';
import { DeviceMetadataSelectComponent } from './alarm-trigger-form/device-metadata-select/device-metadata-select.component';
import { AlarmTriggerNotifyUsersSelectComponent } from './alarm-trigger-notify-users-select/alarm-trigger-notify-users-select.component';
import { AlarmTriggerViewComponent } from './alarm-trigger-view/alarm-trigger-view.component';
import { AlarmsConfigComponent } from './alarms-config.component';
import { CastPipe } from './cast.pipe';

const routes: Routes = [
  {
    path: '',
    component: AlarmsConfigComponent,
    children: [
      {
        path: 'new',
        component: AlarmsConfigDetailComponent,
      },
      {
        path: ':triggerType/:triggerId',
        component: AlarmsConfigDetailComponent,
      },
    ],
    canActivate: [permissionGuard],
    canActivateChild: [permissionGuard],
    data: { permissions: [AccessControlPermission.AlarmTriggers_Manage] },
  },
];

@NgModule({
  declarations: [
    AlarmsConfigComponent,
    AlarmsConfigDetailComponent,
    AlarmsConfigConditionParameterBoundariesComponent,
    AlarmsConfigConditionFaultOccurenceComponent,
    CastPipe,
    AlarmConfigConditionDeviceStateChangeComponent,
    DeviceMetadataSelectComponent,
    DeviceMetadataDisplayComponent,
    AlarmConfigFormComponent,
    AlarmTriggerAffectedDevicesComponent,
    AlarmTriggerViewComponent,
    AlarmTriggerConditionPreviewComponent,
    AlarmTriggerNotifyUsersSelectComponent,
    AlarmTriggerDeleteActionComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    NzRadioModule,
    NzDividerModule,
    NzButtonModule,
    NzTableModule,
    NzDrawerModule,
    NzTagModule,
    NzAlertModule,
    NzButtonModule,
    NzIconModule,
    NzInputNumberModule,
    NzInputModule,
    NzListModule,
    NzEmptyModule,
    NzSelectModule,
    NzPaginationModule,
    NzFormModule,
    DeviceSelectModule,
    FaultsSelectModule,
    NzSpinModule,
    NzSwitchModule,
    DeviceStateModule,
    AlarmTypeComponent,
    DeviceLinkModule,
    RelativeTimestampComponent,
    NzDescriptionsModule,
    FilterByAlarmTypeComponent,
    NzCheckboxModule,
    NzPopoverModule,
    NzModalModule,
    NzSkeletonModule,
  ],
})
export class AlarmsConfigModule {}
