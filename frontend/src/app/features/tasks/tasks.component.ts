import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { TaskNodeDefinition } from '../../data/models';
import { TasksService } from '../../data/services/tasks.service';

type TaskResolveStatus = 'resolved-ok' | 'resolved-na' | 'resolved-danger';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.less'],
  encapsulation: ViewEncapsulation.None,
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksComponent implements OnInit {
  // fileList: any[] = [];

  rootNode$ = new ReplaySubject<TaskNodeDefinition>(1);

  // resolvedTasks: {
  //   [taksId: string]:
  //     | {
  //         status: TaskResolveStatus | undefined;
  //       }
  //     | undefined;
  // } = {};

  constructor(private dataService: TasksService) {
    this.dataService.getPredefinedTasks().subscribe((req) => {
      if (req.data) {
        this.rootNode$.next({
          ...req.data,
          children: req.data.children,
        });
      }
    });
  }

  ngOnInit(): void {}

  // resolveTask(id: string, status: TaskResolveStatus) {
  //   this.resolvedTasks[id] = {
  //     status,
  //   };
  // }

  // unresolveTask(id: string) {
  //   this.resolvedTasks[id] = {
  //     ...this.resolvedTasks[id],
  //     status: undefined,
  //   };
  // }

  // getNumberOfResolvedTasks(tasks: TaskNodeDefinition[]) {
  //   return tasks.filter((task) => this.resolvedTasks[task.id]?.status !== undefined).length;
  // }
}
