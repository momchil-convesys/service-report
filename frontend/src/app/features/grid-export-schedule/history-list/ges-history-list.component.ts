import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { GridExportSchedule_ForDay } from '../_data/models/grid-export-schedule.model';

@Component({
  selector: 'app-ges-history-list',
  templateUrl: './ges-history-list.component.html',
  styleUrls: ['./ges-history-list.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class GesHistoryListComponent {
  @Input() data: GridExportSchedule_ForDay[] = [];
  @Input() loading: boolean = false;
}
