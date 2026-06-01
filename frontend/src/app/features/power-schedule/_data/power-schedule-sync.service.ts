import { Injectable } from '@angular/core';
import { BehaviorSubject, debounceTime, Subject, takeUntil } from 'rxjs';

@Injectable()
export class PowerScheduleSyncService {
  private _destroy$ = new Subject<void>();

  listNeedsUpdate$ = new BehaviorSubject<string | undefined>(undefined); // plantId
  resetFileList$ = new Subject<string>(); // plantId

  private _scheduleStatusMayHaveChanged$ = new Subject<void>();

  get scheduleStatusMayHaveChanged$() {
    return this._scheduleStatusMayHaveChanged$.pipe(debounceTime(1000), takeUntil(this._destroy$));
  }

  broadcastThatScheduleStatusMayHaveChanged() {
    this._scheduleStatusMayHaveChanged$.next();
  }

  constructor() {
    this.scheduleStatusMayHaveChanged$.subscribe(() => {
      this.listNeedsUpdate$.next(undefined);
    });
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
