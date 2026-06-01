import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ErrorStackIndexValueComponent } from '../error-stack-index-value/error-stack-index-value.component';
import { DeviceCurrentErrorsComponent } from './device-current-errors.component';

@NgModule({
  declarations: [DeviceCurrentErrorsComponent],
  imports: [CommonModule, ErrorStackIndexValueComponent],
  exports: [DeviceCurrentErrorsComponent],
})
export class DeviceCurrentErrorsModule {}
