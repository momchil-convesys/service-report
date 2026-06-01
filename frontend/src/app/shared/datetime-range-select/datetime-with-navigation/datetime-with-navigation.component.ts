import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  differenceInCalendarDays,
  isSameDay,
  isSameMonth,
  isSameWeek,
  isSameYear,
  isToday,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from 'date-fns';

import { NzButtonComponent, NzButtonSize } from 'ng-zorro-antd/button';
import { NzDateMode, NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzIconModule } from 'ng-zorro-antd/icon';
import {
  BehaviorSubject,
  Observable,
  delay,
  distinctUntilChanged,
  filter,
  throttleTime,
} from 'rxjs';
import { getLocaleFormatForWeekStartInDatePicker } from '../../../app-locale';
import { utcToZonedTimeSafe, zonedTimeToUtcSafe } from '../../../helpers';

type CalendarNav = 'back' | 'forward' | 'last';

@Component({
  selector: 'app-datetime-with-navigation',
  imports: [NzDatePickerModule, FormsModule, AsyncPipe, NzButtonComponent, NzIconModule],
  templateUrl: './datetime-with-navigation.component.html',
  styleUrl: './datetime-with-navigation.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatetimeWithNavigationComponent implements OnChanges {
  // Control date change from outside
  @Input() date: Date | null = null;
  @Input() mode: NzDateMode = 'date';
  @Input() size: NzButtonSize = 'default';
  @Input() timeZone: string | undefined;
  @Input() disabled = false;
  @Output() dateChange = new EventEmitter<Date>();

  private _targetDate$: BehaviorSubject<Date | null>;
  targetDate$: Observable<Date>;

  get dateFormatForCurrentMode() {
    switch (this.mode) {
      case 'date':
        return 'mediumDate';

      case 'week':
        const fromString = $localize`From`;

        const format = getLocaleFormatForWeekStartInDatePicker();
        return `'${fromString}' ${format}`;

      case 'month':
        return 'MMMM y';

      case 'year':
        return 'y';

      default:
        return 'mediumDate';
    }
  }

  constructor() {
    this._targetDate$ = new BehaviorSubject<Date | null>(null);

    this.targetDate$ = this._targetDate$.pipe(
      filter((date: Date | null): date is Date => date !== null),
      distinctUntilChanged((d1, d2) => isSameDay(d1, d2)),
    );

    this.targetDate$
      .pipe(
        /**
         * delay(0) will allow consumming component
         * to receive initial dateChange event,
         * which otherwise is fired too early
         */
        delay(0),
        /**
         * throttleTime fixes infinite loop caused by too frequent calendar navigation clicks.
         * This will only emit the first and last click event within the 1 second window.
         */
        throttleTime(1000, undefined, { leading: true, trailing: true }),
        takeUntilDestroyed(),
      )
      .subscribe((date) => {
        const convertedDate = zonedTimeToUtcSafe(date, this.timeZone);

        if (convertedDate.getTime() === this.date?.getTime()) {
          // Do not emit model change
          return;
        }

        this.dateChange.next(convertedDate);
      });
  }

  ngOnChanges(): void {
    if (this.date) {
      const convertedDate = utcToZonedTimeSafe(this.date, this.timeZone);

      this._targetDate$.next(convertedDate);
    }
  }

  disabledDate = (current: Date): boolean => {
    const dateToCompare = utcToZonedTimeSafe(new Date(), this.timeZone);
    return differenceInCalendarDays(current, dateToCompare) > 0;
  };

  onDateChange(date: Date) {
    this._targetDate$.next(date);
  }

  onCalendarNavigation(nav: CalendarNav) {
    const currentValue = this._targetDate$.getValue();
    if (!currentValue) {
      return;
    }

    this._targetDate$.next(this._targetDateForCalendarNav(nav, currentValue));
  }

  isCalendarNavigationDisabled(nav: CalendarNav) {
    let currentDate = this._targetDate$.getValue();
    if (!currentDate) {
      return false;
    }

    const dateToCompare = currentDate;
    const nowConverted = utcToZonedTimeSafe(new Date(), this.timeZone);

    if (nav === 'forward' || nav === 'last') {
      switch (this.mode) {
        case 'date':
          return isSameDay(dateToCompare, nowConverted);
        case 'week':
          return isSameWeek(dateToCompare, nowConverted, { weekStartsOn: 1 });
        case 'month':
          return isSameMonth(dateToCompare, nowConverted);
        case 'year':
          return isSameYear(dateToCompare, nowConverted);
      }

      return isToday(dateToCompare);
    }

    return false;
  }

  private _targetDateForCalendarNav(nav: CalendarNav, currentDate: Date): Date {
    let result = currentDate;

    switch (nav) {
      case 'back':
        result = this._subAmountAccordingToCurrentMode(currentDate, 1);
        break;
      case 'forward':
        result = this._addAmountAccordingToCurrentMode(currentDate, 1);
        break;
      case 'last':
        result = utcToZonedTimeSafe(new Date(), this.timeZone);
        break;
    }

    return result;
  }

  private _addAmountAccordingToCurrentMode(date: Date, amount: number): Date {
    const mode: NzDateMode = this.mode;

    switch (mode) {
      case 'date':
        return addDays(date, amount);
      case 'week':
        return addWeeks(date, amount);
      case 'month':
        return addMonths(date, amount);
      case 'year':
        return addYears(date, amount);

      default:
        return date;
    }
  }

  private _subAmountAccordingToCurrentMode(date: Date, amount: number): Date {
    const mode: NzDateMode = this.mode;

    switch (mode) {
      case 'date':
        return subDays(date, amount);
      case 'week':
        return subWeeks(date, amount);
      case 'month':
        return subMonths(date, amount);
      case 'year':
        return subYears(date, amount);

      default:
        return date;
    }
  }
}
