import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CurrentFaults, DeviceType, ExtendedDeviceState } from 'src/app/constants';
import { PowerLimitDetails } from 'src/app/data/models';
import { InverterControlFormComponent } from 'src/app/features/inverter-control/inverter-control-panel/inverter-control-modal/inverter-control-form/inverter-control-form.component';
import { ExtendedDevice } from 'src/app/features/inverter-control/inverter-control-panel/models';

@Component({
  selector: 'app-inverter-control-form-test',
  imports: [InverterControlFormComponent],
  templateUrl: './inverter-control-form-test.component.html',
  styleUrl: './inverter-control-form-test.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InverterControlFormTestComponent {
  device: ExtendedDevice = {
    id: '1',
    name: 'Inverter 1',
    plantId: '1',
    state: {
      baseState: undefined,
    },
    currentFaults: undefined,
    deviceMetadataId: '1',
    type: DeviceType.Solar,
    powerLimit: null,
    deviceSpecificMetadata: {
      hasTemperatureSensors: false,
      deviceMaxPower: 550.0,
    },
    currentFaultsSubject: new BehaviorSubject<CurrentFaults | undefined>(undefined),
    stateSubject: new BehaviorSubject<ExtendedDeviceState>({
      baseState: undefined,
    }),
    powerLimitSubject: new BehaviorSubject<PowerLimitDetails | null>(null),
    powerLimitSettingMin: 50,
    powerLimitSettingMax: 550,
  };
}
