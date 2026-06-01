import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { PriorityMode, priorityModes } from '../_data/priority-modes.dto';

@Component({
  selector: 'app-power-schedule-priority-modes-list',
  templateUrl: './power-schedule-priority-modes-list.component.html',
  styleUrls: ['./power-schedule-priority-modes-list.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class PowerSchedulePriorityModesListComponent {
  priorityModes = priorityModes;
  PriorityMode = PriorityMode;
}
