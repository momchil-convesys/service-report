import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { TaskStatus } from '../../data/models';

@Component({
  selector: 'app-task-status[status][index]',

  imports: [NzIconModule],
  templateUrl: './task-status.component.html',
  styleUrls: ['./task-status.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskStatusComponent {
  @Input() status!: TaskStatus;
  @Input() index: number | undefined;
}
