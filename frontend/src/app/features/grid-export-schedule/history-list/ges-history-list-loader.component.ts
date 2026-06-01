import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
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
import { GridExportSchedule_ForDay } from '../_data/models/grid-export-schedule.model';
import { GridExportScheduleDataService } from '../_data/services/data.service';
import { GridExportScheduleSyncService } from '../_data/services/sync.service';

interface QueryParams {
  plantId: string;
  pageSize: number;
  pageIndex: number;
}

@Component({
  selector: 'app-ges-history-list-loader',
  templateUrl: './ges-history-list-loader.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class GesHistoryListLoaderComponent {
  schedulesRequest$: Observable<DataRequest<GridExportSchedule_ForDay[]>>;
  schedules$: Observable<GridExportSchedule_ForDay[]>;

  pageIndex = 1;
  pageSize = 5;
  totalCount = 0;

  constructor(
    private dataService: GridExportScheduleDataService,
    private syncService: GridExportScheduleSyncService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.schedulesRequest$ = combineLatest([
      this.syncService.listNeedsUpdate$,
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
        this.dataService
          .getGridExportSchedules(queryParams.plantId, queryParams.pageIndex, queryParams.pageSize)
          .pipe(
            tap((request) => {
              if (request.isLoading === false) {
                this.syncService.resetFileList$.next(queryParams.plantId);

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
