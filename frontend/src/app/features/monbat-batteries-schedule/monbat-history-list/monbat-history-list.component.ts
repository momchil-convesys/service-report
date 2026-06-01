import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { MonbatSchedule } from '../_data/models';

@Component({
  selector: 'app-monbat-history-list',
  templateUrl: './monbat-history-list.component.html',
  styleUrls: ['./monbat-history-list.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class MonbatHistoryListComponent {
  @Input() data: MonbatSchedule[] = [];
  @Input() loading: boolean = false;
}
