import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzTreeViewModule } from 'ng-zorro-antd/tree-view';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { TaskTreeSelectModule } from '../../shared/task-tree-select/task-tree-select.module';
import { TaskFormComponent } from './task-form/task-form.component';
import { TaskTreeEditComponent } from './task-tree-edit/task-tree-edit.component';
import { TasksComponent } from './tasks.component';
import { TasksEditComponent } from './tasks-edit/tasks-edit.component';

const routes: Routes = [
  {
    path: '',
    component: TasksComponent,
  },
];

@NgModule({
  declarations: [TasksComponent, TaskFormComponent, TaskTreeEditComponent, TasksEditComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NzButtonModule,
    NzIconModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzCheckboxModule,
    NzRadioModule,
    NzCollapseModule,
    NzUploadModule,
    NzTreeViewModule,
    NzTreeModule,
    TaskTreeSelectModule,
  ],
  exports: [],
})
export class TasksModule {}
