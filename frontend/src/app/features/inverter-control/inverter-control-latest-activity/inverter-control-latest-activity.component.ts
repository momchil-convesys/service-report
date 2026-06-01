import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Observable, combineLatest, filter, map, shareReplay, switchMap } from 'rxjs';
import { DataRequest } from '../../../constants';
import { PageRoutingService } from '../../../shared/page-routing.service';
import { InverterControlRequest } from '../_data/inverter-control.model';
import { InverterControlService } from '../_data/inverter-control.service';

@Component({
  selector: 'app-inverter-control-latest-activity',
  templateUrl: './inverter-control-latest-activity.component.html',
  styleUrls: ['./inverter-control-latest-activity.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class InverterControlLatestActivityComponent {
  historyRequest$: Observable<DataRequest<InverterControlRequest[]>>;
  historyRequestData$: Observable<InverterControlRequest[]>;
  historyRequestError$: Observable<Error | undefined>;

  constructor(
    pageRouting: PageRoutingService,
    private dataService: InverterControlService,
  ) {
    const devices$ = pageRouting.getRelatedDevicesFromQueryParams();

    this.historyRequest$ = combineLatest([
      devices$,
      this.dataService.shouldUpdateHistoryList$,
    ]).pipe(
      switchMap(([devices]) =>
        this.dataService.getInverterControlRequests(
          1,
          5,
          devices.map((device) => device.id),
        ),
      ),
      shareReplay(1),
    );

    this.historyRequestData$ = this.historyRequest$.pipe(
      filter((req) => req.isLoading === false),
      map((req) => req.data || []),
    );

    this.historyRequestError$ = this.historyRequest$.pipe(
      filter((req) => req.isLoading === false),
      map((req) => req.error),
    );
  }
}
