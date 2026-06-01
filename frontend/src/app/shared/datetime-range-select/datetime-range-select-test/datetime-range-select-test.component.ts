import { AsyncPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { endOfDay, startOfDay } from 'date-fns';
import { getTimezoneOffset } from 'date-fns-tz';
import { Observable, ReplaySubject, scan } from 'rxjs';
import { utcToZonedTimeSafe, zonedTimeToUtcSafe } from 'src/app/helpers';
import { DatetimeRangeSelectComponent } from '../datetime-range-select.component';
import { DatetimeRangeModel } from '../models';

@Component({
  selector: 'app-datetime-range-select-test',
  imports: [DatetimeRangeSelectComponent, DatePipe, AsyncPipe],
  templateUrl: './datetime-range-select-test.component.html',
  styleUrl: './datetime-range-select-test.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatetimeRangeSelectTestComponent {
  private _selectedDatetimeRange$ = new ReplaySubject<DatetimeRangeModel>(5);
  selectedDatetimeRange$: Observable<DatetimeRangeModel[]>;

  userTimeZone: string;
  userTimeZoneOffset: number;
  nowInUserTimeZone: Date;
  nowInUserTimeZoneISO: string;

  plantTimeZone: string;
  plantTimeZoneOffset: number;
  nowInPlantTimeZone: Date;
  nowInPlantTimeZoneISO: string;

  constructor() {
    this.selectedDatetimeRange$ = this._selectedDatetimeRange$.pipe(
      scan((acc: DatetimeRangeModel[], value) => {
        if (acc.length == 0) {
          acc = [];
        }

        return [value, ...acc];
      }, []),
    );

    this.userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.userTimeZoneOffset = getTimezoneOffset(this.userTimeZone);

    this.nowInUserTimeZone = new Date();
    this.nowInUserTimeZoneISO = this.nowInUserTimeZone.toISOString();

    this.plantTimeZone = 'Europe/Sofia';
    this.plantTimeZoneOffset = getTimezoneOffset(this.plantTimeZone);

    this.nowInPlantTimeZone = utcToZonedTimeSafe(this.nowInUserTimeZone, this.plantTimeZone);
    this.nowInPlantTimeZoneISO =
      zonedTimeToUtcSafe(startOfDay(this.nowInPlantTimeZone), this.plantTimeZone).toISOString() +
      '–' +
      zonedTimeToUtcSafe(endOfDay(this.nowInPlantTimeZone), this.plantTimeZone).toISOString();
  }

  onChange(value: DatetimeRangeModel) {
    this._selectedDatetimeRange$.next(value);
  }
}
