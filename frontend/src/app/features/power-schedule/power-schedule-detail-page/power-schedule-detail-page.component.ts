import { Component, inject, OnDestroy, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { NzMessageRef } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  shareReplay,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { AccessControlPermission, DataRequest } from '../../../constants';
import { ClockService } from '../../../data/services/clock.service';
import { UsersService } from '../../../data/services/users.service';
import { saveFile } from '../../../helpers';
import { PowerScheduleApiService } from '../_data/api.service';
import { PowerSchedule } from '../_data/models';
import { PowerScheduleSyncService } from '../_data/power-schedule-sync.service';
import {
  PowerScheduleToggleConfirmModalComponent,
  PowerScheduleToggleConfirmModalComponent_Data,
  PowerScheduleToggleConfirmModalComponent_Result,
} from './power-schedule-toggle-confirm-modal/power-schedule-toggle-confirm-modal.component';

interface QueryParams {
  plantId: string;
  scheduleId: string;
}
@Component({
  selector: 'app-power-schedule-detail-page',
  templateUrl: './power-schedule-detail-page.component.html',
  styleUrls: ['./power-schedule-detail-page.component.less'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
  providers: [PowerScheduleApiService],
})
export class PowerScheduleDetailPageComponent implements OnDestroy {
  private _destroy$ = new Subject<void>();

  scheduleRequest$: Observable<DataRequest<PowerSchedule>>;
  queryParams$: Observable<QueryParams>;

  schedule: PowerSchedule | undefined;
  activeMessage: NzMessageRef | undefined;

  hasPermissionToToggleScheduleStatus: boolean;

  // True if sure
  scheduleNeedsUpdate$ = new BehaviorSubject<boolean>(true);

  private _clock = inject(ClockService);

  constructor(
    route: ActivatedRoute,
    private api: PowerScheduleApiService,
    private powerScheduleSyncService: PowerScheduleSyncService,
    private usersService: UsersService,
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
  ) {
    this.queryParams$ = route.paramMap.pipe(
      map((params: ParamMap) => ({
        plantId: params.get('plantId') || 'INVALID_ROUTE_PARAMETER',
        scheduleId: params.get('scheduleId') || 'INVALID_ROUTE_PARAMETER',
      })),
      shareReplay(1),
    );

    this.powerScheduleSyncService.scheduleStatusMayHaveChanged$.subscribe(() => {
      this.scheduleNeedsUpdate$.next(false);
    });

    this.scheduleRequest$ = combineLatest([this.queryParams$, this.scheduleNeedsUpdate$]).pipe(
      switchMap(([params, _]: [QueryParams, any]) =>
        api.fetchPowerSchedule(params.plantId, params.scheduleId).pipe(takeUntil(this._destroy$)),
      ),
      tap((request) => {
        if (request.isLoading === false) {
          if (request.error) {
            this.schedule = undefined;
          } else {
            this.schedule = request.data;
          }
        }
      }),
      shareReplay(1),
      takeUntil(this._destroy$),
    );

    this.hasPermissionToToggleScheduleStatus = this.usersService.hasCurrentUserPermission(
      AccessControlPermission.PowerSchedule_Edit,
    );
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  isPast(item: PowerSchedule): boolean {
    const interval = {
      start: new Date(item.applicableRange.from),
      end: new Date(item.applicableRange.to),
    };

    return this._clock.getZonedPositionInTimeForInterval(interval, item.plantTimeZone) === 'past';
  }

  onEnableSchedule(schedule: PowerSchedule) {
    this.handleToggleSchedule(schedule, 'enable');
  }

  onDisableSchedule(schedule: PowerSchedule) {
    this.handleToggleSchedule(schedule, 'disable');
  }

  private handleToggleSchedule(schedule: PowerSchedule, action: 'enable' | 'disable') {
    let title = '';

    switch (action) {
      case 'enable':
        title = 'Enable ' + schedule.file.name;
        break;

      case 'disable':
        title = 'Disable ' + schedule.file.name;
        break;

      default:
        'Schedule assignemnt';
    }

    const modal = this.modal.create<
      PowerScheduleToggleConfirmModalComponent,
      PowerScheduleToggleConfirmModalComponent_Data,
      PowerScheduleToggleConfirmModalComponent_Result
    >({
      nzTitle: title,
      nzContent: PowerScheduleToggleConfirmModalComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        action,
        schedule,
      },
      nzFooter: null,
      nzBodyStyle: {
        padding: '0',
      },
    });

    modal.afterClose.subscribe((result) => {
      if (result?.updatedSchedule) {
        this.schedule = result.updatedSchedule;
        this.powerScheduleSyncService.listNeedsUpdate$.next(this.schedule.plantId);
      } else if (
        modal.componentInstance?.requestSubscription &&
        !modal.componentInstance.requestSubscription.closed
      ) {
        // If modal is closed via close button or click on backdrop,
        // the result from an ongoing HTTP request will not be handled,
        // so we update the list and the visible schedule to cover that case.

        this.powerScheduleSyncService.listNeedsUpdate$.next(
          modal.componentInstance.data.schedule.plantId,
        );
        this.scheduleNeedsUpdate$.next(true);
      }
    });
  }

  onDownloadFile(name: string) {
    this.queryParams$
      .pipe(
        take(1),
        switchMap((params) => this.api.fetchPowerScheduleFile(params.plantId, params.scheduleId)),
      )
      .subscribe((request: DataRequest<Blob | null>) => {
        if (request.data) {
          saveFile(request.data, name);
        }
      });
  }
}
