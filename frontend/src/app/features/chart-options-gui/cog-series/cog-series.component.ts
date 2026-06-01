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
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';

@Component({
  selector: 'app-cog-series',
  imports: [
    FormsModule,
    NzButtonModule,
    NzInputModule,
    NzInputNumberModule,
    NzSwitchModule,
    NzSelectModule,
  ],
  templateUrl: './cog-series.component.html',
  styleUrl: './cog-series.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CogSeriesComponent {
  @Input() series: Highcharts.Series | undefined;
  @Output() optionChange = new EventEmitter<{ value: any; key: string }>();

  onInputChange(value: any, key: string) {
    this.optionChange.next({ value, key });
  }
}
