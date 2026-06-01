import { Injectable } from '@angular/core';
import { interval, map, Observable, of, shareReplay, startWith } from 'rxjs';
import { ONE_MINUTE, ONE_SECOND } from '../../constants';

const STALE_DATA_THRESHOLD = ONE_MINUTE * 3;

@Injectable({
  providedIn: 'root',
})
export class StaleDataService {
  private interval$ = interval(ONE_SECOND * 15).pipe(
    startWith(0),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  isStaleData(
    timestamp: string | undefined,
    threshold: number = STALE_DATA_THRESHOLD,
  ): Observable<boolean> {
    if (!timestamp) return of(false);

    return this.interval$.pipe(
      map(() => {
        const now = new Date();
        const lastUpdate = new Date(timestamp);

        return now.getTime() - lastUpdate.getTime() > threshold;
      }),
    );
  }
}
