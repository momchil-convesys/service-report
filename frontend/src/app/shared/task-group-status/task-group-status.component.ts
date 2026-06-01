import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { TaskGroupStatus, taskGroupStatusLabels } from '../../data/models';

@Component({
  selector: 'app-task-group-status[status]',

  imports: [],
  templateUrl: './task-group-status.component.html',
  styleUrls: ['./task-group-status.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskGroupStatusComponent {
  @Input() status!: TaskGroupStatus;

  @HostBinding('class.approved') get statusApproved() {
    return this.status === 'approved';
  }

  @HostBinding('class.done') get statusDone() {
    return this.status === 'done';
  }

  @HostBinding('class.in-progress') get statusInProgress() {
    return this.status === 'in-progress';
  }

  @HostBinding('class.not-started') get statusNotStarted() {
    return this.status === 'not-started';
  }

  get label() {
    return taskGroupStatusLabels[this.status];
  }
}
