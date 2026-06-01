import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { BessScheduleIndicatorComponent } from 'src/app/shared/power-limit/bess-schedule-indicator/bess-schedule-indicator.component';
import { InverterPowerLimitIndicatorComponent } from 'src/app/shared/power-limit/inverter-power-limit-indicator/inverter-power-limit-indicator.component';
import { PowerLimitScheduleIndicatorComponent } from 'src/app/shared/power-limit/power-limit-schedule-indicator/power-limit-schedule-indicator.component';
import { ActiveAlarmsCountComponent } from '../../features/drilldown/widgets/active-alarms-count/active-alarms-count.component';
import { DeviceStateModule } from '../../shared/device-state/device-state.module';
import { SidebarToggleButtonComponent } from '../sidebar/sidebar-toggle-button/sidebar-toggle-button.component';
import { PlantComponent } from './plant.component';

@NgModule({
  declarations: [PlantComponent],
  imports: [
    CommonModule,
    RouterModule,
    NzCardModule,
    DeviceStateModule,
    NzTabsModule,
    NzIconModule,
    NzDividerModule,
    NzButtonModule,
    PowerLimitScheduleIndicatorComponent,
    BessScheduleIndicatorComponent,
    InverterPowerLimitIndicatorComponent,
    ActiveAlarmsCountComponent,
    SidebarToggleButtonComponent,
    NzTooltipModule,
  ],
  exports: [PlantComponent],
})
export class PlantModule {}
