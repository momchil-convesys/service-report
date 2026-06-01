import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { Observable, Subject, filter, map, of, shareReplay, switchMap, takeUntil } from 'rxjs';
import { DataRequest } from '../../../../constants';
import { Inverter_DTO, TransformerStation_DTO } from '../../../../data/dtos';
import { PageRoutingService } from '../../../../shared/page-routing.service';
import { InvertersService } from '../../inverters-page/_data/inverters.service';
import { InverterAlarmIconComponent } from '../../inverters-page/inverters-grid-view/inverter-grid-box/inverter-alarm-icon/inverter-alarm-icon.component';
import { ActiveAlarmsDataService } from '../_data/data.service';
import { InverterAlarmHistoricalItem_DTO } from '../_data/dto';

@Component({
  selector: 'app-alarm-detail-page',
  templateUrl: './alarm-detail-page.component.html',
  styleUrls: ['./alarm-detail-page.component.less'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzAlertModule,
    NzTableModule,
    InverterAlarmIconComponent,
    NzSpinModule,
  ],
  providers: [PageRoutingService],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlarmDetailPageComponent {
  invertersMetadata$: Observable<DataRequest<TransformerStation_DTO[]>>;

  alarm$: Observable<InverterAlarmHistoricalItem_DTO | undefined>;
  loading$: Observable<boolean>;
  error$: Observable<Error | undefined>;

  lastActiveAlarm$: Observable<InverterAlarmHistoricalItem_DTO | undefined>;

  get filterType(): 'active' | 'history' | undefined {
    return this.route.snapshot.url[0].path === 'active-alarms' ? 'active' : 'history';
  }

  private destroy$ = new Subject<void>();

  constructor(
    pageRouting: PageRoutingService,
    private route: ActivatedRoute,
    dataService: ActiveAlarmsDataService,
    private metadata: InvertersService,
  ) {
    const plant$ = pageRouting.getPlantRequestFromQueryParams();

    this.invertersMetadata$ = plant$.pipe(
      switchMap((plant) => this.metadata.getTsMetadataForPlant(plant.data?.id || '')),
      shareReplay(1),
      takeUntil(this.destroy$),
    );

    if (
      dataService.alarms$ === undefined ||
      dataService.loading$ === undefined ||
      dataService.error$ === undefined
    ) {
      const message = 'Application error: ActiveAlarmsDataService is not initialized';

      console.error(message);

      this.error$ = of(new Error(message));
      this.loading$ = of(false);
      this.alarm$ = of(undefined);
      this.lastActiveAlarm$ = of(undefined);

      return;
    }

    this.loading$ = dataService.loading$;
    this.error$ = dataService.error$;

    const alarmId$ = route.paramMap.pipe(map((params) => params.get('alarmId')));

    this.alarm$ = alarmId$
      .pipe(
        switchMap((alarmId) =>
          dataService.alarms$
            ? dataService.alarms$.pipe(
                map((alarms) => {
                  return alarms.find((alarm) => alarm.id === alarmId);
                }),
              )
            : of(undefined),
        ),
      )
      .pipe(takeUntil(this.destroy$));

    this.lastActiveAlarm$ = this.alarm$.pipe(filter((alarm) => !!alarm));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getMetadataForInverterId(inverterId: string): Observable<DataRequest<Inverter_DTO | undefined>> {
    return this.invertersMetadata$.pipe(
      map((req) => ({
        ...req,
        data:
          req.data
            ?.find((m) => m.inverters.find((i) => i.inverterId === inverterId))
            ?.inverters.find((i) => i.inverterId === inverterId) || undefined,
      })),
      shareReplay(1),
    );
  }
}
