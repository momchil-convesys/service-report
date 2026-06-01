import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, filter, map, shareReplay, switchMap, tap } from 'rxjs';
import { PredefinedTimeRange, predefinedTimeRangeStringValues } from '../../constants';
import { convertPredefinedRange } from '../../helpers';
import { ErrorStacksDataService } from './_data/data.service';
import { ErrorStack } from './_data/error-stack.model';
import { ErrorStacksService } from './error-stacks.service';

interface QueryParams {
  plantId?: string;
  deviceId?: string;
  pageSize: number;
  pageIndex: number;
  currentOnly: boolean;
  deviceSide?: string; // 'master' | 'slave';
  timeRange: Date[] | PredefinedTimeRange | null;
}

@Component({
  selector: 'app-error-stacks-page',
  templateUrl: './error-stacks-page.component.html',
  styleUrls: ['./error-stacks-page.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ErrorStacksService],
  standalone: false,
})
export class ErrorStacksPageComponent {
  constructor(
    private route: ActivatedRoute,
    private data: ErrorStacksDataService,
    public es: ErrorStacksService,
  ) {
    this.es.errorStacksRequest$ = combineLatest([
      this.route.paramMap,
      this.route.queryParamMap,
    ]).pipe(
      map(([params, queryParams]): QueryParams => {
        const rangeFrom = queryParams.get('from');
        const rangeTo = queryParams.get('to');

        let timeRange: Date[] | PredefinedTimeRange | null;

        if (!rangeFrom || !rangeTo) {
          const predefinedRangeParam = queryParams.get('predefinedRange');

          timeRange =
            predefinedRangeParam && predefinedTimeRangeStringValues.includes(predefinedRangeParam)
              ? <PredefinedTimeRange>predefinedRangeParam
              : null;
        } else {
          timeRange = [new Date(rangeFrom), new Date(rangeTo)];
        }

        return {
          plantId: params.get('plantId') || undefined,
          deviceId: params.get('deviceId') || undefined,
          pageSize: Number(queryParams.get('pageSize') || 10),
          pageIndex: Number(queryParams.get('pageIndex') || 1),
          deviceSide: queryParams.get('deviceSide') || undefined,
          currentOnly: (queryParams.get('currentOnly') || 'false').toLocaleLowerCase() === 'true',
          timeRange,
        };
      }),
      tap((queryParams: QueryParams) => {
        this.es.plantId = queryParams.plantId || undefined;
        this.es.deviceId = queryParams.deviceId || undefined;
        this.es.timeRange = queryParams.timeRange;
      }),
      switchMap((queryParams: QueryParams) => {
        let currentOnly: 'true' | 'false' = queryParams.currentOnly ? 'true' : 'false';

        let interval: { from: string; to: string } | undefined;
        if (queryParams.timeRange) {
          const convertedTimeRange = convertPredefinedRange(queryParams.timeRange);
          interval = {
            from: convertedTimeRange[0].toISOString(),
            to: convertedTimeRange[1].toISOString(),
          };
        } else {
          currentOnly = 'true'; // Default filter
        }

        return this.data
          .getErrorStacks(
            queryParams.plantId,
            queryParams.deviceId,
            queryParams.pageIndex,
            queryParams.pageSize,
            {
              ...(queryParams.deviceSide && { deviceSide: queryParams.deviceSide }),
              ...(interval && { from: interval.from, to: interval.to }),
              currentOnly,
            },
          )
          .pipe(
            tap((req) => {
              if (req.isLoading === false) {
                this.es.totalCount = req.listMetadata
                  ? req.listMetadata.totalCount
                  : req.data?.length || 0;

                this.es.pageIndex = queryParams.pageIndex;
                this.es.pageSize = queryParams.pageSize;
                this.es.deviceSide = queryParams.deviceSide;
                this.es.showCurrentFaultsOnly = currentOnly === 'true';
              }
            }),
          );
      }),
      shareReplay(1),
      takeUntilDestroyed(),
    );

    this.es.errorStacks$ = this.es.errorStacksRequest$.pipe(
      filter((request) => request.isLoading === false),
      map((request) => (request.data as ErrorStack[]) || []),
    );

    this.es.hasContent$ = this.es.errorStacks$.pipe(map((data) => data.length > 0));
  }
}
