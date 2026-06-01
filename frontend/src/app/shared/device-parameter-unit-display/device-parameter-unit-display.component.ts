import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { celsiusDegreeSymbols } from '../../constants';

@Component({
  selector: 'app-device-parameter-unit-display[unit]',
  imports: [],
  templateUrl: './device-parameter-unit-display.component.html',
  styleUrls: ['./device-parameter-unit-display.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeviceParameterUnitDisplayComponent {
  @Input({ required: true }) unit: string | null = null;

  noSpaceUnits: string[] = celsiusDegreeSymbols;
}
