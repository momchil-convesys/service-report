import { Injectable } from '@angular/core';
import { debounceTime, filter, fromEvent, Observable, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PageVisibilityService {
  private readonly _visibilitychange$ = fromEvent(document, 'visibilitychange').pipe(
    debounceTime(1000),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  private readonly _pageVisible$ = this._visibilitychange$.pipe(
    filter(() => document.visibilityState === 'visible'),
  );

  private readonly _pageHidden$ = this._visibilitychange$.pipe(
    filter(() => document.visibilityState === 'hidden'),
  );

  get pageVisible(): Observable<Event> {
    return this._pageVisible$;
  }

  get pageHidden(): Observable<Event> {
    return this._pageHidden$;
  }

  isPageVisible(): boolean {
    return document.visibilityState === 'visible';
  }
}
