import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { ValueDisplayComponent } from '../../value-display/value-display.component';

@Component({
  selector: 'app-pls-value-formatted',
  templateUrl: './pls-value-formatted.component.html',
  styleUrl: './pls-value-formatted.component.less',
  imports: [ValueDisplayComponent],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlsValueFormattedComponent {
  @Input({ required: true }) value: number | null | undefined;
  @Input() unit: string = '';

  @HostBinding('class.bold')
  @Input()
  bold = false;
}
