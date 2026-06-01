import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { TypedChange } from '../../../constants';
import { ConsumptionWithIntegrationPeriod } from '../../../data/models';
import Highcharts from '../../../highcharts-global-config';
import { chartOptions, updateChartData } from './chart-manipulation';

interface ComponentChanges extends SimpleChanges {
  data: TypedChange<ConsumptionWithIntegrationPeriod | undefined>;
  loading: TypedChange<boolean>;
}

@Component({
  selector: 'app-consumption-chart',
  templateUrl: './consumption-chart.component.html',
  styleUrls: ['./consumption-chart.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ConsumptionChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() data: ConsumptionWithIntegrationPeriod | undefined;
  @Input() loading = true;

  chartContainerId = this.constructor.name + Math.random().toString();

  private _chart: Highcharts.Chart | undefined;

  ngOnChanges(changes: ComponentChanges): void {
    if (!this._chart) {
      return;
    }

    if (changes.loading) {
      this._handleLoadingState(this._chart, changes.loading.currentValue);
    }

    if (!this.loading) {
      this._handleNewData(this._chart, this.data);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this._chart = Highcharts.chart(this.chartContainerId, chartOptions);

      this._handleLoadingState(this._chart, this.loading);
      this._handleNewData(this._chart, this.data);
    }, 0);
  }

  ngOnDestroy(): void {
    this._chart?.destroy();
  }

  private _handleNewData(
    chart: Highcharts.Chart,
    data: ConsumptionWithIntegrationPeriod | undefined,
  ) {
    updateChartData(chart, data);
    chart.redraw();
  }

  private _handleLoadingState(chart: Highcharts.Chart, isLoading: boolean) {
    if (isLoading) {
      chart.showLoading();
    } else {
      chart.hideLoading();
    }
  }
}
