import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { Observable, Subject, map, shareReplay, switchMap, takeUntil } from 'rxjs';
import { DataRequest } from '../../../../constants';
import { Plant } from '../../../../data/models';
import { handleAnyError } from '../../../../helpers';
import { PageRoutingService } from '../../../../shared/page-routing.service';
import { ApiService } from '../_data/api.service';
import { ActiveAlarmsDataService } from '../_data/data.service';
import { InverterAlarmHistoricalItem_DTO } from '../_data/dto';
import { AlarmsTableComponent } from '../alarms-table/alarms-table.component';

@Component({
  selector: 'app-active-alarms',
  imports: [NzAlertModule, AsyncPipe, AlarmsTableComponent, RouterOutlet],
  templateUrl: './active-alarms.component.html',
  styleUrl: './active-alarms.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ApiService, ActiveAlarmsDataService],
})
export class ActiveAlarmsComponent {
  plant$: Observable<DataRequest<Plant>>;

  alarmsRequest$: Observable<DataRequest<InverterAlarmHistoricalItem_DTO[]>>;

  alarms$: Observable<InverterAlarmHistoricalItem_DTO[]>;
  loading$: Observable<boolean>;
  error$: Observable<Error | undefined>;

  private destroy$ = new Subject<void>();

  constructor(
    pageRouting: PageRoutingService,
    api: ApiService,
    dataService: ActiveAlarmsDataService,
  ) {
    this.plant$ = pageRouting.getPlantRequestFromQueryParams();

    dataService.alarmsRequest$ = this.plant$.pipe(
      switchMap((plant) =>
        api.fetchActiveAlarms(plant.data?.id || '').pipe(takeUntil(this.destroy$)),
      ),
      shareReplay(1),
      takeUntil(this.destroy$),
    );

    dataService.alarms$ = dataService.alarmsRequest$.pipe(map((req) => req.data || []));
    dataService.loading$ = dataService.alarmsRequest$.pipe(map((req) => req.isLoading));
    dataService.error$ = dataService.alarmsRequest$.pipe(
      map((req) => (req.error ? handleAnyError(req.error, undefined) : undefined)),
    );

    this.alarmsRequest$ = dataService.alarmsRequest$;
    this.alarms$ = dataService.alarms$;
    this.loading$ = dataService.loading$;
    this.error$ = dataService.error$;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
