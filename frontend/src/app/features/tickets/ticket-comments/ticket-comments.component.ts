import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { filter, map, Observable, ReplaySubject, take, tap } from 'rxjs';
import { DataRequest } from '../../../constants';
import {
  Ticket,
  TicketActivityDetailsComment,
  TicketActivityDetailsType,
  TicketActivityItem,
  TicketActivityType,
} from '../../../data/models';
import { TicketsService } from '../tickets.service';

interface CommentForm {
  message: FormControl<string>;
}

@Component({
  selector: 'app-ticket-comments[ticket]',
  templateUrl: './ticket-comments.component.html',
  styleUrls: ['./ticket-comments.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketCommentsComponent implements OnChanges {
  @Input() ticket!: Ticket;

  activityItems$: ReplaySubject<TicketActivityItem[]> = new ReplaySubject(1);

  ActivityType = TicketActivityType;

  form: FormGroup<CommentForm>;

  constructor(private data: TicketsService) {
    this.form = new FormGroup<CommentForm>(
      {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        message: new FormControl('', { nonNullable: true, validators: Validators.required }),
      },
      { updateOn: 'submit' },
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.activityItems$.next(this.ticket.activityLog);
  }

  onDeleteComment(activityItem: TicketActivityItem) {
    this._decorateRequest(
      this.data.deleteComment(this.ticket.id || 'TODO', activityItem.id),
    ).subscribe();
  }

  onAddComment() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      this.form.controls.message.updateValueAndValidity();
      return;
    }

    this._decorateRequest(
      this.data.addComment(this.ticket.id || 'TODO', {
        message: this.form.value.message || 'TODO: Empty message',
      }),
    ).subscribe(() => this.form.reset());
  }

  asComment(x: TicketActivityDetailsType): TicketActivityDetailsComment {
    return <TicketActivityDetailsComment>x;
  }

  private _decorateRequest(request: Observable<DataRequest<Ticket>>) {
    return request.pipe(
      filter((req) => req.data !== undefined),
      take(1),
      map((req) => req.data as Ticket),
      map((ticket) => ticket.activityLog),
      tap((activityItems: TicketActivityItem[]) => this.activityItems$.next(activityItems)),
    );
  }
}
