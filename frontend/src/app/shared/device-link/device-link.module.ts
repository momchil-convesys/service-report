import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { DeviceLinkComponent } from './device-link.component';

@NgModule({
  declarations: [DeviceLinkComponent],
  imports: [CommonModule, NzDividerModule, RouterModule],
  exports: [DeviceLinkComponent, RouterModule],
})
export class DeviceLinkModule {}
