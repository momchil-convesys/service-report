import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { PlsHistoricalDataApiService } from './_data/api.service';
import { PlsHistoricalDataPageComponent } from './pls-historical-data-page.component';
import { PlsHistoricalDataChartDeviceComponent } from './pls-historical-data/pls-historical-data-chart/pls-historical-data-chart-device.component';
import { PlsHistoricalDataChartComponent } from './pls-historical-data/pls-historical-data-chart/pls-historical-data-chart.component';

@NgModule({
  declarations: [
    PlsHistoricalDataPageComponent,
    PlsHistoricalDataChartComponent,
    PlsHistoricalDataChartDeviceComponent,
  ],
  imports: [CommonModule],
  exports: [RouterModule],
  providers: [PlsHistoricalDataApiService],
})
export class PlsHistoricalDataModule {}
