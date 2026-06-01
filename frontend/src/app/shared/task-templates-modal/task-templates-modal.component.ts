import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { NzModalModule, NzModalRef } from 'ng-zorro-antd/modal';
import { filter, map, Observable } from 'rxjs';
import { TaskNodeDefinition } from '../../data/models';
import { TasksService } from '../../data/services/tasks.service';
import { TaskTreeSelectModule } from '../task-tree-select/task-tree-select.module';

@Component({
  selector: 'app-task-templates-modal',

  imports: [CommonModule, NzModalModule, TaskTreeSelectModule],
  templateUrl: './task-templates-modal.component.html',
  styleUrls: ['./task-templates-modal.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskTemplatesModalComponent {
  taskTemplatesRootNode$ = new Observable<TaskNodeDefinition>();

  private _selectionRoot: TaskNodeDefinition | undefined;

  constructor(
    private modal: NzModalRef,
    private tasksService: TasksService,
  ) {
    this.taskTemplatesRootNode$ = this.tasksService.getPredefinedTasks().pipe(
      filter((req) => req.data !== undefined),
      map((req) => req.data as TaskNodeDefinition),
    );
  }

  getSelectionRoot(): TaskNodeDefinition | undefined {
    return this._selectionRoot;
  }

  onTaskSelectionChange(node: TaskNodeDefinition) {
    this._selectionRoot = node;
  }

  onOk() {
    this.modal.destroy();
  }

  onCancel() {
    this.modal.destroy();
  }
}
