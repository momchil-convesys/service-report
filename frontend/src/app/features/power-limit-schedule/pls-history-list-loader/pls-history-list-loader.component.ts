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
import { PowerLimitScheduleApiService } from '../_data/api.service';
import { PowerLimitSchedule } from '../_data/models';
import { PlsService } from '../_data/pls-sync.service';

interface QueryParams {
  plantId: string;
  pageSize: number;
  pageIndex: number;
}

@Component({
  selector: 'app-pls-history-list-loader',
  templateUrl: './pls-history-list-loader.component.html',
  styleUrls: ['./pls-history-list-loader.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
  providers: [PowerLimitScheduleApiService],
})
export class PlsHistoryListLoaderComponent {
  schedulesRequest$: Observable<DataRequest<PowerLimitSchedule[]>>;
  schedules$: Observable<PowerLimitSchedule[]>;

  pageIndex = 1;
  pageSize = 5;
  totalCount = 0;

  constructor(
    private api: PowerLimitScheduleApiService,
    private plsService: PlsService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.schedulesRequest$ = combineLatest([
      this.plsService.listNeedsUpdate$,
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
          .fetchPowerLimitSchedules(
            queryParams.plantId,
            queryParams.pageIndex,
            queryParams.pageSize,
          )
          .pipe(
            tap((request) => {
              if (request.isLoading === false) {
                this.plsService.resetFileList$.next(queryParams.plantId);

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
