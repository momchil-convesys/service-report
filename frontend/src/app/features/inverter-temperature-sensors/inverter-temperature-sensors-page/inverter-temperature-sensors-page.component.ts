import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { TemperatureSensorsApiService } from '../_data/api.service';
import { TemperatureSensorsDataService } from '../_data/data.service';
import { InverterTemperatureSensorsWidgetComponent } from '../inverter-temperature-sensors-widget/inverter-temperature-sensors-widget.component';

@Component({
  selector: 'app-inverter-temperature-sensors-page',
  imports: [InverterTemperatureSensorsWidgetComponent],
  templateUrl: './inverter-temperature-sensors-page.component.html',
  styleUrl: './inverter-temperature-sensors-page.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TemperatureSensorsApiService, TemperatureSensorsDataService],
})
export class InverterTemperatureSensorsPageComponent {}
