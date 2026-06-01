import { inject, Injectable, OnDestroy } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { catchError, map, takeUntil } from 'rxjs/operators';
import { DataRequest } from '../../../../constants';
import { ServerSentEventsService } from '../../../../data/api';
import { handleAnyError } from '../../../../helpers';
import { PvBessLiveMetricsData } from './models';

@Injectable()
export class PvBessLiveMetricsService implements OnDestroy {
  private readonly sse = inject(ServerSentEventsService);
  private readonly destroy$ = new Subject<void>();

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getLiveMetrics(plantId: string): Observable<DataRequest<PvBessLiveMetricsData>> {
    const requestUrl = `/pv-bess-live-metrics?plantId=${plantId}`;
    return this.sse
      .fetch<PvBessLiveMetricsData>(requestUrl, (_, next) => next)
      .pipe(
        map((request) => ({
          isLoading: request.isLoading,
          data: request.data,
          error: request.error,
        })),
        catchError((error: unknown) =>
          of({ isLoading: false, error: handleAnyError(error, undefined) }),
        ),
        takeUntil(this.destroy$),
      );
  }
}
