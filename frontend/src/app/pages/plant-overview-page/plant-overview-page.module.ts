import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ControlLimitWidgetComponent } from '../../features/aratiden-specific-control/control-limit-widget.component';
import { ConsumptionModule } from '../../features/consumption/consumption.module';
import { DeviceAvailabilityWidgetComponent } from '../../features/device-availability/device-availability-widget.component';
import { PvChartsModule } from '../../features/pv-charts/pv-charts.module';
import { WtPowerModule } from '../../features/wt-power/wt-power.module';
import { AlarmEventsWidgetComponent } from '../../shared/alarm-events-widget/alarm-events-widget.component';
import { PlantOverviewPageComponent } from './plant-overview-page.component';

const routes: Routes = [
  {
    path: '',
    component: PlantOverviewPageComponent,
  },
];

@NgModule({
  declarations: [PlantOverviewPageComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    AlarmEventsWidgetComponent,
    DeviceAvailabilityWidgetComponent,
    PvChartsModule,
    ConsumptionModule,
    WtPowerModule,
    ControlLimitWidgetComponent,
  ],
})
export class PlantOverviewPageModule {}
