import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest, map, shareReplay, switchMap, tap } from 'rxjs';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AlarmTriggerType, DataRequest } from '../../constants';
import { AlarmTriggersService } from './_data/data.service';
import { AlarmConditionFaultRecurrence, AlarmTrigger } from './_data/models';

interface QueryParams {
  pageSize: number;
  pageIndex: number;
  deviceIds: string[];
  alarmTypes: AlarmTriggerType[];
}

@Component({
  selector: 'app-alarms-config',
  templateUrl: './alarms-config.component.html',
  styleUrls: ['./alarms-config.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AlarmsConfigComponent {
  alarmTriggersRequest$: Observable<DataRequest<AlarmTrigger[]>>;
  noDescriprion = $localize`No description provided`;
  AlarmConditionFaultRecurrence: AlarmConditionFaultRecurrence | undefined;

  pageSize = 5;
  pageIndex = 1;
  totalCount = 0;

  selectedDeviceIds: string[] = [];
  selectedAlarmTypes: AlarmTriggerType[] = [];

  sidebarVisible = false;

  constructor(
    private alarmTriggersService: AlarmTriggersService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.alarmTriggersRequest$ = combineLatest([
      this.route.paramMap,
      this.route.queryParamMap,
      this.alarmTriggersService.listNeedsReload$,
    ]).pipe(
      map(
        ([params, queryParams]) =>
          <QueryParams>{
            pageSize: Number(queryParams.get('pageSize') || this.pageSize),
            pageIndex: Number(queryParams.get('pageIndex') || 1),
            deviceIds: queryParams.getAll('deviceId') || [],
            alarmTypes: (queryParams.getAll('alarmType') as AlarmTriggerType[]) || [],
          },
      ),
      switchMap((queryParams: QueryParams) => {
        return this.alarmTriggersService
          .getAlarmTriggers(
            queryParams.pageIndex,
            queryParams.pageSize,
            queryParams.deviceIds,
            queryParams.alarmTypes,
          )
          .pipe(
            // filter((response) => response.data !== undefined),
            tap((response) => {
              if (response.data) {
                this.totalCount = response.listMetadata
                  ? response.listMetadata.totalCount
                  : response.data?.length || 0;
                this.pageIndex = queryParams.pageIndex;
                this.pageSize = queryParams.pageSize;
                this.selectedDeviceIds = queryParams.deviceIds;
                this.selectedAlarmTypes = queryParams.alarmTypes;
              }
            }),
          );
      }),
      shareReplay(1),
      takeUntilDestroyed(),
    );
  }

  onPageIndexChange(index: number) {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { pageIndex: index },
      queryParamsHandling: 'merge',
    });
    // .then(() => this._scrollToTopOfTheList());
  }

  onAlarmTypeChange(alarmTypes: AlarmTriggerType[]) {
    this.totalCount = 0; // Reset pagination as it will change based on filters
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        pageIndex: '1',
        alarmType: alarmTypes,
      },
      queryParamsHandling: 'merge',
    });
  }

  onDevicesSelected(deviceIds: string[]) {
    this.totalCount = 0; // Reset pagination as it will change based on filters
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { pageIndex: '1', deviceId: deviceIds },
      queryParamsHandling: 'merge',
    });
  }

  onCloseSidebar() {
    this.sidebarVisible = false;
  }

  onShowSidebar() {
    this.sidebarVisible = true;
  }
}
