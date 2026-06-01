import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { ExtendedPlantMetricsApiService } from '../extended-plant-metrics/_data/api.service';
import { ExtendedPlantMetricsDataService } from '../extended-plant-metrics/_data/data.service';
import { LevelOfMeasurement } from '../extended-plant-metrics/_data/dto';
import { EpmHistoricalDataWidgetComponent } from '../extended-plant-metrics/epm-historical-data-widget/epm-historical-data-widget.component';
import { EpmLiveDataWidgetComponent } from '../extended-plant-metrics/epm-live-data-widget/epm-live-data-widget.component';

@Component({
  selector: 'app-reactive-power',
  imports: [
    NzCardModule,
    NzAlertModule,
    NzSpinModule,
    EpmLiveDataWidgetComponent,
    EpmHistoricalDataWidgetComponent,
  ],
  templateUrl: './reactive-power.component.html',
  styleUrl: './reactive-power.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ExtendedPlantMetricsApiService, ExtendedPlantMetricsDataService],
})
export class ReactivePowerComponent {
  LevelOfMeasurement = LevelOfMeasurement;
}
