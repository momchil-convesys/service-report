import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { GridExportSchedule_ForDay } from '../_data/models/grid-export-schedule.model';

@Component({
  selector: 'app-ges-activity',
  templateUrl: './ges-activity.component.html',
  styleUrl: './ges-activity.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class GesActivityComponent {
  @Input({ required: true }) schedule!: GridExportSchedule_ForDay;

  getColorForStatus(status: 'draft' | 'enabled' | 'disabled'): string {
    if (status === 'enabled') {
      return '#23BE73'; // @green-6
    }

    if (status === 'disabled') {
      return '#d9343a'; // @red-7
    }

    return 'gray';
  }
}
