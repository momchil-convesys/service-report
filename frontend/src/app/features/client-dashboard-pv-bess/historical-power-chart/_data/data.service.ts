import { inject, Injectable } from '@angular/core';
import { isAfter } from 'date-fns';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  filter,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';
import { SSE_EventName } from '../../../../constants';
import { Plant } from '../../../../data/models';
import { generateFileNameForExport_Simplified } from '../../../../helpers';
import { HistoricalPowerApiService } from './api.service';
import {
  filterDuplicateTimestampPoints,
  keepLastPerSecond,
  resolutionForRange,
  resolutionToMilliseconds,
} from './constants';
import { DataPointsBatch } from './interfaces';
import { PVBESSHistoricalPowerData, PVBESSHistoricalPowerData_Point } from './models';

@Injectable()
export class HistoricalPowerDataService {
  private api = inject(HistoricalPowerApiService);
  private _destroy$ = new Subject<void>();

  /**
   * Main range context
   */
  private _mainRangeContext$ = new Subject<{ plant: Plant; range: { from: Date; to: Date } }>();
  private _requestedMainRangeContext: { plant: Plant; range: { from: Date; to: Date } } | undefined;
  private _mainRangeData: PVBESSHistoricalPowerData | undefined;

  /**
   * Sub range context
   */

  private _subRangeContext$ = new Subject<{
    plant: Plant;
    range: { from: Date; to: Date };
  } | null>();
  private _requestedSubRangeContext: { plant: Plant; range: { from: Date; to: Date } } | undefined;
  private _subRangeData: PVBESSHistoricalPowerData | undefined;

  /**
   * Loading and error state for any of the streams.
   */

  private _mainRangeLoading$ = new BehaviorSubject<boolean>(false);
  private _mainRangeError$ = new Subject<Error | undefined>();

  private _subRangeLoading$ = new BehaviorSubject<boolean>(false);
  private _subRangeError$ = new Subject<Error | undefined>();

  get isLoading$(): Observable<boolean> {
    return combineLatest([
      this._mainRangeLoading$.asObservable(),
      this._subRangeLoading$.asObservable(),
    ]).pipe(map(([mainRangeLoading, subRangeLoading]) => mainRangeLoading || subRangeLoading));
  }

  get error$(): Observable<Error | undefined> {
    return combineLatest([
      this._mainRangeError$.asObservable(),
      this._subRangeError$.asObservable(),
    ]).pipe(map(([mainRangeError, subRangeError]) => mainRangeError || subRangeError));
  }

  /**
   * Resulting stream
   */
  pointsStreamChanges$ = new Subject<DataPointsBatch>();

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  setMainRangeContext(plant: Plant, range: { from: Date; to: Date }) {
    this._requestedMainRangeContext = { plant, range };
    this._mainRangeContext$.next({ plant, range });
  }

  setSubRangeContext(context: { plant: Plant; range: { from: Date; to: Date } } | null) {
    if (!context) {
      this._requestedSubRangeContext = undefined;
      this._subRangeContext$.next(null);
      return;
    }

    this._requestedSubRangeContext = context;
    this._subRangeContext$.next(context);
  }

  reemitMainRangeData(): void {
    this.pointsStreamChanges$.next({
      eventName: SSE_EventName.DATA_INIT,
      pointsAdded: this._mainRangeData?.dataPoints ?? [],
      pointsRemoved: [],
      fullData: this._mainRangeData,
      from: this._requestedMainRangeContext?.range.from,
      to: this._requestedMainRangeContext?.range.to,
      isMainRange: true,
      isReemitted: true,
    });
  }

  constructor() {
    this._subRangeContext$
      .pipe(
        switchMap((context) => {
          if (!context) {
            return of(null);
          }

          this._subRangeLoading$.next(true);

          const { plant, range } = context;
          const resolution = resolutionForRange(range.from, range.to);
          return this.api
            .fetchHistoricalPowerData(plant, range.from, range.to, resolution, 'last', true)
            .pipe(
              takeUntil(this._subRangeContext$.pipe(filter((context) => context !== null))),
              takeUntil(this._destroy$),
            );
        }),
        catchError((error) => {
          this._subRangeError$.next(error);
          return of(null);
        }),
        takeUntil(this._destroy$),
      )
      .subscribe((req) => {
        this._subRangeLoading$.next(req?.isLoading ?? false);

        if (!req) {
          this._subRangeError$.next(new Error('No data received'));
          return;
        }

        const result: DataPointsBatch = {
          eventName: req.eventName,
          pointsAdded: [],
          pointsRemoved: [],
          fullData: req.data,
          from: this._requestedSubRangeContext?.range.from,
          to: this._requestedSubRangeContext?.range.to,
          isMainRange: false,
        };

        switch (req.eventName) {
          case SSE_EventName.DATA_INIT:
          case SSE_EventName.DATA_REPLACE: {
            this._subRangeData = req.data;

            if (this._subRangeData) {
              this._subRangeData.pointsToAggregate = [];

              const dataPoints = this._subRangeData.dataPoints;
              if (dataPoints && dataPoints.length > 0) {
                this._subRangeData.lastAggregatedPointTimestamp =
                  dataPoints[dataPoints.length - 1].timestamp;
              }
            }

            result.pointsAdded = req.data?.dataPoints ?? [];

            break;
          }

          case SSE_EventName.DATA_PATCH:
          case SSE_EventName.DATA_APPEND: {
            // These are not applicable for sub range data.
            // Sub range data is forced to be static.
            // We rely on the main stream to receive the updates.

            break;
          }
        }

        result.fullData = this._subRangeData;
        this.pointsStreamChanges$.next(result);
      });

    this._mainRangeContext$
      .pipe(
        switchMap(({ plant, range }) => {
          this._mainRangeLoading$.next(true);

          const resolution = resolutionForRange(range.from, range.to);
          return this.api
            .fetchHistoricalPowerData(plant, range.from, range.to, resolution, 'last')
            .pipe(takeUntil(this._destroy$));
        }),
        catchError((error) => {
          this._mainRangeError$.next(error);
          return of(null);
        }),
        takeUntil(this._destroy$),
      )
      .subscribe((req) => {
        this._mainRangeLoading$.next(req?.isLoading ?? false);

        if (!req) {
          this._mainRangeError$.next(new Error('No data received'));
          return;
        }

        const result: DataPointsBatch = {
          eventName: req.eventName,
          pointsAdded: [],
          pointsRemoved: [],
          fullData: req.data,
          from: this._requestedMainRangeContext?.range.from,
          to: this._requestedMainRangeContext?.range.to,
          isMainRange: true,
        };

        switch (req.eventName) {
          case SSE_EventName.DATA_INIT:
          case SSE_EventName.DATA_REPLACE: {
            this._mainRangeData = req.data;

            if (this._mainRangeData) {
              this._mainRangeData.pointsToAggregate = [];

              const dataPoints = this._mainRangeData.dataPoints;
              if (dataPoints && dataPoints.length > 0) {
                this._mainRangeData.lastAggregatedPointTimestamp =
                  dataPoints[dataPoints.length - 1].timestamp;
              }
            }

            result.pointsAdded = req.data?.dataPoints ?? [];

            break;
          }

          case SSE_EventName.DATA_PATCH: {
            // TODO: Implement if needed
            break;
          }

          case SSE_EventName.DATA_APPEND: {
            if (!this._mainRangeData) {
              console.error(
                'Application error: Received DATA_APPEND event before data is initialized.',
              );

              throw new Error('Main range data is not loaded');
            }

            if (!req.data || req.data?.dataPoints.length <= 0) {
              console.warn(
                'Application warning: Received DATA_APPEND event with no data or new points.',
              );

              break;
            }

            let newPoints: PVBESSHistoricalPowerData_Point[] = keepLastPerSecond(
              req.data.dataPoints,
            );
            const currentData = this._mainRangeData;

            /**
             * Check for reverse order of points.
             * Sometimes points coming from the server are with the same timestamp.
             * This is not allowed and should be rejected.
             */

            let lastPoint = currentData.pointsToAggregate.length
              ? currentData.pointsToAggregate[currentData.pointsToAggregate.length - 1]
              : undefined;

            if (!lastPoint) {
              lastPoint = currentData.dataPoints.length
                ? currentData.dataPoints[currentData.dataPoints.length - 1]
                : undefined;
            }

            newPoints = filterDuplicateTimestampPoints(newPoints, lastPoint);

            if (!newPoints.length) {
              // No good points to append.
              break;
            }

            /**
             * If resolution is 1 second, we can append points directly.
             * NOTE: We check main data resolution here, not subrange!
             */
            if (currentData.res === '1s') {
              currentData.dataPoints.push(...newPoints);
              result.pointsAdded = newPoints;
              break;
            }

            /**
             * For other resolutions, we need to aggregate points.
             */
            currentData.pointsToAggregate.push(...newPoints);
            result.pointsAdded = newPoints;

            /**
             * Use resolution from subrange, so if zoomed near the live range,
             * points are not aggregated. Suspend aggregation.
             * TODO: This may not be ideal if the user has zoomed to a past range.
             */
            let visibleResolution =
              this._requestedSubRangeContext && this._subRangeData
                ? this._subRangeData.res
                : (this._mainRangeData?.res ?? '1m');

            if (visibleResolution !== '1m' && currentData.pointsToAggregate.length < 900) {
              // We can postpone aggregation for now.
              // We will aggregate when we have more points or the user zooms out.
              // 900 is 15 min of 1s data.
              break;
            }

            const currentResolution = currentData.res;

            /**
             * If we still have nothing to aggregate (e.g. newPoints was empty after filtering),
             * there is nothing to do.
             */
            const lastPointInPointsToAggregate: PVBESSHistoricalPowerData_Point | undefined =
              currentData.pointsToAggregate.length > 0
                ? currentData.pointsToAggregate[currentData.pointsToAggregate.length - 1]
                : undefined;

            if (!lastPointInPointsToAggregate) {
              break;
            }

            /**
             * We do not have points yet.
             */
            if (!currentData.lastAggregatedPointTimestamp) {
              if (currentData.dataPoints.length > 0) {
                currentData.lastAggregatedPointTimestamp =
                  currentData.dataPoints[currentData.dataPoints.length - 1].timestamp;
              }

              break;
            }

            /**
             * Check if it is time to aggregate points.
             */
            const resolutionInMilliseconds = resolutionToMilliseconds(currentResolution);

            const lastAggregatedPointTimestamp = currentData.lastAggregatedPointTimestamp;
            const lastAggregatedPointTimestampInMilliseconds =
              lastAggregatedPointTimestamp.getTime();

            const lastPointInPointsToAggregateTimestamp = lastPointInPointsToAggregate.timestamp;
            const lastPointInPointsToAggregateTimestampInMilliseconds =
              lastPointInPointsToAggregateTimestamp.getTime();

            /**
             * Guard: if we are not ahead of lastAggregatedPointTimestamp, we cannot aggregate.
             * This can happen if filtering dropped a bunch of points or the stream is jittery.
             */
            if (
              lastPointInPointsToAggregateTimestampInMilliseconds <=
              lastAggregatedPointTimestampInMilliseconds
            ) {
              break;
            }

            /**
             * No aggregation is needed yet.
             *
             * -1 makes sure we do not include the HH:mm:00.000Z point.
             */
            const millisecondsFromLastAggregation: number =
              lastPointInPointsToAggregateTimestampInMilliseconds -
              lastAggregatedPointTimestampInMilliseconds;

            if (millisecondsFromLastAggregation <= resolutionInMilliseconds - 1) {
              break;
            }

            /**
             * Aggregation is needed.
             */
            const newAggregatedPointTimestamp = new Date(
              lastAggregatedPointTimestampInMilliseconds + resolutionInMilliseconds,
            );

            // split array into two parts: before and after the aggregation boundary
            const beforeBoundary: PVBESSHistoricalPowerData_Point[] =
              currentData.pointsToAggregate.filter(
                (pointToAggregate) =>
                  !isAfter(pointToAggregate.timestamp, newAggregatedPointTimestamp),
              );

            const afterBoundary: PVBESSHistoricalPowerData_Point[] =
              currentData.pointsToAggregate.filter((pointToAggregate) =>
                isAfter(pointToAggregate.timestamp, newAggregatedPointTimestamp),
              );

            /**
             * If beforeBoundary is empty, we cannot build an aggregated point.
             */
            if (beforeBoundary.length === 0) {
              break;
            }

            const aggregatedPoint: PVBESSHistoricalPowerData_Point = {
              ...beforeBoundary[beforeBoundary.length - 1],
              timestamp: newAggregatedPointTimestamp,
            };

            currentData.lastAggregatedPointTimestamp = newAggregatedPointTimestamp;
            currentData.pointsToAggregate = afterBoundary;

            currentData.dataPoints.push(aggregatedPoint);

            result.pointsAdded = [aggregatedPoint];
            result.pointsRemoved = beforeBoundary;

            break;
          }
        }

        // console.log(
        //   'HERE:',
        //   result.pointsAdded.map((p) => p.timestamp.toISOString()),
        //   result.pointsRemoved.length,
        // );

        result.fullData = this._mainRangeData;
        this.pointsStreamChanges$.next(result);
      });
  }

  getFilenameForCurrentlyVisibleRange(): string | undefined {
    const title = $localize`Historical Power Data`;

    if (this._subRangeData && this._requestedSubRangeContext) {
      return generateFileNameForExport_Simplified(
        title,
        this._requestedSubRangeContext.plant,
        this._requestedSubRangeContext.range,
      );
    }

    if (this._mainRangeData && this._requestedMainRangeContext) {
      return generateFileNameForExport_Simplified(
        title,
        this._requestedMainRangeContext.plant,
        this._requestedMainRangeContext.range,
      );
    }

    return title;
  }
}
