import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { Observable, ReplaySubject, map, of, switchMap } from 'rxjs';
import { ExtendedDeviceState, TypedChange } from '../../constants';
import { Device } from '../../data/models';
import { DeviceStateViewVariant } from '../device-state/device-state.component';
import { DeviceStateModule } from '../device-state/device-state.module';

interface ComponentChanges extends SimpleChanges {
  device: TypedChange<Device | undefined>;
}

@Component({
  selector: 'app-device-state-dynamic[device]',
  imports: [DeviceStateModule, AsyncPipe],
  templateUrl: './device-state-dynamic.component.html',
  styleUrl: './device-state-dynamic.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeviceStateDynamicComponent implements OnChanges {
  @Input({ required: true }) device!: Device;
  @Input() variant: DeviceStateViewVariant = 'short';
  @Input() fixedWidth = false;
  @Input() size: 'default' | 'large' = 'default';

  private _device$ = new ReplaySubject<Device | undefined>(1);

  state$: Observable<ExtendedDeviceState | null>;

  constructor() {
    this.state$ = this._device$.pipe(
      switchMap((device) => {
        if (!device) {
          return of(null);
        }

        return device.stateSubject.pipe(
          map((state) => {
            const detailedState: ExtendedDeviceState = {
              baseState: state.baseState,
              intermediateState:
                state.intermediateStateCode !== undefined && state.intermediateState !== null
                  ? device.metadata?.intermediateStates?.find(
                      (definition) => definition.code === state.intermediateStateCode,
                    )
                  : undefined,
            };
            return detailedState;
          }),
        );
      }),
    );
  }

  ngOnChanges(changes: ComponentChanges): void {
    if (changes.device) {
      this._device$.next(changes.device.currentValue);
    }
  }
}
