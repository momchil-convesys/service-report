import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  filter,
  map,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';
import { DataRequest } from '../../../constants';
import { PageRoutingService } from '../../../shared/page-routing.service';
import {
  InverterControlRequest,
  InverterControlRequestType,
} from '../_data/inverter-control.model';
import { InverterControlService } from '../_data/inverter-control.service';

@Component({
  selector: 'app-inverter-control-history',
  templateUrl: './inverter-control-history.component.html',
  styleUrls: ['./inverter-control-history.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PageRoutingService],
  standalone: false,
})
export class InverterControlHistoryComponent {
  historyRequest$: Observable<DataRequest<InverterControlRequest[]>>;
  historyRequestData$: Observable<InverterControlRequest[]>;
  historyRequestError$: Observable<Error | undefined>;

  paginationChange$ = new BehaviorSubject<boolean>(true);

  pageSize = 5;
  pageIndex = 1;
  totalCount = 0;

  filterByTypeValue$ = new BehaviorSubject<InverterControlRequestType | 'any'>('any');

  filterByTypeOptions: { value: InverterControlRequestType | 'any'; label: string }[] = [
    {
      value: 'any',
      label: $localize`All requests`,
    },
    {
      value: 'limit-inverter-power',
      label: $localize`Power limit`,
    },
    {
      value: 'start-inverter',
      label: $localize`Start`,
    },
    {
      value: 'stop-inverter',
      label: $localize`Stop`,
    },
  ];

  constructor(
    pageRouting: PageRoutingService,
    private dataService: InverterControlService,
  ) {
    const devices$ = pageRouting.getRelatedDevicesFromQueryParams();

    this.historyRequest$ = combineLatest([
      devices$.pipe(tap(() => (this.pageIndex = 1))),
      this.filterByTypeValue$.pipe(tap(() => (this.pageIndex = 1))),
      this.paginationChange$,
      this.dataService.shouldUpdateHistoryList$,
    ]).pipe(
      switchMap(([devices, type]) =>
        this.dataService.getInverterControlRequests(
          this.pageIndex,
          this.pageSize,
          devices.map((device) => device.id),
          undefined,
          undefined,
          type === 'any' ? undefined : type,
        ),
      ),
      shareReplay(1),
    );

    this.historyRequestData$ = this.historyRequest$.pipe(
      filter((req) => req.isLoading === false),
      tap((req) => {
        if (req.data) {
          this.totalCount = req.listMetadata?.totalCount || 0;
        }
      }),
      map((req) => req.data || []),
    );

    this.historyRequestError$ = this.historyRequest$.pipe(
      filter((req) => req.isLoading === false),
      map((req) => req.error),
    );
  }

  onPageIndexChange(index: number) {
    this.pageIndex = index;
    this.paginationChange$.next(true);
  }

  onFilterChange(event: InverterControlRequestType | 'any') {
    this.filterByTypeValue$.next(event);
  }
}
