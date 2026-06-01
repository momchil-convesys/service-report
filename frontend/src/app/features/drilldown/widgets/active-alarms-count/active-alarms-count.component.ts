import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { BehaviorSubject, Observable, Subject, map, shareReplay, switchMap, takeUntil } from 'rxjs';
import { SSE_DataRequest } from '../../../../constants';
import { ApiService } from '../../alarms-page/_data/api.service';
import { AlarmSeverity, InverterAlarmHistoricalItem_DTO } from '../../alarms-page/_data/dto';
import { getMostSignificantAlarm } from '../../alarms-page/_data/utils';
import { InverterAlarmIconComponent } from '../../inverters-page/inverters-grid-view/inverter-grid-box/inverter-alarm-icon/inverter-alarm-icon.component';

interface Context {
  plantId: string;
  tsId: string | null;
}

@Component({
  selector: 'app-active-alarms-count',
  templateUrl: './active-alarms-count.component.html',
  styleUrls: ['./active-alarms-count.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ApiService],
  standalone: true,
  imports: [CommonModule, NzAlertModule, NzSpinModule, InverterAlarmIconComponent],
})
export class ActiveAlarmsCountComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) context: Context | undefined;

  private context$ = new BehaviorSubject<Context | undefined>(undefined);

  activeAlarmsRequest$: Observable<SSE_DataRequest<InverterAlarmHistoricalItem_DTO[]>>;
  activeAlarmsCount$: Observable<number>;
  severity$: Observable<AlarmSeverity | undefined>;

  private destroy$ = new Subject<void>();

  constructor(private alarmsApi: ApiService) {
    this.activeAlarmsRequest$ = this.context$.pipe(
      switchMap((context) =>
        this.alarmsApi.fetchActiveAlarms(context?.plantId || 'MISSING_PLANT_ID').pipe(
          map((req) => {
            if (context?.tsId) {
              return {
                ...req,
                data: req.data?.filter((alarm) =>
                  alarm.inverterEvents.some((inverterEvent) => inverterEvent.tsId === context.tsId),
                ),
              };
            }

            return req;
          }),
        ),
      ),
      shareReplay(1),
      takeUntil(this.destroy$),
    );

    this.activeAlarmsCount$ = this.activeAlarmsRequest$.pipe(
      map((request) => request.data?.length || 0),
    );

    this.severity$ = this.activeAlarmsRequest$.pipe(
      map((request) => {
        if (!request.data?.length) return undefined;
        const mostSevereAlarm = getMostSignificantAlarm(request.data);
        return mostSevereAlarm?.severity;
      }),
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['context']) {
      this.context$.next(this.context);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
