import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import {
  DeviceState,
  ExtendedDeviceState,
  deviceStateFullLabels,
  deviceStateShortLabels,
} from '../../constants';

export type DeviceStateViewVariant = 'short' | 'full' | 'error-stack';

@Component({
  selector: 'app-device-state',
  templateUrl: './device-state.component.html',
  styleUrls: ['./device-state.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class DeviceStateComponent {
  @Input() state: ExtendedDeviceState | undefined | null;
  @Input() variant: DeviceStateViewVariant = 'short';
  @Input() fixedWidth = false;
  @Input() size: 'default' | 'large' = 'default';

  @HostBinding('style.min-width') get minWidth() {
    if (this.fixedWidth) {
      return this.variant === 'error-stack' ? '70px' : '50px';
    }

    return 'auto';
  }

  DeviceState = DeviceState;

  cssClasses: { [key in DeviceState]: string } = {
    [DeviceState.On]: 'state-on',
    [DeviceState.Off]: 'state-off',
    [DeviceState.Warning]: 'state-wrn',
    [DeviceState.Error]: 'state-err',
    [DeviceState.ServiceMode]: 'state-svc',
    [DeviceState.NoCommunication]: 'state-nc',
    [DeviceState.Invalid]: 'state-inv',
    [DeviceState.Standby]: 'state-off',
    [DeviceState.Intermediate]: 'state-int',
  };

  get labels() {
    return this.variant === 'full' ? deviceStateFullLabels : deviceStateShortLabels;
  }

  get isWarning() {
    return this.state?.baseState === DeviceState.Warning;
  }

  fullLabelForState(state: DeviceState): string {
    return deviceStateFullLabels[state];
  }
}
