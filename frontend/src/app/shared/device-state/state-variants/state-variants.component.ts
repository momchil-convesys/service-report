import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { DeviceStateModule } from 'src/app/shared/device-state/device-state.module';
import { DeviceState, deviceStateColors } from '../../../constants';

@Component({
  selector: 'app-state-variants',
  templateUrl: './state-variants.component.html',
  styleUrls: ['./state-variants.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzTagModule,
    NzIconModule,
    NzCardModule,
    DeviceStateModule,
    NzAlertModule,
    NzDividerModule,
  ],
})
export class StateVariantsComponent {
  colors = deviceStateColors;
  DeviceState = DeviceState;

  deviceStates = Object.values(DeviceState).map((baseState) => ({
    baseState,
  }));
}
