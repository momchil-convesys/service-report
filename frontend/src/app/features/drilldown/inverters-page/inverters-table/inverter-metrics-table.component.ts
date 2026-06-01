import { AsyncPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzTableComponent, NzTableModule } from 'ng-zorro-antd/table';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { DeviceParameterUnitDisplayComponent } from '../../../../shared/device-parameter-unit-display/device-parameter-unit-display.component';
import { DeviceStateModule } from '../../../../shared/device-state/device-state.module';
import { ValueDisplayComponent } from '../../../../shared/value-display/value-display.component';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { Observable } from 'rxjs';
import { TransformerStation_DTO } from '../../../../data/dtos';
import { StaleDataService } from '../../../../data/services/stale-data.service';
import { getMostSignificantAlarm } from '../../alarms-page/_data/utils';
import {
  InverterAlarm_DTO,
  InverterMetrics_DataPoint_DTO,
  TransformerStation_Metrics_DTO,
} from '../_data/dto';
import { InverterAlarmIconComponent } from '../inverters-grid-view/inverter-grid-box/inverter-alarm-icon/inverter-alarm-icon.component';
import { inverterMetricsListOfColumns } from './inverter-metrics-table-columns';
import { InverterMetricsTableItem } from './models';

@Component({
  selector: 'app-inverter-metrics-table',
  imports: [
    NzTableModule,
    ValueDisplayComponent,
    DeviceParameterUnitDisplayComponent,
    DeviceStateModule,
    DatePipe,
    RouterLink,
    RouterLinkActive,
    AsyncPipe,
    NzTooltipModule,
    NzIconModule,
    NzButtonModule,
    NzPopoverModule,
    InverterAlarmIconComponent,
  ],
  templateUrl: './inverter-metrics-table.component.html',
  styleUrl: './inverter-metrics-table.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InverterMetricsTableComponent {
  @Input({ required: true }) metadata: TransformerStation_DTO[] = [];
  @Input({ required: true }) data: TransformerStation_Metrics_DTO[] = [];
  @Input({ required: true }) loading = false;

  @ViewChild('expandTable', { static: false }) nzTableComponent?: NzTableComponent<any>;

  staleDataTooltip = $localize`Data is stale!`;
  listOfColumns = inverterMetricsListOfColumns;

  get nzScrollY(): string {
    const offsetHeight = this.elementRef.nativeElement.parentElement?.offsetHeight;

    // -100 px for the buttons
    const viewHeight = Math.max(offsetHeight || 0, 300) - 100;

    return viewHeight + 'px';
  }

  get showTsContext() {
    return this.metadata.length > 1;
  }

  get items(): Array<InverterMetricsTableItem> {
    return this.metadata
      .map((tsMetadata) => tsMetadata.inverters)
      .flat()
      .map((inverter) => ({
        inverter,
        data: this._getInverterData(inverter.context.tsId, inverter.inverterId),
      }));
  }

  constructor(
    private staleDataService: StaleDataService,
    private elementRef: ElementRef<HTMLElement>,
  ) {}

  private _getInverterData(
    tsId: string,
    inverterId: string,
  ): InverterMetrics_DataPoint_DTO | undefined {
    return this.data
      .find((ts) => ts.deviceId === tsId)
      ?.inverterMetricsDataPoints.find((inv) => inv.inverterId === inverterId);
  }

  tableRowId(index: number): string {
    return 'tr-' + index.toString();
  }

  isStaleData(item: InverterMetricsTableItem): Observable<boolean> {
    return this.staleDataService.isStaleData(item.data?.timestamp);
  }

  trackByFn = (index: number, item: InverterMetricsTableItem) => {
    return item.inverter.inverterId;
  };

  getMostSignificantAlarm(alarms: Array<InverterAlarm_DTO>): InverterAlarm_DTO | undefined {
    return getMostSignificantAlarm(alarms);
  }

  onScrollToTop() {
    this._scrollToIndex(0);
  }

  onScrollToBottom() {
    const itemsCount = this.nzTableComponent?.data?.length || 0;
    if (itemsCount > 0) {
      this._scrollToIndex(itemsCount - 1);
    }
  }

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
      const rowElement: HTMLElement | null = document.getElementById(this.tableRowId(index));

      rowElement?.classList.add('highlight');
      setTimeout(() => {
        rowElement?.classList.remove('highlight');
      }, 1000);
    }, 100);
  }
}
