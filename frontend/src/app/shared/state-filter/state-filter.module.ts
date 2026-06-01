import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { DeviceStateModule } from '../device-state/device-state.module';
import { StateFilterComponent } from './state-filter.component';

@NgModule({
  declarations: [StateFilterComponent],
  imports: [CommonModule, FormsModule, NzSelectModule, DeviceStateModule],
  exports: [StateFilterComponent],
})
export class StateFilterModule {}
