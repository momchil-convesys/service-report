import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTreeViewModule } from 'ng-zorro-antd/tree-view';
import { TaskTreeSelectComponent } from './task-tree-select.component';

@NgModule({
  declarations: [TaskTreeSelectComponent],
  imports: [CommonModule, NzIconModule, NzCheckboxModule, NzTreeViewModule],
  exports: [TaskTreeSelectComponent],
})
export class TaskTreeSelectModule {}
