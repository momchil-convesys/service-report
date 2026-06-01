import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { NzMessageRef } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  map,
  shareReplay,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { AccessControlPermission, DataRequest } from '../../../constants';
import { UsersService } from '../../../data/services/users.service';
import { saveFile } from '../../../helpers';
import { PowerLimitScheduleApiService } from '../_data/api.service';
import { PowerLimitSchedule } from '../_data/models';
import { PlsService } from '../_data/pls-sync.service';
import { positionInTime } from '../helpers';
import {
  PlsToggleConfirmModalComponent,
  PlsToggleConfirmModalComponent_Data,
  PlsToggleConfirmModalComponent_Result,
} from './pls-toggle-confirm-modal/pls-toggle-confirm-modal.component';

interface QueryParams {
  plantId: string;
  scheduleId: string;
}

@Component({
  selector: 'app-pls-detail-page',
  templateUrl: './pls-detail-page.component.html',
  styleUrls: ['./pls-detail-page.component.less'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
  providers: [PowerLimitScheduleApiService],
})
export class PlsDetailPageComponent {
  scheduleRequest$: Observable<DataRequest<PowerLimitSchedule>>;
  queryParams$: Observable<QueryParams>;

  schedule: PowerLimitSchedule | undefined;
  activeMessage: NzMessageRef | undefined;

  hasPermissionToToggleScheduleStatus: boolean;

  scheduleNeedsUpdate$ = new BehaviorSubject<boolean>(true);

  constructor(
    route: ActivatedRoute,
    private api: PowerLimitScheduleApiService,
    private plsService: PlsService,
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

    this.scheduleRequest$ = combineLatest([this.queryParams$, this.scheduleNeedsUpdate$]).pipe(
      switchMap(([params, _]: [QueryParams, any]) =>
        api.fetchPowerLimitSchedule(params.plantId, params.scheduleId),
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
    );

    this.hasPermissionToToggleScheduleStatus = this.usersService.hasCurrentUserPermission(
      AccessControlPermission.PowerLimitSchedule_Edit,
    );
  }

  isPast(item: PowerLimitSchedule): boolean {
    return positionInTime(item) === 'past';
  }

  onEnableSchedule(schedule: PowerLimitSchedule) {
    this.handleToggleSchedule(schedule, 'enable');
  }

  onDisableSchedule(schedule: PowerLimitSchedule) {
    this.handleToggleSchedule(schedule, 'disable');
  }

  private handleToggleSchedule(schedule: PowerLimitSchedule, action: 'enable' | 'disable') {
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
      PlsToggleConfirmModalComponent,
      PlsToggleConfirmModalComponent_Data,
      PlsToggleConfirmModalComponent_Result
    >({
      nzTitle: title,
      nzContent: PlsToggleConfirmModalComponent,
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
        this.plsService.listNeedsUpdate$.next(this.schedule.plantId);
      } else if (
        modal.componentInstance?.requestSubscription &&
        !modal.componentInstance.requestSubscription.closed
      ) {
        // If modal is closed via close button or click on backdrop,
        // the result from an ongoing HTTP request will not be handled,
        // so we update the list and the visible schedule to cover that case.

        this.plsService.listNeedsUpdate$.next(modal.componentInstance.data.schedule.plantId);
        this.scheduleNeedsUpdate$.next(true);
      }
    });
  }

  onDownloadFile(name: string) {
    this.queryParams$
      .pipe(
        take(1),
        switchMap((params) =>
          this.api.fetchPowerLimitScheduleFile(params.plantId, params.scheduleId),
        ),
      )
      .subscribe((request: DataRequest<Blob | null>) => {
        if (request.data) {
          saveFile(request.data, name);
        }
      });
  }
}
