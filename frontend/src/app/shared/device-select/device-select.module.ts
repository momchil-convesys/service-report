import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTreeViewModule } from 'ng-zorro-antd/tree-view';
import { DeviceSelectComponent } from './device-select.component';

@NgModule({
  declarations: [DeviceSelectComponent],
  imports: [CommonModule, NzTreeViewModule, NzIconModule, NzButtonModule, NzDividerModule],
  exports: [DeviceSelectComponent],
})
export class DeviceSelectModule {}
