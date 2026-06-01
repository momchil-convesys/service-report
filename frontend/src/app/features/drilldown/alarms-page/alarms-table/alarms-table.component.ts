import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { InverterAlarmIconComponent } from '../../inverters-page/inverters-grid-view/inverter-grid-box/inverter-alarm-icon/inverter-alarm-icon.component';
import { InverterAlarmHistoricalItem_DTO } from '../_data/dto';

@Component({
  selector: 'app-alarms-table',
  imports: [NzTableModule, RouterLink, RouterLinkActive, InverterAlarmIconComponent, DatePipe],
  templateUrl: './alarms-table.component.html',
  styleUrl: './alarms-table.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlarmsTableComponent {
  @Input() alarms: InverterAlarmHistoricalItem_DTO[] = [];
  @Input() loading: boolean = false;

  expandSet = new Set<string>();

  onExpandChange(id: string, checked: boolean): void {
    if (checked) {
      this.expandSet.add(id);
    } else {
      this.expandSet.delete(id);
    }
  }
}
