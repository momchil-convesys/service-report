import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSwitchModule } from 'ng-zorro-antd/switch';

@Component({
  selector: 'app-cog-x-axis',
  imports: [FormsModule, NzButtonModule, NzInputModule, NzInputNumberModule, NzSwitchModule],
  templateUrl: './cog-x-axis.component.html',
  styleUrl: './cog-x-axis.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CogXAxisComponent {
  @Input() axis: Highcharts.Axis | undefined;
  @Output() optionChange = new EventEmitter<{ value: any; key: string }>();

  get axisOptions(): Highcharts.XAxisOptions | undefined {
    if (this.axis?.options) {
      return this.axis.options as Highcharts.XAxisOptions;
    }

    return undefined;
  }

  onInputChange(value: any, key: string) {
    this.optionChange.next({ value, key });
  }
}
