import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { DeviceStateIconishComponent } from './device-state-iconish/device-state-iconish.component';
import { DeviceStateComponent } from './device-state.component';

@NgModule({
  declarations: [DeviceStateComponent, DeviceStateIconishComponent],
  imports: [CommonModule, NzTagModule, NzIconModule],
  exports: [DeviceStateComponent, DeviceStateIconishComponent],
})
export class DeviceStateModule {}
