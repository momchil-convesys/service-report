import { Component, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest, map, shareReplay, switchMap, tap } from 'rxjs';
import { AlarmTriggerType } from '../../../constants';
import { DataRequest } from '../../../constants/_to-sort';
import { AlarmEventsService } from '../_data/data.service';
import { AlarmEvent } from '../_data/models';

interface QueryParams {
  pageSize: number;
  pageIndex: number;
  deviceIds: string[];
  alarmTypes: AlarmTriggerType[];
  triggerId?: string;
  triggerType?: AlarmTriggerType;
}

@Component({
  selector: 'app-alarm-event-list-page',
  templateUrl: './alarm-event-list-page.component.html',
  styleUrls: ['./alarm-event-list-page.component.less'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class AlarmEventListPageComponent {
  alarmEventsRequest$: Observable<DataRequest<AlarmEvent[]>> | undefined;

  queryParameters$: Observable<QueryParams>;

  pageSize = 10;
  pageIndex = 1;
  totalCount = 0;

  selectedDeviceIds: string[] = [];
  selectedAlarmTypes: AlarmTriggerType[] | undefined;

  unseenAlarmEvents$: Observable<AlarmEvent[]> | undefined;

  sidebarVisible = false;

  constructor(
    private dataService: AlarmEventsService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.unseenAlarmEvents$ = this.dataService.unseenAlarmEvents$;
    this.dataService.markAllAsSeen();

    this.queryParameters$ = combineLatest([this.route.paramMap, this.route.queryParamMap]).pipe(
      map(([params, queryParams]) => {
        const result: QueryParams = {
          pageSize: Number(queryParams.get('pageSize') || this.pageSize),
          pageIndex: Number(queryParams.get('pageIndex') || 1),
          deviceIds: queryParams.getAll('deviceId') || [],
          alarmTypes: (queryParams.getAll('alarmType') as AlarmTriggerType[]) || [],
          triggerId: queryParams.get('triggerId') || undefined,
          triggerType: (queryParams.get('triggerType') as AlarmTriggerType) || undefined,
        };

        return result;
      }),
      shareReplay(1),
    );

    this.alarmEventsRequest$ = this.queryParameters$.pipe(
      switchMap((queryParams: QueryParams) => {
        return this.dataService
          .getAlarmEvents(
            queryParams.pageIndex,
            queryParams.pageSize,
            queryParams.deviceIds,
            queryParams.alarmTypes,
            queryParams.triggerId && queryParams.triggerType
              ? {
                  id: queryParams.triggerId,
                  type: queryParams.triggerType,
                }
              : undefined,
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

  // TODO: define string names for query params on router navigate

  onPageIndexChange(index: number) {
    void this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams: { pageIndex: index },
        queryParamsHandling: 'merge',
      })
      .then(() => this._scrollToTopOfTheList());
  }

  onEventTypeChange(alarmTypes: AlarmTriggerType[]) {
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

  onShowUnseen() {
    this.dataService.markAllAsSeen();

    void this.router
      .navigate([], {
        relativeTo: this.route,

        // Passing current time ensures the route will be reloaded and data will be fetched
        queryParams: { updateTime: new Date().getTime() },
      })
      .then(() => this._scrollToTopOfTheList());
  }

  onRemoveFilterByTrigger(currentQueryParams: QueryParams) {
    void this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams: {
          pageIndex: currentQueryParams.pageIndex,
          triggerId: null,
          triggerType: null,
        },
        queryParamsHandling: 'merge',
      })
      .then(() => this._scrollToTopOfTheList());
  }

  onCloseSidebar() {
    this.sidebarVisible = false;
  }

  onShowSidebar() {
    this.sidebarVisible = true;
  }

  private _scrollToTopOfTheList() {
    const top = document.getElementById('top-of-list');
    if (top !== null) {
      top.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  }
}
