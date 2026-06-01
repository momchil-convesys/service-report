import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { celsiusDegreeSymbol } from '../../../../../constants';
import { MinMaxTemperaturePoint } from '../../../_data/models';
import { LongTermExtremeLinkComponent } from '../long-term-extreme-link/long-term-extreme-link.component';

@Component({
  selector: 'app-long-term-extremes-cell',
  imports: [LongTermExtremeLinkComponent],
  templateUrl: './long-term-extremes-cell.component.html',
  styleUrl: './long-term-extremes-cell.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LongTermExtremesCellComponent {
  @Input({ required: true }) min: MinMaxTemperaturePoint | null = null;
  @Input({ required: true }) max: MinMaxTemperaturePoint | null = null;
  @Output() goToExtreme = new EventEmitter<MinMaxTemperaturePoint>();

  celsiusDegreeSymbol = celsiusDegreeSymbol;

  onGoToRecord(point: MinMaxTemperaturePoint) {
    this.goToExtreme.next(point);
  }
}
