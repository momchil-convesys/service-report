import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { PowerLimitSchedule } from '../_data/models';

@Component({
  selector: 'app-pls-history-list',
  templateUrl: './pls-history-list.component.html',
  styleUrls: ['./pls-history-list.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class PlsHistoryListComponent {
  @Input() data: PowerLimitSchedule[] = [];
  @Input() loading: boolean = false;
}
