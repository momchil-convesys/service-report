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
import { WTCombinedChartData, WTPowerData } from '../../../data/models';
import Highcharts from '../../../highcharts-global-config';
import { extendedOptions, onMouseEvent } from '../common-chart-helpers';
import {
  chart1Options,
  chart2Options,
  chart3Options,
  chart4Options,
  updateChartsData,
} from './chart-manipulation';

interface ComponentChanges extends SimpleChanges {
  data: TypedChange<WTPowerData | undefined>;
  loading: TypedChange<boolean>;
}

@Component({
  selector: 'app-wt-power-chart',
  templateUrl: './wt-power-chart.component.html',
  styleUrls: ['./wt-power-chart.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class WtPowerChartComponent {
  @Input() data: WTCombinedChartData | undefined;
  @Input() loading = true;

  @ViewChild('chartContainer', { read: ElementRef }) chartContainer: ElementRef | undefined;

  chart1ContainerId = this.constructor.name + 'c1' + Math.random().toString();
  chart2ContainerId = this.constructor.name + 'c2' + Math.random().toString();
  chart3ContainerId = this.constructor.name + 'c3' + Math.random().toString();
  chart4ContainerId = this.constructor.name + 'c4' + Math.random().toString();

  private _chart1: Highcharts.Chart | undefined;
  private _chart2: Highcharts.Chart | undefined;
  private _chart3: Highcharts.Chart | undefined;
  private _chart4: Highcharts.Chart | undefined;

  _destroyed$ = new Subject<void>();

  constructor() {}

  ngOnChanges(changes: ComponentChanges): void {
    if (!this._chart1 || !this._chart2 || !this._chart3 || !this._chart4) {
      return;
    }

    if (changes.loading) {
      this._handleLoadingState(
        [this._chart1, this._chart2, this._chart3, this._chart4],
        changes.loading.currentValue,
      );
    }

    if (!this.loading) {
      this._handleNewData([this._chart1, this._chart2, this._chart3, this._chart4], this.data);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this._chart1 = Highcharts.chart(this.chart1ContainerId, extendedOptions(chart1Options));
      this._chart2 = Highcharts.chart(this.chart2ContainerId, extendedOptions(chart2Options));
      this._chart3 = Highcharts.chart(this.chart3ContainerId, extendedOptions(chart3Options));
      this._chart4 = Highcharts.chart(this.chart4ContainerId, extendedOptions(chart4Options));

      this._handleLoadingState(
        [this._chart1, this._chart2, this._chart3, this._chart4],
        this.loading,
      );
      this._handleNewData([this._chart1, this._chart2, this._chart3, this._chart4], this.data);

      fromEvent<MouseEvent>(this.chartContainer?.nativeElement, 'mousemove')
        .pipe(throttleTime(10), takeUntil(this._destroyed$))
        .subscribe((e) => onMouseEvent(e));

      merge(fromEvent<MouseEvent>(this.chartContainer?.nativeElement, 'mouseout'))
        .pipe(takeUntil(this._destroyed$))
        .subscribe((e) => onMouseEvent(e));
    }, 0);
  }

  ngOnDestroy(): void {
    this._chart1?.destroy();
    this._chart2?.destroy();
    this._chart3?.destroy();
    this._chart4?.destroy();

    this._destroyed$.next();
  }

  private _handleNewData(charts: Highcharts.Chart[], data: WTCombinedChartData | undefined) {
    updateChartsData(charts[0], charts[1], charts[2], charts[3], data);
    charts.map((chart) => chart.redraw());
  }

  private _handleLoadingState(charts: Highcharts.Chart[], isLoading: boolean) {
    if (isLoading) {
      charts.map((chart) => chart.showLoading());
    } else {
      charts.map((chart) => chart.hideLoading());
    }
  }
}
