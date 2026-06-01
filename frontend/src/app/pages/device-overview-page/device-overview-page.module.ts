import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConsumptionModule } from '../../features/consumption/consumption.module';
import { DeviceAvailabilityWidgetComponent } from '../../features/device-availability/device-availability-widget.component';
import { HybridInverterOverviewPageComponent } from '../../features/monbat-batteries/hybrid-inverter-overview-page/hybrid-inverter-overview-page.component';
import { PvChartsModule } from '../../features/pv-charts/pv-charts.module';
import { WtPowerModule } from '../../features/wt-power/wt-power.module';
import { AlarmEventsWidgetComponent } from '../../shared/alarm-events-widget/alarm-events-widget.component';
import { DeviceCurrentErrorsWidgetComponent } from '../../shared/device-current-errors-widget/device-current-errors-widget.component';
import { DeviceOverviewPageComponent } from './device-overview-page.component';

const routes: Routes = [
  {
    path: '',
    component: DeviceOverviewPageComponent,
  },
];

@NgModule({
  declarations: [DeviceOverviewPageComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    DeviceCurrentErrorsWidgetComponent,
    AlarmEventsWidgetComponent,
    DeviceAvailabilityWidgetComponent,
    PvChartsModule,
    ConsumptionModule,
    WtPowerModule,
    HybridInverterOverviewPageComponent,
  ],
})
export class DeviceOverviewPageModule {}
