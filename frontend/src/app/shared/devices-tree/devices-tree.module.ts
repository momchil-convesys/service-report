import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzTreeViewModule } from 'ng-zorro-antd/tree-view';
import { PowerLimitScheduleIndicatorComponent } from 'src/app/shared/power-limit/power-limit-schedule-indicator/power-limit-schedule-indicator.component';
import { MonbatScheduleIndicatorComponent } from '../../features/monbat-batteries-schedule/monbat-schedule-indicator/monbat-schedule-indicator.component';
import { DeviceStateModule } from '../device-state/device-state.module';
import { BessScheduleIndicatorComponent } from '../power-limit/bess-schedule-indicator/bess-schedule-indicator.component';
import { InverterPowerLimitIndicatorComponent } from '../power-limit/inverter-power-limit-indicator/inverter-power-limit-indicator.component';
import { PowerLimitIconComponent } from '../power-limit/power-limit-icon/power-limit-icon.component';
import { StateFilterModule } from '../state-filter/state-filter.module';
import { DevicesTreeComponent } from './devices-tree.component';

@NgModule({
  declarations: [DevicesTreeComponent],
  imports: [
    CommonModule,
    NzTreeViewModule,
    NzIconModule,
    NzBadgeModule,
    NzTooltipModule,
    NzButtonModule,
    NzSpaceModule,
    DeviceStateModule,
    StateFilterModule,
    InverterPowerLimitIndicatorComponent,
    PowerLimitIconComponent,
    PowerLimitScheduleIndicatorComponent,
    MonbatScheduleIndicatorComponent,
    BessScheduleIndicatorComponent,
  ],
  exports: [DevicesTreeComponent],
})
export class DevicesTreeModule {}
