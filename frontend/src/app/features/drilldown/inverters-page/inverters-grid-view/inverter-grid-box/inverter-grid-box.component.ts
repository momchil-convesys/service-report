import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzSkeletonComponent } from 'ng-zorro-antd/skeleton';
import { Inverter_DTO } from '../../../../../data/dtos';
import { DeviceStateModule } from '../../../../../shared/device-state/device-state.module';
import { ValueDisplayComponent } from '../../../../../shared/value-display/value-display.component';
import { getMostSignificantAlarm } from '../../../alarms-page/_data/utils';
import { InverterAlarm_DTO, InverterMetrics_DataPoint_DTO } from '../../_data/dto';
import { InverterPowerBarComponent } from '../inverter-power-bar/inverter-power-bar.component';
import { InverterAlarmIconComponent } from './inverter-alarm-icon/inverter-alarm-icon.component';
import { InverterStateIndicatorComponent } from './inverter-state-indicator/inverter-state-indicator.component';

@Component({
  selector: 'app-inverter-grid-box',
  imports: [
    RouterLink,
    RouterLinkActive,
    InverterPowerBarComponent,
    NzSkeletonComponent,
    ValueDisplayComponent,
    DatePipe,
    InverterAlarmIconComponent,
    DeviceStateModule,
    NzPopoverModule,
    InverterStateIndicatorComponent,
  ],
  templateUrl: './inverter-grid-box.component.html',
  styleUrl: './inverter-grid-box.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InverterGridBoxComponent {
  @Input({ required: true }) metadata: Inverter_DTO | undefined;
  @Input({ required: true }) data: InverterMetrics_DataPoint_DTO | undefined;
  @Input({ required: true }) loading = false;

  @HostBinding('class.stale') @Input() stale = false;

  getMostSignificantAlarm(alarms: Array<InverterAlarm_DTO>): InverterAlarm_DTO | undefined {
    return getMostSignificantAlarm(alarms);
  }
}
