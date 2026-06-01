import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import {
  DeviceState,
  ExtendedDeviceState,
  deviceStateColors,
  deviceStateShortLabels,
} from '../../../constants';

@Component({
  selector: 'app-device-state-iconish',
  templateUrl: './device-state-iconish.component.html',
  styleUrls: ['./device-state-iconish.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class DeviceStateIconishComponent {
  @Input() state: ExtendedDeviceState | undefined;

  colors = deviceStateColors;
  labels = deviceStateShortLabels;

  DeviceState = DeviceState;
}
