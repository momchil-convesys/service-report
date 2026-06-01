import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { MonbatBattery } from '../_data/models';
import { MonbatBatteryTemperatureBarComponent } from '../bars/monbat-battery-temperature-bar/monbat-battery-temperature-bar.component';
import { MonbatBatteryVoltageBarComponent } from '../bars/monbat-battery-voltage-bar/monbat-battery-voltage-bar.component';

@Component({
  selector: 'app-monbat-battery-table-view',
  templateUrl: './monbat-battery-table-view.component.html',
  styleUrls: ['./monbat-battery-table-view.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MonbatBatteryTemperatureBarComponent,
    MonbatBatteryVoltageBarComponent,
    NzTableModule,
    RouterLink,
  ],
})
export class MonbatBatteryTableViewComponent {
  @Input() data: MonbatBattery[] = [];

  sortDefault = (a: MonbatBattery, b: MonbatBattery) => {
    const strA = a.displayName.replace(/[^\d.]/g, '');
    const strB = b.displayName.replace(/[^\d.]/g, '');

    return parseInt(strA) - parseInt(strB);
  };

  sortVoltage = (a: MonbatBattery, b: MonbatBattery) => {
    return (a.voltage || 0) - (b.voltage || 0);
  };

  sortTemperature = (a: MonbatBattery, b: MonbatBattery) => {
    return (a.temperature || 0) - (b.temperature || 0);
  };

  sortSoc = (a: MonbatBattery, b: MonbatBattery) => {
    return (a.soc || 0) - (b.soc || 0);
  };
}
