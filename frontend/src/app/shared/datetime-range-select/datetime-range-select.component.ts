import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from 'date-fns';
import { NzButtonSize } from 'ng-zorro-antd/button';
import { NzDateMode, NzDatePickerModule, NzRangePickerComponent } from 'ng-zorro-antd/date-picker';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { IntegrationPeriod, TypedChange } from '../../constants';
import {
  calculateIntegrationPeriodForTimeRange,
  utcToZonedTimeSafe,
  zonedTimeToUtcSafe,
} from '../../helpers';
import { DatetimeWithNavigationComponent } from './datetime-with-navigation/datetime-with-navigation.component';
import {
  allRangeTypeOptions,
  DatetimeRangeModel,
  DatetimeRangeType,
  RangeTypeOption,
} from './models';

interface ComponentChanges extends SimpleChanges {
  size: TypedChange<NzButtonSize>;
  defaultOption: TypedChange<RangeTypeOption>;
  defaultIntegrationPeriod: TypedChange<IntegrationPeriod | undefined>;
  customRangeTypeOptions: TypedChange<RangeTypeOption[] | null>;
  timeZone: TypedChange<string | undefined>;
  showPredefinedOptions: TypedChange<boolean>;
  initialDate: TypedChange<Date | undefined>;
  showIntegrationPeriod: TypedChange<boolean>;
  model: TypedChange<DatetimeRangeModel | undefined>;
}

@Component({
  selector: 'app-datetime-range-select',
  imports: [DatetimeWithNavigationComponent, NzRadioModule, NzDatePickerModule, FormsModule],
  templateUrl: './datetime-range-select.component.html',
  styleUrl: './datetime-range-select.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatetimeRangeSelectComponent implements OnChanges {
  @Input() size: NzButtonSize = 'default';
  @Input() defaultIntegrationPeriod: IntegrationPeriod | undefined;
  @Input() customRangeTypeOptions: RangeTypeOption[] | null = null;
  @Input() timeZone: string | undefined;
  @Input() showPredefinedOptions = true;
  @Input() initialDate: Date | undefined;
  @Input() showIntegrationPeriod = false;
  @Input() showIntegrationPeriodOneMinute = false;
  @Input() disabled = false;

  /**
   * Default option is required because it triggers initial value emit.
   * TODO: this is more of a workaround,
   * consider optimizing the logic of this component.
   */
  @Input({ required: true }) defaultOption: RangeTypeOption = 'day';

  @Input() model: DatetimeRangeModel | undefined;

  @Output() modelChange = new EventEmitter<DatetimeRangeModel>();

  @HostBinding('class.default-size') get sizeSm() {
    return this.size === 'default';
  }

  @ViewChild('rangePickerRef', {
    read: NzRangePickerComponent,
  })
  rangePickerRef: NzRangePickerComponent | null = null;

  selectedRangeTypeOption: RangeTypeOption = 'day';
  rangeTypeOptions: { label: string; value: RangeTypeOption }[] = allRangeTypeOptions;

  selectedIntegrationPeriodOption: IntegrationPeriod | undefined;

  private _integrationPeriodOptions: { label: string; value: IntegrationPeriod }[] = [
    {
      label: $localize`1 min`,
      value: IntegrationPeriod.Minutes,
    },
    {
      label: $localize`15 min`,
      value: IntegrationPeriod.QuaterOfAnHour,
    },
    {
      label: $localize`1 hour`,
      value: IntegrationPeriod.Hours,
    },
  ];

  get integrationPeriodOptions(): { label: string; value: IntegrationPeriod }[] {
    return this._integrationPeriodOptions.filter((option) => {
      if (
        option.value === IntegrationPeriod.Minutes &&
        this.showIntegrationPeriodOneMinute === false
      ) {
        return false;
      }

      return true;
    });
  }

  singleDatePickerMode: NzDateMode = 'date';
  singleDatePickerModel: Date = new Date();

  dateRangePickerModel: Date[] | undefined;

  get useRangePicker() {
    return this.selectedRangeTypeOption === 'custom-range';
  }

  private _lastValue: DatetimeRangeModel | undefined;
  private _selfId = Math.random();

  ngOnChanges(changes: ComponentChanges) {
    const newValue: DatetimeRangeModel | undefined = changes.model?.currentValue;

    if (newValue && this._selfId !== newValue.pickerId) {
      if (
        newValue.integrationPeriod &&
        newValue.integrationPeriod !== this.selectedIntegrationPeriodOption
      ) {
        if (
          this.integrationPeriodOptions.find(
            (option) => option.value === newValue.integrationPeriod,
          )
        ) {
          this.selectedIntegrationPeriodOption = newValue.integrationPeriod;
        } else {
          this.selectedIntegrationPeriodOption = undefined;
        }
      }

      if (newValue.predefinedRangeTypeOption !== this.selectedRangeTypeOption) {
        this.onRangeTypeOptionChange(newValue.predefinedRangeTypeOption, false);
      }

      if (
        !this.dateRangePickerModel ||
        newValue.from.getTime() !== this.dateRangePickerModel[0]?.getTime() ||
        newValue.to.getTime() !== this.dateRangePickerModel[1]?.getTime()
      ) {
        this.dateRangePickerModel = [newValue.from, newValue.to];
      }

      if (newValue.from.getTime() !== this.singleDatePickerModel.getTime()) {
        this.singleDatePickerModel = newValue.from;
      }
    }

    if (this.customRangeTypeOptions !== null) {
      this.rangeTypeOptions = allRangeTypeOptions.filter(
        (option) =>
          this.customRangeTypeOptions && this.customRangeTypeOptions.indexOf(option.value) >= 0,
      );
    }

    if (changes.defaultOption && changes.defaultOption.firstChange) {
      this.onRangeTypeOptionChange(this.defaultOption);
    }

    if (changes.defaultIntegrationPeriod && changes.defaultIntegrationPeriod.currentValue) {
      this.onIntegrationPeriodOptionChange(changes.defaultIntegrationPeriod.currentValue);
    }
  }

  onRangeTypeOptionChange(rangeTypeOption: RangeTypeOption, shouldOpenPicker = true) {
    this.selectedRangeTypeOption = rangeTypeOption;

    if (rangeTypeOption !== 'custom-range') {
      this.singleDatePickerMode = this._getNzPickerModeForRangeType(rangeTypeOption);

      this._emitFromSingleDate(this.initialDate || new Date());
    } else {
      if (shouldOpenPicker) {
        setTimeout(() => {
          (this.rangePickerRef as any)?.datePicker?.open();
        }, 0);
      }
    }
  }

  onIntegrationPeriodOptionChange(integrationPeriodOption: IntegrationPeriod) {
    this.selectedIntegrationPeriodOption = integrationPeriodOption;

    if (this._lastValue) {
      this.modelChange.next({
        ...this._lastValue,
        integrationPeriod: integrationPeriodOption,
      });
    }
  }

  onSingleDatePickerChange(date: Date) {
    if (isSameDay(this.singleDatePickerModel, date)) {
      return;
    }

    this._emitFromSingleDate(date);
  }

  onDateRangeChange(range: Date[]) {
    this._emitFromDatetimeRange(range);
  }

  private _emitFromSingleDate(date: Date) {
    const timeRange: Date[] = this._constructRangeFromSingleDatePicker(
      date,
      this.singleDatePickerMode,
    );

    this.singleDatePickerModel = timeRange[0];

    this._constructOutputAndEmit(timeRange, 'date-range');
  }

  private _emitFromDatetimeRange(timeRange: Date[]) {
    this._constructOutputAndEmit(timeRange, 'date-range');
  }

  private _constructOutputAndEmit(range: Date[], type: DatetimeRangeType) {
    const from = zonedTimeToUtcSafe(
      startOfDay(utcToZonedTimeSafe(range[0], this.timeZone)),
      this.timeZone,
    );

    const to = zonedTimeToUtcSafe(
      endOfDay(utcToZonedTimeSafe(range[1], this.timeZone)),
      this.timeZone,
    );

    const calculatedIntegrationPeriod = calculateIntegrationPeriodForTimeRange([
      new Date(from),
      new Date(to),
    ]);

    if (
      this.integrationPeriodOptions.find((option) => option.value === calculatedIntegrationPeriod)
    ) {
      // Keep user selection if still applicable
      this.selectedIntegrationPeriodOption =
        this.selectedIntegrationPeriodOption || calculatedIntegrationPeriod;
    } else {
      this.selectedIntegrationPeriodOption = undefined;
    }

    if (
      from.getTime() === this.model?.from.getTime() &&
      to.getTime() === this.model?.to.getTime()
    ) {
      return;
    }

    const output: DatetimeRangeModel = {
      type,
      from,
      to,
      integrationPeriod: this.selectedIntegrationPeriodOption || calculatedIntegrationPeriod,
      predefinedRangeTypeOption: this.selectedRangeTypeOption,
      pickerId: this._selfId,
    };

    // Keep last value to emit with user selected integration period
    this._lastValue = output;
    this.modelChange.next(output);
  }

  private _getNzPickerModeForRangeType(rangeType: RangeTypeOption): NzDateMode {
    switch (rangeType) {
      case 'day':
        return 'date';

      case 'week':
        return 'week';

      case 'month':
        return 'month';

      case 'year':
        return 'year';

      default:
        return 'date';
    }
  }

  private _constructRangeFromSingleDatePicker(value: Date, mode: NzDateMode): Date[] {
    const timeZone = this.timeZone;
    const valueInPlantTimeZone = utcToZonedTimeSafe(value, timeZone);

    switch (mode) {
      case 'date':
        return [
          zonedTimeToUtcSafe(startOfDay(valueInPlantTimeZone), timeZone),
          zonedTimeToUtcSafe(endOfDay(valueInPlantTimeZone), timeZone),
        ];

      case 'week':
        return [
          zonedTimeToUtcSafe(startOfWeek(valueInPlantTimeZone, { weekStartsOn: 1 }), timeZone),
          zonedTimeToUtcSafe(endOfWeek(valueInPlantTimeZone, { weekStartsOn: 1 }), timeZone),
        ];

      case 'month':
        return [
          zonedTimeToUtcSafe(startOfMonth(valueInPlantTimeZone), timeZone),
          zonedTimeToUtcSafe(endOfMonth(valueInPlantTimeZone), timeZone),
        ];

      case 'year':
        return [
          zonedTimeToUtcSafe(startOfYear(valueInPlantTimeZone), timeZone),
          zonedTimeToUtcSafe(endOfYear(valueInPlantTimeZone), timeZone),
        ];

      default:
        return [valueInPlantTimeZone, valueInPlantTimeZone];
    }
  }
}
