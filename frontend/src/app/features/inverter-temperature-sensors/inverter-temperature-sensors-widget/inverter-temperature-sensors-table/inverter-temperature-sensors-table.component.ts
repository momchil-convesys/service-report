import { AsyncPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { isBefore, isSameDay } from 'date-fns';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableComponent, NzTableModule } from 'ng-zorro-antd/table';
import { BehaviorSubject } from 'rxjs';
import { TypedChange, celsiusDegreeSymbol } from '../../../../constants';
import { RelativeDatePipe } from '../../../../shared/pipes/relative-date.pipe';
import { ValueDisplayComponent } from '../../../../shared/value-display/value-display.component';
import {
  InverterTemperatureSensorsData,
  InverterTemperatureSensorsDataPoint,
  MinMaxTemperaturePoint,
} from '../../_data/models';
import { LongTermExtremesCellComponent } from './long-term-extremes-cell/long-term-extremes-cell.component';

interface ComponentChanges extends SimpleChanges {
  data: TypedChange<InverterTemperatureSensorsData | undefined>;
  loading: TypedChange<boolean>;
}

interface SortState {
  timestamp: boolean; // True if sorted by timestamp
  columnIndex: number | null; // Index of column if forted by column
  order: string | null;
}

const sortStateDefault: SortState = {
  timestamp: false,
  columnIndex: null,
  order: null,
};

@Component({
  selector: 'app-inverter-temperature-sensors-table',
  imports: [
    NzTableModule,
    ValueDisplayComponent,
    DatePipe,
    AsyncPipe,
    RelativeDatePipe,
    NzButtonModule,
    NzIconModule,
    LongTermExtremesCellComponent,
  ],
  templateUrl: './inverter-temperature-sensors-table.component.html',
  styleUrl: './inverter-temperature-sensors-table.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InverterTemperatureSensorsTableComponent implements OnChanges {
  @Input({ required: true }) data: InverterTemperatureSensorsData | undefined;
  @Input({ required: true }) loading = false;

  @Output() goToExtreme = new EventEmitter<MinMaxTemperaturePoint>();

  @ViewChild('basicTable', { static: false }) nzTableComponent?: NzTableComponent<any>;

  celsiusDegreeSymbol = celsiusDegreeSymbol;

  inputData: InverterTemperatureSensorsData | undefined; // Data sorted by timestamp (latest on top)
  tableData$ = new BehaviorSubject<InverterTemperatureSensorsData | undefined>(undefined);

  sortedBy: SortState = sortStateDefault;

  primaryColWidth = '270px';
  sensorColWidth = '150px';

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  get viewHeight(): number {
    return this.elementRef.nativeElement.parentElement?.offsetHeight || 300;
  }

  ngOnChanges(changes: ComponentChanges): void {
    if (changes.data && this.loading === false) {
      // If new data sensors are different for some reason
      if (this.tableData$.value?.sensorLabels.length !== this.data?.sensorLabels.length) {
        this.sortedBy = sortStateDefault;
      }

      this.inputData = this.data ? this._dataSortedByTimestamp(this.data, 'ascend') : undefined;
      this._updateTableData();

      if (this.data?.highlightOnLoad) {
        this.onScrollTo(this.data.highlightOnLoad);
      }
    }
  }

  // From long term extremes popup.
  // Extreme point may be from another day.
  onGoToRecord(point: MinMaxTemperaturePoint) {
    if (this.data && isSameDay(this.data.targetDate, point.timestamp)) {
      this.onScrollTo(point);
    } else {
      this.goToExtreme.next(point);
    }
  }

  onScrollToTop() {
    this._scrollToIndex(0);
  }

  onScrollToBottom() {
    const itemsCount = this.tableData$.value?.dataPoints.length || 0;
    if (itemsCount > 0) {
      this._scrollToIndex(itemsCount - 1);
    }
  }

  onScrollTo(minMaxPoint: MinMaxTemperaturePoint | null) {
    if (!minMaxPoint) {
      return;
    }

    const index = this.tableData$.value?.dataPoints.findIndex(
      (point: InverterTemperatureSensorsDataPoint) =>
        point.timestamp.getTime() === minMaxPoint.timestamp.getTime(),
    );

    if (index === undefined) {
      return;
    }

    this._scrollToIndex(index);
  }

  onSortByTimestamp(order: string | null) {
    this.sortedBy = {
      timestamp: order !== null,
      columnIndex: null,
      order,
    };
    this._updateTableData();
  }

  onSortOrderChange(order: string | null, columnIndex: number) {
    this.sortedBy = {
      timestamp: false,
      columnIndex: order ? columnIndex : null,
      order,
    };
    this._updateTableData();
  }

  trackByFn = (index: number, point: InverterTemperatureSensorsDataPoint) => {
    return point.timestamp;
  };

  private _scrollToIndex(index: number) {
    const renderedRange = this.nzTableComponent?.cdkVirtualScrollViewport?.getRenderedRange();

    // Use smooth scroll if element is already rendered
    const smoothScroll = renderedRange
      ? index >= renderedRange.start && index <= renderedRange.end
      : false;

    this.nzTableComponent?.cdkVirtualScrollViewport?.scrollToIndex(
      index,
      smoothScroll ? 'smooth' : 'auto',
    );

    // Wait for scroll to index, as rows are virtual and not always present in the document tree
    setTimeout(() => {
      const dataPoints: InverterTemperatureSensorsDataPoint[] =
        this.tableData$.value?.dataPoints || [];

      if (index >= dataPoints.length) {
        return;
      }

      const dataPoint = dataPoints[index];

      if (!dataPoint) {
        return;
      }

      const rowElement: HTMLElement | null = document.getElementById(
        dataPoint.timestamp.toISOString(),
      );

      rowElement?.classList.add('highlight');
      setTimeout(() => {
        rowElement?.classList.remove('highlight');
      }, 1000);
    }, 100);
  }

  private _updateTableData() {
    const sortedData: InverterTemperatureSensorsData | undefined = this._sortedData(
      this.inputData,
      this.sortedBy,
    );

    this.tableData$.next(sortedData);
  }

  private _sortedData(
    data: InverterTemperatureSensorsData | undefined,
    sortBy: SortState,
  ): InverterTemperatureSensorsData | undefined {
    if (!data) {
      return data;
    }

    if (sortBy.order === null) {
      return data;
    }

    let result: InverterTemperatureSensorsData | undefined = undefined;

    if (sortBy.columnIndex !== null) {
      result = this._dataSortedByColumnAtIndex(data, sortBy.columnIndex, sortBy.order);
    }

    if (sortBy.timestamp === true) {
      result = this._dataSortedByTimestamp(data, sortBy.order);
    }

    return result;
  }

  private _dataSortedByColumnAtIndex(
    data: InverterTemperatureSensorsData,
    columnIndex: number,
    order: string,
  ): InverterTemperatureSensorsData {
    const sortedData = {
      ...data,
      dataPoints: [...data.dataPoints].sort((a, b) => {
        const t1 = a.values[columnIndex];
        const t2 = b.values[columnIndex];

        return this._sortTemperatures(t1, t2, order);
      }),
    };

    return sortedData;
  }

  private _dataSortedByTimestamp(
    data: InverterTemperatureSensorsData,
    order: string,
  ): InverterTemperatureSensorsData {
    const sortedData = {
      ...data,
      dataPoints: [...data.dataPoints].sort((a, b) => {
        const t1 = a.timestamp;
        const t2 = b.timestamp;

        // TODO: keep timestamps as numbers
        return this._sortTimestamps(t1, t2, order);
      }),
    };

    return sortedData;
  }

  private _sortTemperatures(
    t1: number | null | undefined,
    t2: number | null | undefined,
    order: string,
  ): number {
    if (t1 === undefined || t1 === null || t2 === undefined || t2 === null) {
      return 0;
    }

    return order === 'ascend' ? t2 - t1 : t1 - t2;
  }

  private _sortTimestamps(t1: number | Date, t2: number | Date, order: string): number {
    const result = isBefore(t1, t2) ? 1 : -1;

    return order === 'ascend' ? result : result * -1;
  }
}
