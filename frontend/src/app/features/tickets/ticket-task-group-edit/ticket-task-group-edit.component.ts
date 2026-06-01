import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TaskGroupStatus, TicketTaskGroup, taskGroupStatusLabels } from '../../../data/models';
import { MockUser, MockUsersService } from '../../../data/services/mock-users.service';
import { TicketsService } from '../tickets.service';

interface TicketTaskGroupForm {
  assignedTo: FormControl<string | null>;
  status: FormControl<string>;
}

@Component({
  selector: 'app-ticket-task-group-edit[taskGroup][ticketId]',
  templateUrl: './ticket-task-group-edit.component.html',
  styleUrls: ['./ticket-task-group-edit.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketTaskGroupEditComponent implements OnChanges {
  @Input() taskGroup!: TicketTaskGroup;
  @Input() ticketId!: string;

  @Output() taskNodeUpdate = new EventEmitter<TicketTaskGroup>();

  form: FormGroup<TicketTaskGroupForm>;

  statusOptions: { value: TaskGroupStatus; label: string; className: string }[] = [
    {
      value: 'not-started',
      label: taskGroupStatusLabels['not-started'],
      className: 'status-not-started',
    },
    {
      value: 'in-progress',
      label: taskGroupStatusLabels['in-progress'],
      className: 'status-in-progress',
    },
    {
      value: 'done',
      label: taskGroupStatusLabels['done'],
      className: 'status-done',
    },
    {
      value: 'approved',
      label: taskGroupStatusLabels['approved'],
      className: 'status-approved',
    },
  ];

  constructor(
    private ticketsService: TicketsService,
    private usersService: MockUsersService,
  ) {
    this.form = new FormGroup({
      assignedTo: new FormControl(''),
      status: new FormControl('', { nonNullable: true }),
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.form.patchValue({ assignedTo: this.taskGroup.assignedTo, status: this.taskGroup.status });
  }

  onStatusChange(status: string) {
    this.form?.controls.status.setValue(status);
  }

  onSubmit(form: FormGroup<TicketTaskGroupForm>) {
    const newValue: TicketTaskGroup = {
      ...this.taskGroup,
      assignedTo: form.value.assignedTo || null,
      status: <TaskGroupStatus>form.getRawValue().status,
    };

    // TODO: unsubscribe
    this.ticketsService.updateTaskNode(this.ticketId, newValue).subscribe(() => {
      this.taskNodeUpdate.next(newValue);
    });

    // TODO: update in memory model in service
    this.taskGroup.assignedTo = newValue.assignedTo;
    this.taskGroup.status = newValue.status;
  }

  userDisplayStringById(userId: string | null): string | null {
    return this.usersService.getUserDisplayString(userId);
  }

  get allUsers(): MockUser[] {
    return this.usersService.getAllUsers();
  }
}
