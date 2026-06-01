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
import { TaskGroupStatus, taskGroupStatusLabels, TicketTask } from '../../../data/models';
import { TicketsService } from '../tickets.service';

interface TicketTaskForm {
  result: FormControl<string>;
}

@Component({
  selector: 'app-ticket-task-edit[task][ticketId]',
  templateUrl: './ticket-task-edit.component.html',
  styleUrls: ['./ticket-task-edit.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketTaskEditComponent implements OnChanges {
  @Input() task!: TicketTask;
  @Input() ticketId!: string;

  @Output() taskNodeUpdate = new EventEmitter<TicketTask>();

  form: FormGroup<TicketTaskForm>;

  constructor(private ticketsService: TicketsService) {
    this.form = new FormGroup<TicketTaskForm>({
      result: new FormControl('', { nonNullable: true }),
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.form.reset();
    this.form.setValue({ result: this.task.outcome });
  }

  onSubmit(form: FormGroup<TicketTaskForm>) {
    // console.log('HERE: ', this.form.getRawValue());

    const newValue: TicketTask = {
      ...this.task,
      outcome: form.getRawValue().result,
      status: 'done',
    };

    // TODO: unsubscribe
    this.ticketsService.updateTaskNode(this.ticketId, newValue).subscribe(() => {
      this.taskNodeUpdate.next(newValue);
    });

    this.task.outcome = newValue.outcome;
    this.task.status = newValue.status;
  }

  statusLabelForGroupStatus(status: TaskGroupStatus): string {
    return taskGroupStatusLabels[status];
  }
}
