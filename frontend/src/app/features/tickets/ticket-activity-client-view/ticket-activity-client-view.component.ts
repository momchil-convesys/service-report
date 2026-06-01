import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { ReplaySubject } from 'rxjs';
import {
  taskGroupStatusLabels,
  Ticket,
  TicketActivityDetailsTaskGroupEdit,
  TicketActivityItem,
  TicketActivityType,
} from '../../../data/models';

@Component({
  selector: 'app-ticket-activity-client-view[ticket]',
  templateUrl: './ticket-activity-client-view.component.html',
  styleUrls: ['./ticket-activity-client-view.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketActivityClientViewComponent implements OnInit, OnChanges {
  @Input() ticket!: Ticket;

  activityItems$: ReplaySubject<TicketActivityItem[]> = new ReplaySubject(1);

  ActivityType = TicketActivityType;

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    this.activityItems$.next(
      this.ticket.activityLog.filter((item) => item.type === TicketActivityType.TaskGroupEdited),
    );
  }

  getTitleForItem(item: TicketActivityItem): string {
    if (item.type === TicketActivityType.TaskGroupEdited) {
      const details: TicketActivityDetailsTaskGroupEdit = <TicketActivityDetailsTaskGroupEdit>(
        item.details
      );
      return `${details.taskGroupName} => ${taskGroupStatusLabels[details.status].toUpperCase()}`;
    }

    return `Something happened (${item.type})`;
  }
}
