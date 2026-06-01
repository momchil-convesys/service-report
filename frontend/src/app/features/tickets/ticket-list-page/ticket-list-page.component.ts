import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { filter, map, Observable, shareReplay } from 'rxjs';
import { Ticket } from '../../../data/models';
import { TicketsService } from '../tickets.service';

@Component({
  selector: 'app-ticket-list-page',
  templateUrl: './ticket-list-page.component.html',
  styleUrls: ['./ticket-list-page.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketListPageComponent implements OnInit {
  tickets$: Observable<Ticket[]>;

  constructor(
    private data: TicketsService,
    private fb: FormBuilder,
  ) {
    this.tickets$ = this.data.getTickets().pipe(
      filter((req) => req.isLoading === false),
      map((req) => req.data || []),
      shareReplay(),
    );
  }

  ngOnInit(): void {}
}
