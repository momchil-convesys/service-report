import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { celsiusDegreeSymbol } from '../../../../../constants';
import { RelativeDatePipe } from '../../../../../shared/pipes/relative-date.pipe';
import { ValueDisplayComponent } from '../../../../../shared/value-display/value-display.component';
import { MinMaxTemperaturePoint } from '../../../_data/models';

@Component({
  selector: 'app-long-term-extreme-link',
  imports: [ValueDisplayComponent, NzButtonModule, NzPopoverModule, RelativeDatePipe, DatePipe],
  templateUrl: './long-term-extreme-link.component.html',
  styleUrl: './long-term-extreme-link.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LongTermExtremeLinkComponent {
  @Input({ required: true }) extremePoint: MinMaxTemperaturePoint | null = null;
  @Input({ required: true }) extremeType!: 'min' | 'max';

  @Output() goToExtreme = new EventEmitter<MinMaxTemperaturePoint>();

  labelForUptimeExtreme = {
    ['min']: $localize`Uptime min`,
    ['max']: $localize`Uptime max`,
  };
  celsiusDegreeSymbol = celsiusDegreeSymbol;

  onGoToRecord(point: MinMaxTemperaturePoint) {
    this.goToExtreme.next(point);
  }
}
