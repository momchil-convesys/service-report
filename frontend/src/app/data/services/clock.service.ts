import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  catchError,
  distinctUntilChanged,
  interval,
  map,
  of,
} from 'rxjs';

import { isAfter, isBefore } from 'date-fns';
import { ONE_MINUTE, ONE_SECOND, PositionInTime } from '../../constants';
import { utcToZonedTimeSafe } from '../../helpers';
import { ApiService } from '../api';
import { PageVisibilityService } from './page-visibility.service';

@Injectable({
  providedIn: 'root',
})
export class ClockService {
  private serverTimeAtSync = new Date().getTime();
  private clientPerfAtSync = performance.now();

  private _time$ = new BehaviorSubject<Date>(new Date());

  readonly tick$: Observable<void>;

  constructor(
    private apiService: ApiService,
    private visibilityService: PageVisibilityService,
  ) {
    this.sync();
    this.startClock();
    this.visibilityService.pageVisible.subscribe(() => this.sync());

    interval(ONE_MINUTE * 5).subscribe(() => this.sync());

    this.tick$ = this.createTick(ONE_SECOND);
  }

  get time$(): Observable<Date> {
    return this._time$.asObservable();
  }

  private sync() {
    this.apiService.http
      .get<number>(`${this.apiService.baseUrl}/time`)
      .pipe(
        catchError(() => {
          console.warn('ClockService | Error fetching server time. Falling back to client time.');
          return of(new Date().getTime());
        }),
      )
      .subscribe((epochMs) => {
        this.serverTimeAtSync = epochMs;
        this.clientPerfAtSync = performance.now();
      });
  }

  /** Get current server time (computed from stored reference) */
  private getCurrentTime(): number {
    const elapsed = performance.now() - this.clientPerfAtSync;
    return this.serverTimeAtSync + elapsed; // number (ms)
  }

  private startClock() {
    interval(250) // 4 fps
      .pipe(
        // We do not care about milliseconds,
        // emit only when seconds change to avoid unnecessary updates.
        map(() => Math.floor(this.getCurrentTime() / 1000)),
        distinctUntilChanged(),
      )
      .subscribe((unixSec) => {
        this._time$.next(new Date(unixSec * 1000)); // emit ms again if desired
      });
  }

  /** Factory for tick streams */
  private createTick(ms: number): Observable<void> {
    return this.time$.pipe(
      map((date) => Math.floor(date.getTime() / ms)),
      distinctUntilChanged(),
      map(() => undefined),
    );
  }

  getZonedPositionInTimeForInterval(
    interval: Interval,
    timeZone: string | undefined,
  ): PositionInTime {
    const now = this.getCurrentTime();
    const nowInTimeZone = utcToZonedTimeSafe(new Date(now), timeZone);

    if (isBefore(nowInTimeZone, interval.start)) {
      return 'future';
    }

    if (isAfter(nowInTimeZone, interval.end)) {
      return 'past';
    }

    return 'present';
  }
}
