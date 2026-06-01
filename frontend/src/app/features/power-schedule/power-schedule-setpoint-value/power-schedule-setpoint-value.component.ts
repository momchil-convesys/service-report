import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { ValueDisplayComponent } from '../../../shared/value-display/value-display.component';

@Component({
  selector: 'app-power-schedule-setpoint-value',
  templateUrl: './power-schedule-setpoint-value.component.html',
  styleUrl: './power-schedule-setpoint-value.component.less',
  imports: [ValueDisplayComponent],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PowerScheduleSetpointValueComponent {
  @Input({ required: true }) value: number | null | undefined;
  @Input() unit: string = '';
  @Input() showPlusSignIfPositive = false;

  @HostBinding('class.bold')
  @Input()
  bold = false;
}
