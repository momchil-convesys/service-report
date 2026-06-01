import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { ActiveAlarmsCountComponent } from '../../features/drilldown/widgets/active-alarms-count/active-alarms-count.component';
import { MonbatScheduleIndicatorComponent } from '../../features/monbat-batteries-schedule/monbat-schedule-indicator/monbat-schedule-indicator.component';
import { DeviceCurrentErrorsModule } from '../../shared/device-current-errors/device-current-errors.module';
import { DeviceStateDynamicComponent } from '../../shared/device-state-dynamic/device-state-dynamic.component';
import { InverterPowerLimitIndicatorComponent } from '../../shared/power-limit/inverter-power-limit-indicator/inverter-power-limit-indicator.component';
import { SidebarToggleButtonComponent } from '../sidebar/sidebar-toggle-button/sidebar-toggle-button.component';
import { DeviceComponent } from './device.component';

@NgModule({
  declarations: [DeviceComponent],
  imports: [
    CommonModule,
    RouterModule,
    NzTabsModule,
    NzIconModule,
    NzButtonModule,
    DeviceStateDynamicComponent,
    DeviceCurrentErrorsModule,
    InverterPowerLimitIndicatorComponent,
    MonbatScheduleIndicatorComponent,
    ActiveAlarmsCountComponent,
    SidebarToggleButtonComponent,
  ],
  exports: [DeviceComponent],
})
export class DeviceModule {}
