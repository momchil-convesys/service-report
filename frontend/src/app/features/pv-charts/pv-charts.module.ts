import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { PvPowerChartDeviceComponent } from 'src/app/features/pv-charts/pv-power/pv-power-chart-device/pv-power-chart-device.component';
import { PvPowerChartWidgetDeviceComponent } from 'src/app/features/pv-charts/pv-power/pv-power-chart-device/pv-power-chart-widget-device.component';
import { DatetimeRangeSelectComponent } from '../../shared/datetime-range-select/datetime-range-select.component';
import { HighchartsExportOptionComponent } from '../../shared/highcharts-export-option/highcharts-export-option.component';
import { LiveDataIndicatorComponent } from '../../shared/live-data-indicator/live-data-indicator.component';
import { PageRoutingService } from '../../shared/page-routing.service';
import { ProductionValueComponent } from './_shared/production-value/production-value.component';
import { PvAveragePowerChartPlantWidgetComponent } from './pv-average-power-chart-plant/pv-average-power-chart-plant-widget.component';
import { PvAveragePowerChartPlantComponent } from './pv-average-power-chart-plant/pv-average-power-chart-plant.component';
import { PvActivePowerLiveComponent } from './pv-plant-metrics/pv-active-power-live/pv-active-power-live.component';
import { PvCombinedChartDataLoaderComponent } from './pv-plant-metrics/pv-combined-chart-data-loader.component';
import { PvDailyProductionLiveComponent } from './pv-plant-metrics/pv-daily-production-live/pv-daily-production-live.component';
import { PvPowerChartWidgetComponent } from './pv-power/pv-power-chart-plant/pv-power-chart-widget.component';
import { PvPowerChartComponent } from './pv-power/pv-power-chart-plant/pv-power-chart.component';
import { PvProductionChartWidgetComponent } from './pv-production-chart/pv-production-chart-widget.component';
import { PvProductionChartComponent } from './pv-production-chart/pv-production-chart.component';

@NgModule({
  declarations: [
    PvPowerChartComponent,
    PvPowerChartWidgetComponent,
    PvProductionChartWidgetComponent,
    PvCombinedChartDataLoaderComponent,
    PvDailyProductionLiveComponent,
    PvActivePowerLiveComponent,
    PvPowerChartDeviceComponent,
    PvPowerChartWidgetDeviceComponent,
    PvAveragePowerChartPlantWidgetComponent,
    PvAveragePowerChartPlantComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzDatePickerModule,
    NzDividerModule,
    NzButtonModule,
    NzIconModule,
    NzAlertModule,
    NzTooltipModule,
    ProductionValueComponent,
    HighchartsExportOptionComponent,
    DatetimeRangeSelectComponent,
    LiveDataIndicatorComponent,
    PvProductionChartComponent,
  ],
  exports: [
    PvPowerChartWidgetComponent,
    PvPowerChartWidgetDeviceComponent,
    PvProductionChartWidgetComponent,
    PvCombinedChartDataLoaderComponent,
    PvAveragePowerChartPlantWidgetComponent,
    PvPowerChartDeviceComponent,
  ],
  providers: [PageRoutingService],
})
export class PvChartsModule {}
