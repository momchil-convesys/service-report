import { Injectable } from '@angular/core';

import { distinctUntilChanged, Observable, ReplaySubject } from 'rxjs';
import {
  DatetimeRangeModel,
  isSameDatetimeRange,
} from '../../../shared/datetime-range-select/models';

@Injectable()
export class DatetimeRangeSyncService {
  targetRange$: ReplaySubject<DatetimeRangeModel> = new ReplaySubject(1);

  onDatetimeRangeChange(value: DatetimeRangeModel) {
    this.targetRange$.next(value);
  }

  getTargetRange(): Observable<DatetimeRangeModel> {
    return this.targetRange$.pipe(distinctUntilChanged(isSameDatetimeRange));
  }
}
