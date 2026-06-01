import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { WtCombinedChartComponent } from './combined-chart/wt-combined-chart.component';
import { WtPowerChartComponent } from './split-charts/wt-power-chart.component';
import { WtPowerChartWidgetComponent } from './wt-power-chart-widget.component';

@NgModule({
  declarations: [WtPowerChartWidgetComponent, WtPowerChartComponent, WtCombinedChartComponent],
  exports: [WtPowerChartWidgetComponent],
  imports: [CommonModule, FormsModule, NzCardModule, NzDatePickerModule],
})
export class WtPowerModule {}
