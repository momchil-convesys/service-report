import { JsonPipe } from '@angular/common';
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
  selector: 'app-cog-y-axis',
  imports: [
    JsonPipe,
    FormsModule,
    NzButtonModule,
    NzInputModule,
    NzInputNumberModule,
    NzSwitchModule,
  ],
  templateUrl: './cog-y-axis.component.html',
  styleUrl: './cog-y-axis.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CogYAxisComponent {
  @Input() axis: Highcharts.Axis | undefined;
  @Output() optionChange = new EventEmitter<{ value: any; key: string }>();

  onInputChange(value: any, key: string) {
    this.optionChange.next({ value, key });
  }
}
