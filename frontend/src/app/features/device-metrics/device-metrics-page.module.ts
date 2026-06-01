import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { DeviceLinkModule } from '../../shared/device-link/device-link.module';
import { DeviceParameterUnitDisplayComponent } from '../../shared/device-parameter-unit-display/device-parameter-unit-display.component';
import { DeviceStateModule } from '../../shared/device-state/device-state.module';
import { LiveDataIndicatorComponent } from '../../shared/live-data-indicator/live-data-indicator.component';
import { ParameterMappingService } from './_data/parameter-mapping.service';
import { DeviceMetricsPageComponent } from './device-metrics-page.component';
import { DeviceMetricsChartsComponent } from './device-metrics/device-metrics-charts/device-metrics-charts.component';
import { DmChartGenericComponent } from './device-metrics/device-metrics-charts/dm-chart-generic/dm-chart-generic.component';
import { DeviceMetricsTableComponent } from './device-metrics/device-metrics-table/device-metrics-table.component';
import { DeviceMetricsComponent } from './device-metrics/device-metrics.component';

const routes: Routes = [
  {
    path: '',
    component: DeviceMetricsPageComponent,
  },
];

@NgModule({
  declarations: [
    DeviceMetricsPageComponent,
    DeviceMetricsComponent,
    DeviceMetricsTableComponent,
    DeviceMetricsChartsComponent,
    DmChartGenericComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    NzTableModule,
    DeviceStateModule,
    DeviceLinkModule,
    NzAlertModule,
    NzRadioModule,
    NzSwitchModule,
    NzSpinModule,
    NzButtonModule,
    NzTooltipModule,
    DeviceParameterUnitDisplayComponent,
    LiveDataIndicatorComponent,
  ],
  providers: [ParameterMappingService],
})
export class DeviceMetricsPageModule {}
