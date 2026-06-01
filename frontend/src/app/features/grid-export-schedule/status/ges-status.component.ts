import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { GridExportSchedule_ForDay } from '../_data/models/grid-export-schedule.model';
import { PositionInTime, calculatePositionInTimeRelativeToInterval } from '../helpers';

@Component({
  selector: 'app-ges-status',
  templateUrl: './ges-status.component.html',
  styleUrls: ['./ges-status.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class GesStatusComponent {
  @Input() schedule: GridExportSchedule_ForDay | undefined;

  positionInTime(item: GridExportSchedule_ForDay): PositionInTime {
    return calculatePositionInTimeRelativeToInterval(
      { start: new Date(item.applicableInterval.from), end: new Date(item.applicableInterval.to) },
      this.schedule?.plantTimeZone,
    );
  }
}
