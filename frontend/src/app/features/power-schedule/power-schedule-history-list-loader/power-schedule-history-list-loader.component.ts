import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Observable,
  combineLatest,
  debounceTime,
  filter,
  map,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';
import { DataRequest } from '../../../constants';
import { PowerScheduleApiService } from '../_data/api.service';
import { PowerSchedule } from '../_data/models';
import { PowerScheduleSyncService } from '../_data/power-schedule-sync.service';

interface QueryParams {
  plantId: string;
  pageSize: number;
  pageIndex: number;
}

@Component({
  selector: 'app-power-schedule-history-list-loader',
  templateUrl: './power-schedule-history-list-loader.component.html',
  styleUrls: ['./power-schedule-history-list-loader.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
  providers: [PowerScheduleApiService],
})
export class PowerScheduleHistoryListLoaderComponent {
  schedulesRequest$: Observable<DataRequest<PowerSchedule[]>>;
  schedules$: Observable<PowerSchedule[]>;

  pageIndex = 1;
  pageSize = 5;
  totalCount = 0;

  constructor(
    private api: PowerScheduleApiService,
    private powerScheduleSyncService: PowerScheduleSyncService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.schedulesRequest$ = combineLatest([
      this.powerScheduleSyncService.listNeedsUpdate$,
      this.route.paramMap,
      this.route.queryParamMap,
    ]).pipe(
      debounceTime(100),
      map(
        ([, params, queryParams]) =>
          <QueryParams>{
            plantId: params.get('plantId') || 'INVALID_PLANT_ID',
            pageSize: Number(queryParams.get('pageSize') || 5),
            pageIndex: Number(queryParams.get('pageIndex') || 1),
          },
      ),
      switchMap((queryParams: QueryParams) =>
        this.api
          .fetchPowerSchedules(
            queryParams.plantId,
            queryParams.pageIndex,
            queryParams.pageSize,
          )
          .pipe(
            tap((request) => {
              if (request.isLoading === false) {
                this.powerScheduleSyncService.resetFileList$.next(queryParams.plantId);

                this.totalCount = request.listMetadata
                  ? request.listMetadata.totalCount
                  : request.data?.length || 0;

                this.pageIndex = queryParams.pageIndex;
                this.pageSize = queryParams.pageSize;
              }
            }),
          ),
      ),
      shareReplay(1),
      takeUntilDestroyed(),
    );

    this.schedules$ = this.schedulesRequest$.pipe(
      filter((request) => request.isLoading === false),
      map((request) => request.data || []),
    );
  }

  onPageIndexChange(index: number) {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { pageIndex: index },
      queryParamsHandling: 'merge',
    });
  }
}

