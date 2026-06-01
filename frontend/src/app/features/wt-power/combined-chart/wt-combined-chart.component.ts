import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Subject, fromEvent, merge, takeUntil, throttleTime } from 'rxjs';
import { TypedChange } from '../../../constants';
import { WTCombinedChartData } from '../../../data/models';
import Highcharts from '../../../highcharts-global-config';
import { extendedOptions, onMouseEvent } from '../common-chart-helpers';
import { chartOptions, updateChartData } from './chart-manipulation';

interface ComponentChanges extends SimpleChanges {
  data: TypedChange<WTCombinedChartData | undefined>;
  loading: TypedChange<boolean>;
}

@Component({
  selector: 'app-wt-combined-chart',
  templateUrl: './wt-combined-chart.component.html',
  styleUrls: ['./wt-combined-chart.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class WtCombinedChartComponent {
  @Input() data: WTCombinedChartData | undefined;
  @Input() loading = true;

  @ViewChild('chartContainer', { read: ElementRef }) chartContainer: ElementRef | undefined;

  chartContainerId = this.constructor.name + Math.random().toString();

  private _chart: Highcharts.Chart | undefined;

  _destroyed$ = new Subject<void>();

  constructor() {}

  ngOnChanges(changes: ComponentChanges): void {
    if (!this._chart) {
      return;
    }

    if (changes.loading) {
      this._handleLoadingState([this._chart], changes.loading.currentValue);
    }

    if (!this.loading) {
      this._handleNewData([this._chart], this.data);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this._chart = Highcharts.chart(this.chartContainerId, extendedOptions(chartOptions));

      this._handleLoadingState([this._chart], this.loading);
      this._handleNewData([this._chart], this.data);

      fromEvent<MouseEvent>(this.chartContainer?.nativeElement, 'mousemove')
        .pipe(throttleTime(10), takeUntil(this._destroyed$))
        .subscribe((e) => onMouseEvent(e));

      merge(fromEvent<MouseEvent>(this.chartContainer?.nativeElement, 'mouseout'))
        .pipe(takeUntil(this._destroyed$))
        .subscribe((e) => onMouseEvent(e));
    }, 0);
  }

  ngOnDestroy(): void {
    this._chart?.destroy();

    this._destroyed$.next();
  }

  private _handleNewData(charts: Highcharts.Chart[], data: WTCombinedChartData | undefined) {
    charts.map((chart) => {
      updateChartData(chart, data);
      chart.redraw();
    });
  }

  private _handleLoadingState(charts: Highcharts.Chart[], isLoading: boolean) {
    if (isLoading) {
      charts.map((chart) => chart.showLoading());
    } else {
      charts.map((chart) => chart.hideLoading());
    }
  }
}
