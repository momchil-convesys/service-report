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
import { MonbatApiService } from '../_data/api.service';
import { MonbatSchedule } from '../_data/models';
import { MonbatService } from '../_data/monbat-sync.service';

import { saveFile } from '../../../helpers';
import {
  MonbatToggleConfirmModalComponent,
  MonbatToggleConfirmModalComponent_Data,
  MonbatToggleConfirmModalComponent_Result,
} from './monbat-toggle-confirm-modal/monbat-toggle-confirm-modal.component';

interface QueryParams {
  plantId: string;
  deviceId: string;
  scheduleId: string;
}

@Component({
  selector: 'app-monbat-detail-page',
  templateUrl: './monbat-detail-page.component.html',
  styleUrls: ['./monbat-detail-page.component.less'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
  providers: [MonbatApiService],
})
export class MonbatDetailPageComponent {
  scheduleRequest$: Observable<DataRequest<MonbatSchedule>>;
  queryParams$: Observable<QueryParams>;

  schedule: MonbatSchedule | undefined;
  activeMessage: NzMessageRef | undefined;

  hasPermissionToToggleScheduleStatus: boolean;

  scheduleNeedsUpdate$ = new BehaviorSubject<boolean>(true);

  constructor(
    route: ActivatedRoute,
    private api: MonbatApiService,
    private monbatService: MonbatService,
    private usersService: UsersService,
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
  ) {
    this.queryParams$ = route.paramMap.pipe(
      map((params: ParamMap) => ({
        plantId: params.get('plantId') || 'INVALID_ROUTE_PARAMETER',
        deviceId: params.get('deviceId') || 'INVALID_ROUTE_PARAMETER',
        scheduleId: params.get('scheduleId') || 'INVALID_ROUTE_PARAMETER',
      })),
      shareReplay(1),
    );

    this.scheduleRequest$ = combineLatest([this.queryParams$, this.scheduleNeedsUpdate$]).pipe(
      switchMap(([params, _]: [QueryParams, any]) =>
        api.fetchPowerLimitSchedule(params.plantId, params.deviceId, params.scheduleId),
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

  onEnableSchedule(schedule: MonbatSchedule) {
    this.handleToggleSchedule(schedule, 'enable');
  }

  onDisableSchedule(schedule: MonbatSchedule) {
    this.handleToggleSchedule(schedule, 'disable');
  }

  private handleToggleSchedule(schedule: MonbatSchedule, action: 'enable' | 'disable') {
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
      MonbatToggleConfirmModalComponent,
      MonbatToggleConfirmModalComponent_Data,
      MonbatToggleConfirmModalComponent_Result
    >({
      nzTitle: title,
      nzContent: MonbatToggleConfirmModalComponent,
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
        this.monbatService.listNeedsUpdate$.next(this.schedule.plantId);
      } else if (
        modal.componentInstance?.requestSubscription &&
        !modal.componentInstance.requestSubscription.closed
      ) {
        // If modal is closed via close button or click on backdrop,
        // the result from an ongoing HTTP request will not be handled,
        // so we update the list and the visible schedule to cover that case.

        this.monbatService.listNeedsUpdate$.next(modal.componentInstance.data.schedule.plantId);
        this.scheduleNeedsUpdate$.next(true);
      }
    });
  }

  onDownloadFile(name: string) {
    this.queryParams$
      .pipe(
        take(1),
        switchMap((params) =>
          this.api.fetchPowerLimitScheduleFile(params.plantId, params.deviceId, params.scheduleId),
        ),
      )
      .subscribe((request: DataRequest<Blob | null>) => {
        if (request.data) {
          saveFile(request.data, name);
        }
      });
  }
}
