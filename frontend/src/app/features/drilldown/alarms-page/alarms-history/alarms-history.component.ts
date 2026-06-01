import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import {
  Observable,
  ReplaySubject,
  Subject,
  combineLatest,
  map,
  shareReplay,
  switchMap,
  takeUntil,
} from 'rxjs';
import { DataRequest } from '../../../../constants';
import { Plant } from '../../../../data/models';
import { handleAnyError } from '../../../../helpers';
import { DatetimeRangeSelectComponent } from '../../../../shared/datetime-range-select/datetime-range-select.component';
import { DatetimeRangeModel } from '../../../../shared/datetime-range-select/models';
import { PageRoutingService } from '../../../../shared/page-routing.service';
import { ApiService } from '../_data/api.service';
import { ActiveAlarmsDataService } from '../_data/data.service';
import { InverterAlarmHistoricalItem_DTO } from '../_data/dto';
import { AlarmsTableComponent } from '../alarms-table/alarms-table.component';

@Component({
  selector: 'app-alarms-history',
  imports: [
    NzAlertModule,
    AsyncPipe,
    DatetimeRangeSelectComponent,
    AlarmsTableComponent,
    RouterOutlet,
  ],
  templateUrl: './alarms-history.component.html',
  styleUrl: './alarms-history.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ApiService, ActiveAlarmsDataService],
})
export class AlarmsHistoryComponent {
  private _targetRange$: ReplaySubject<DatetimeRangeModel> = new ReplaySubject(1);

  plant$: Observable<DataRequest<Plant>>;

  alarmsRequest$: Observable<DataRequest<InverterAlarmHistoricalItem_DTO[]>>;

  alarms$: Observable<InverterAlarmHistoricalItem_DTO[]>;
  loading$: Observable<boolean>;
  error$: Observable<Error | undefined>;

  timeZone$: Observable<string | undefined>;

  private destroy$ = new Subject<void>();

  constructor(
    pageRouting: PageRoutingService,
    api: ApiService,
    dataService: ActiveAlarmsDataService,
  ) {
    this.plant$ = pageRouting.getPlantRequestFromQueryParams();

    this.timeZone$ = this.plant$.pipe(map((req) => req.data?.timeZone));

    dataService.alarmsRequest$ = combineLatest([this.plant$, this._targetRange$]).pipe(
      switchMap(([plant, targetRange]) =>
        api.fetchAlarms(plant.data?.id || '', targetRange).pipe(takeUntil(this.destroy$)),
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

  onDatetimeRangeChange(value: DatetimeRangeModel) {
    this._targetRange$.next(value);
  }
}
