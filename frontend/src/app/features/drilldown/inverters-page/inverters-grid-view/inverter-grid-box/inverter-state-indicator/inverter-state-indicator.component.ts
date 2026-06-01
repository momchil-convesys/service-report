import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { DeviceState, deviceStateColors, ExtendedDeviceState } from '../../../../../../constants';
@Component({
  selector: 'app-inverter-state-indicator',
  standalone: true,
  imports: [NzIconModule],
  template: `
    @if (state?.baseState; as baseState) {
      <!--  -->
      @if (getShowPowerLimitIcon()) {
        <span nz-icon nzType="vertical-align-top" nzTheme="outline" class="power-limit-icon"></span>
      } @else {
        <div
          class="state-indicator"
          [style.background-color]="getColorForState(baseState)"
          [style.border-color]="getBorderColorForState(baseState)"
        ></div>
      }
    } @else {
      <div class="state-indicator placeholder"></div>
    }
  `,
  styles: [
    `
      app-inverter-state-indicator {
        .state-indicator {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          border: 1px solid white;

          box-shadow: 0 0 0 1px #ffffff;

          &.placeholder {
            border-color: transparent;
          }
        }
        .power-limit-icon {
          color: #14995d;
          margin-left: -4px;
          margin-right: -4px;
        }
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InverterStateIndicatorComponent {
  @Input({ required: true }) state: ExtendedDeviceState | undefined;

  getShowPowerLimitIcon(): boolean {
    return this.state?.intermediateStateCode === 513;
  }

  getColorForState(state: DeviceState): string {
    if (state === DeviceState.NoCommunication) {
      return '#ffffff00';
    }

    return deviceStateColors[state];
  }

  getBorderColorForState(state: DeviceState): string {
    return deviceStateColors[state];
  }
}
