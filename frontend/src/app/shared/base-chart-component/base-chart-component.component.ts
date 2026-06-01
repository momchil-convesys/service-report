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
import { TypedChange } from '../../constants';

import { Plant } from '../../data/models';
import { DatetimeRangeModel } from '../datetime-range-select/models';

import { APP_LOCALE_ID } from '../../app-locale';
import Highcharts from '../../highcharts-global-config';
import { ExportableChart } from './exportable-chart';

export interface BaseChartContext {
  plant: Plant;
  deviceId: string | null;

  targetRange?: DatetimeRangeModel;
}

interface ComponentChanges<T> extends SimpleChanges {
  data: TypedChange<T | undefined>;
  loading: TypedChange<boolean>;
  context: TypedChange<BaseChartContext | null>;
}

@Component({
  selector: 'app-base-chart-component',
  imports: [],
  template: '',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class BaseChartComponentComponent<T>
  extends ExportableChart
  implements OnChanges, AfterViewInit, OnDestroy
{
  @Input({ required: true }) data: T | undefined;
  @Input({ required: true }) loading: boolean | undefined;

  @Input({ required: true }) context: BaseChartContext | null = null;

  chartContainerId = this.constructor.name + Math.random().toString();

  // Compensate for long bulgarian labels
  chartHeightString = APP_LOCALE_ID === 'bg' ? '350px' : '300px';

  protected _chart: Highcharts.Chart | undefined;

  ngOnChanges(changes: ComponentChanges<T>): void {
    if (!this._chart) {
      return;
    }

    if (changes.loading) {
      this._handleLoadingState(this._chart, changes.loading.currentValue);

      // If finished loading but data is not passed as a change...
      // E.g. if an error has occured.
      if (!changes.loading.currentValue && !changes.data) {
        this._handleNewData(this._chart, this.data);
      }
    }

    if (changes.context) {
      this._handleContextChange(
        this._chart,
        changes.context.previousValue,
        changes.context.currentValue,
      );
    }

    if (changes.data) {
      this._handleNewData(this._chart, this.data);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this._chart = Highcharts.chart(this.chartContainerId, this.getChartOptions());

      this._handleLoadingState(this._chart, this.loading);
      this._handleContextChange(this._chart, null, this.context);
      this._handleNewData(this._chart, this.data);
    }, 0);
  }

  ngOnDestroy(): void {
    this._chart?.destroy();
  }

  getChartInstance(): Highcharts.Chart | undefined {
    return this._chart;
  }

  protected _handleNewData(chart: Highcharts.Chart, data: T | undefined) {
    this.updateChartData(chart, data, this.context);
    chart.redraw();
  }

  protected _handleLoadingState(chart: Highcharts.Chart, isLoading: boolean | undefined) {
    if (isLoading) {
      chart.showLoading();
    } else {
      chart.hideLoading();
    }
  }

  protected _handleContextChange(
    chart: Highcharts.Chart,
    previousValue: BaseChartContext | null,
    currentValue: BaseChartContext | null,
  ) {
    this.handleContextChange(chart, previousValue, currentValue);
    chart.redraw();
  }

  /**
   * The following methods should be implemented
   * by the components that extend this base class
   */

  abstract getChartOptions(): Highcharts.Options;

  abstract updateChartData(
    chart: Highcharts.Chart,
    data: T | undefined,
    context: BaseChartContext | null,
  ): void;

  abstract handleContextChange(
    chart: Highcharts.Chart,
    previousValue: BaseChartContext | null,
    currentValue: BaseChartContext | null,
  ): void;
}
