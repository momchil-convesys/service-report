import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { DatetimeRangeFilterModule } from '../../shared/datetime-range-filter/datetime-range-filter.module';
import { ConsumptionChartWidgetComponent } from './consumption-chart-widget/consumption-chart-widget.component';
import { ConsumptionChartLoaderComponent } from './consumption-chart/consumption-chart-loader.component';
import { ConsumptionChartComponent } from './consumption-chart/consumption-chart.component';
import { ConsumptionService } from './consumption.service';

@NgModule({
  declarations: [
    ConsumptionChartComponent,
    ConsumptionChartLoaderComponent,
    ConsumptionChartWidgetComponent,
  ],
  imports: [CommonModule, NzCardModule, DatetimeRangeFilterModule],
  exports: [ConsumptionChartWidgetComponent],
  providers: [ConsumptionService],
})
export class ConsumptionModule {}
