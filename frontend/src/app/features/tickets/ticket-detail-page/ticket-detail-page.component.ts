import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Observable, filter, map, mergeMap, of, take } from 'rxjs';
import {
  TaskNodeDefinition,
  Ticket,
  TicketTask,
  TicketTaskGroup,
  TicketTaskNode,
} from '../../../data/models';
import { MockUser, MockUsersService } from '../../../data/services/mock-users.service';
import { TasksService } from '../../../data/services/tasks.service';
import { TaskTemplatesModalComponent } from '../../../shared/task-templates-modal/task-templates-modal.component';
import { TicketsService } from '../tickets.service';

interface TicketForm {
  id: FormControl<string | null>;
  name: FormControl<string | null>;
  assignedTo: FormControl<string | null>;
  description: FormControl<string | null>;
}

@Component({
  selector: 'app-ticket-detail-page[ticket]',
  templateUrl: './ticket-detail-page.component.html',
  styleUrls: ['./ticket-detail-page.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketDetailPageComponent implements OnChanges {
  @Input() ticket!: Ticket | null;

  form: FormGroup<TicketForm> | undefined;
  private _ticket: Ticket | null = null;

  allUsers: MockUser[] = [];
  isNewTicket = true;

  constructor(
    private data: TicketsService,
    private router: Router,
    private usersService: MockUsersService,
    private modalService: NzModalService,
    private tasksService: TasksService,
  ) {
    this.allUsers = this.usersService.getAllUsers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const ticket = this.ticket; // TODO: get value from simple changes

    this._ticket = ticket;
    this.isNewTicket = ticket ? false : true;

    this.form = new FormGroup({
      id: new FormControl(ticket?.id || ''),
      name: new FormControl(ticket?.title || ''),
      description: new FormControl(ticket?.description || ''),
      assignedTo: new FormControl(ticket?.assignedTo || ''),
    });
  }

  onSubmit(form: FormGroup<TicketForm>) {
    const value = form?.value;
    if (!value) {
      console.warn('Nothing to submit!');
      return;
    }

    let tasksRoot$: Observable<TicketTaskGroup | null> | undefined;

    if (this.isNewTicket) {
      tasksRoot$ = this.tasksService.getPredefinedTasks().pipe(
        filter((req) => req.data !== undefined),
        map((req) => req.data as TaskNodeDefinition),
        map((rootNode) => <TicketTaskGroup>this._taskTreeFromDefinitionsRoot(rootNode)),
      );
    } else {
      tasksRoot$ = of(this._ticket?.tasksRoot || null);
    }

    tasksRoot$
      .pipe(
        take(1),
        mergeMap((tasksRoot) =>
          this.data.createOrUpdateTicket({
            id: value.id || undefined,
            title: value.name || '',
            description: value.description || '',
            assignedTo: value.assignedTo || null,
            createdBy: this._ticket?.createdBy,
            activityLog: [],
            tasksRoot,
          }),
        ),
      )
      .subscribe((res) => {
        if (res.data && res.data.id) {
          void this.router.navigateByUrl(`/tickets/detail/${res.data.id}`);
        }
      }); // TODO: unsubscribe
  }

  onDelete(form: FormGroup<TicketForm>) {
    const ticketId = form.value.id;

    if (ticketId) {
      this.data.deleteTicket(ticketId).subscribe(() => {
        void this.router.navigateByUrl('/tickets');
      }); // TODO: unsubscribe
    }
  }

  userDisplayStringById(userId: string | null): string | null {
    return this.usersService.getUserDisplayString(userId);
  }

  showModal() {
    this.modalService.create({
      nzTitle: 'Task templates',
      nzContent: TaskTemplatesModalComponent,
      nzOnOk: (component: TaskTemplatesModalComponent) => {
        // TODO:
        // this.onTaskSelectionChange(component.getSelectionRoot());
      },
    });
  }

  private _taskTreeFromDefinitionsRoot(taskNodeDefinition: TaskNodeDefinition): TicketTaskNode {
    if (taskNodeDefinition.isLeaf) {
      const result: TicketTask = {
        id: taskNodeDefinition.id + 'tt',
        taskNodeDefinition,
        status: 'pending',
        outcome: '',
        isLeaf: true,
        enabled: false,
        index: undefined,
      };

      return result;
    }

    const result: TicketTaskGroup = {
      id: taskNodeDefinition.id + 'tt',
      taskNodeDefinition,
      isLeaf: false,
      enabled: false,
      assignedTo: null,
      status: 'not-started',
      index: undefined,
      children:
        taskNodeDefinition.children?.map((nodeDef) => this._taskTreeFromDefinitionsRoot(nodeDef)) ||
        [],
    };

    if (result.taskNodeDefinition.forceOrder || result.id === 'roottt') {
      result.children.forEach((child, index) => (child.index = index));
    }

    return result;
  }
}
