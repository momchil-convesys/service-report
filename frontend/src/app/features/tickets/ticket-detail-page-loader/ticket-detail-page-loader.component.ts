import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { map, mergeMap, Observable, of, shareReplay } from 'rxjs';
import { DataRequest } from '../../../constants';
import { Ticket } from '../../../data/models';
import { TicketsService } from '../tickets.service';

@Component({
  selector: 'app-ticket-detail-page-loader',
  templateUrl: './ticket-detail-page-loader.component.html',
  styleUrls: ['./ticket-detail-page-loader.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketDetailPageLoaderComponent {
  ticketRequest$: Observable<DataRequest<Ticket | null>>;

  constructor(
    private route: ActivatedRoute,
    private data: TicketsService,
  ) {
    this.ticketRequest$ = this.route.paramMap.pipe(
      map((params: ParamMap) => params.get('ticketId')),
      mergeMap((ticketId: string | null) => {
        if (ticketId) {
          return this.data.getTicket(ticketId);
        }
        return of({
          isLoading: false,
          data: null,
        });
      }),
      shareReplay(),
    );
  }
}
