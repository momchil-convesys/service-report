import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTreeViewModule } from 'ng-zorro-antd/tree-view';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { RelativeDatePipe } from '../../shared/pipes/relative-date.pipe';
import { RelativeTimestampComponent } from '../../shared/relative-timestamp/relative-timestamp.component';
import { TaskGroupStatusComponent } from '../../shared/task-group-status/task-group-status.component';
import { TaskStatusComponent } from '../../shared/task-status/task-status.component';
import { TaskTemplatesModalComponent } from '../../shared/task-templates-modal/task-templates-modal.component';
import { TaskTreeSelectModule } from '../../shared/task-tree-select/task-tree-select.module';
import { UserLinkComponent } from '../../shared/user-link/user-link.component';
import { TicketActivityClientViewComponent } from './ticket-activity-client-view/ticket-activity-client-view.component';
import { TicketCommentsComponent } from './ticket-comments/ticket-comments.component';
import { TicketDetailPageLoaderComponent } from './ticket-detail-page-loader/ticket-detail-page-loader.component';
import { TicketDetailPageComponent } from './ticket-detail-page/ticket-detail-page.component';
import { TicketListPageComponent } from './ticket-list-page/ticket-list-page.component';
import { TicketTaskEditComponent } from './ticket-task-edit/ticket-task-edit.component';
import { TicketTaskGroupEditComponent } from './ticket-task-group-edit/ticket-task-group-edit.component';
import { TicketTasksComponent } from './ticket-tasks/ticket-tasks.component';
import { TicketsComponent } from './tickets.component';
import { TicketsService } from './tickets.service';

const routes: Routes = [
  {
    path: '',
    component: TicketsComponent,
    children: [
      {
        path: 'new',
        component: TicketDetailPageLoaderComponent,
      },
      {
        path: 'detail/:ticketId',
        component: TicketDetailPageLoaderComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [
    TicketsComponent,
    TicketListPageComponent,
    TicketDetailPageComponent,
    TicketCommentsComponent,
    TicketTasksComponent,
    TicketTaskEditComponent,
    TicketTaskGroupEditComponent,
    TicketActivityClientViewComponent,
    TicketDetailPageLoaderComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    RelativeDatePipe,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
    NzDividerModule,
    NzModalModule,
    NzTreeViewModule,
    NzIconModule,
    NzRadioModule,
    NzTypographyModule,
    TaskTreeSelectModule,
    RelativeTimestampComponent,
    TaskTemplatesModalComponent,
    UserLinkComponent,
    TaskStatusComponent,
    TaskGroupStatusComponent,
  ],
  providers: [TicketsService],
})
export class TicketsModule {}
