import { FormatWidth, getLocaleDateFormat } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { isAfter } from 'date-fns';
import { APP_LOCALE_ID } from '../../app-locale';
import {
  PredefinedTimeRange,
  defaultPrefefinedTimeranges,
  predefinedTimeRangeLabels,
} from '../../constants';
import {
  getPredefinedRanges,
  getPredefinedRangesNotRounded,
  utcToZonedTimeSafe,
  zonedTimeToUtcSafe,
} from '../../helpers';

@Component({
  selector: 'app-datetime-range-filter',
  templateUrl: './datetime-range-filter.component.html',
  styleUrls: ['./datetime-range-filter.component.less'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class DatetimeRangeFilterComponent implements OnChanges {
  @Input() initialRange: Date[] | string | undefined | null;
  @Input() size: 'large' | 'small' | 'default' = 'default';
  @Input() predefinedRanges: PredefinedTimeRange[] = defaultPrefefinedTimeranges;
  @Input() showTime = false;
  @Input() rounded = true;
  @Input() nullButtonTitle: string | undefined;
  @Input() timeZone: string | undefined;

  rangeLabels = predefinedTimeRangeLabels;

  @Output() rangeChange = new EventEmitter<Date[]>();
  @Output() predefinedRangeChange = new EventEmitter<PredefinedTimeRange>();

  ranges: { [predefinedRangeValue in PredefinedTimeRange]: Date[] } = getPredefinedRanges();

  selectedPredefinedRange: PredefinedTimeRange | null | undefined;
  selectedRange: Date[] | undefined;

  constructor() {
    this._updateRanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.initialRange === null || this.initialRange === undefined) {
      this.selectedRange = undefined;
      this.selectedPredefinedRange = this.initialRange as null | undefined;
    } else {
      if (this.initialRange.constructor.name === 'String') {
        this._selectPredefinedRange(<PredefinedTimeRange>this.initialRange, this.timeZone);
      } else {
        this._selectRange(<Date[]>this.initialRange, this.timeZone);
      }
    }
  }

  onChange(range: Date[]): void {
    this._selectRange(range, undefined);

    const convertedRange = [
      zonedTimeToUtcSafe(range[0], this.timeZone),
      zonedTimeToUtcSafe(range[1], this.timeZone),
    ];

    this.rangeChange.emit(convertedRange);
  }

  onChangePredefinedRange(predefinedRangeValue: PredefinedTimeRange) {
    this._selectPredefinedRange(predefinedRangeValue, undefined);
    this.predefinedRangeChange.emit(predefinedRangeValue);
  }

  isDisabledDate(current: Date) {
    return isAfter(current, new Date());
  }

  getFormatWithTime() {
    // Target: 'd MMM y, HH:mm'
    // TODO: find alternative with Intl DateTimeFormat
    const format = getLocaleDateFormat(APP_LOCALE_ID, FormatWidth.Medium);
    return `${format}, HH:mm`;
  }

  private _selectRange(range: Date[], timeZone: string | undefined) {
    const convertedRange = [
      utcToZonedTimeSafe(range[0], timeZone),
      utcToZonedTimeSafe(range[1], timeZone),
    ];

    this.selectedRange = convertedRange;
    this.selectedPredefinedRange = undefined;
  }

  private _selectPredefinedRange(
    predefinedRangeValue: PredefinedTimeRange,
    timeZone: string | undefined,
  ) {
    this._updateRanges();

    const range: Date[] | undefined = this.ranges[predefinedRangeValue];

    if (range) {
      this.selectedRange = [
        utcToZonedTimeSafe(range[0], timeZone),
        utcToZonedTimeSafe(range[1], timeZone),
      ];
    } else {
      this.selectedRange = undefined;
    }

    this.selectedPredefinedRange = predefinedRangeValue;
  }

  private _updateRanges() {
    this.ranges = this.rounded ? getPredefinedRanges() : getPredefinedRangesNotRounded();
  }
}
