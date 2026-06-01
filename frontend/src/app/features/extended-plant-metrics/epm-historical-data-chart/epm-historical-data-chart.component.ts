import {
  ChangeDetectionStrategy,
  Component,
  Input,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { TypedChange } from '../../../constants';
import Highcharts from '../../../highcharts-global-config';
import { BaseChartContext } from '../../../shared/base-chart-component/base-chart-component.component';
import {
  PowerMetersCumulativeData,
  PowerMetersCumulativeDataPointsSum,
} from '../../extended-plant-metrics/_data/models';

import { getParameterBoxInputFor_Sum } from '../../extended-plant-metrics/epm-parameter-box/data-helpers';
import {
  EpmParameterBoxComponent,
  EpmParameterBoxInput,
} from '../../extended-plant-metrics/epm-parameter-box/epm-parameter-box.component';
import { getDataRows } from './chart-exporting';
import {
  chartOptions_Energy,
  chartOptions_Penalty,
  chartOptions_ReactiveEnergy,
  updateChartData,
} from './chart-manipulation';

interface ComponentChanges<T> extends SimpleChanges {
  data: TypedChange<T | undefined>;
  loading: TypedChange<boolean>;
  context: TypedChange<BaseChartContext | null>;
}

@Component({
  selector: 'app-epm-historical-data-chart',
  imports: [EpmParameterBoxComponent],
  templateUrl: './epm-historical-data-chart.component.html',
  styleUrl: './epm-historical-data-chart.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EpmHistoricalDataChartComponent {
  @Input({ required: true }) data: PowerMetersCumulativeData | undefined;
  @Input({ required: true }) loading: boolean | undefined;
  @Input({ required: true }) context: BaseChartContext | null = null;

  chartContainerId = this.constructor.name + Math.random().toString();

  private _chart: Highcharts.Chart | undefined;
  private _chart_ReactiveEnergy: Highcharts.Chart | undefined;
  private _chart_Penalty: Highcharts.Chart | undefined;

  chartContainerId_ReactiveEnergy = this.constructor.name + 'RE' + Math.random().toString();
  chartContainerId_Penalty = this.constructor.name + 'Penalty' + Math.random().toString();

  ngOnChanges(changes: ComponentChanges<PowerMetersCumulativeData>): void {
    if (!this._chart) {
      return;
    }

    if (changes.loading) {
      this._handleLoadingState(changes.loading.currentValue);

      // If finished loading but data is not passed as a change...
      // E.g. if an error has occured.
      if (!changes.loading.currentValue && !changes.data) {
        this._handleNewData(this.data);
      }
    }

    if (changes.context) {
      this._handleContextChange(changes.context.previousValue, changes.context.currentValue);
    }

    if (changes.data) {
      this._handleNewData(this.data);
    }
  }

  ngAfterViewInit(): void {
    // super.ngAfterViewInit();

    setTimeout(() => {
      this._chart = Highcharts.chart(this.chartContainerId, chartOptions_Energy);

      this._chart_ReactiveEnergy = Highcharts.chart(
        this.chartContainerId_ReactiveEnergy,
        chartOptions_ReactiveEnergy,
      );

      this._chart_Penalty = Highcharts.chart(this.chartContainerId_Penalty, chartOptions_Penalty);

      [this._chart, this._chart_ReactiveEnergy, this._chart_Penalty].forEach((chart) => {
        this._handleLoadingState(this.loading);
        this._handleContextChange(null, this.context);
        this._handleNewData(this.data);
      });

      // Attach custom export handler

      (this._chart as any).customExportCallback_getDataRows = () => {
        return getDataRows(this.data);
      };
    }, 0);
  }

  ngOnDestroy(): void {
    this._chart?.destroy();
    this._chart_Penalty?.destroy();
    this._chart_ReactiveEnergy?.destroy();
  }

  getChartInstance(): Highcharts.Chart | undefined {
    return this._chart;
  }

  getParameterBoxInputFor_Sum(
    data: PowerMetersCumulativeDataPointsSum | undefined,
    key: keyof PowerMetersCumulativeDataPointsSum,
  ): EpmParameterBoxInput {
    return getParameterBoxInputFor_Sum(data, undefined, key);
  }

  private _handleLoadingState(isLoading: boolean | undefined) {
    const charts = [this._chart, this._chart_Penalty, this._chart_ReactiveEnergy].filter(
      (c) => c !== undefined,
    );

    charts.forEach((chart) => {
      if (isLoading) {
        chart.showLoading();
      } else {
        chart.hideLoading();
      }
    });
  }

  private _handleNewData(data: PowerMetersCumulativeData | undefined) {
    const charts = [this._chart, this._chart_Penalty, this._chart_ReactiveEnergy].filter(
      (c) => c !== undefined,
    );

    charts.forEach((chart) => updateChartData(chart, data, this.context));
    charts.forEach((chart) => chart.redraw());
  }

  private _handleContextChange(
    previousValue: BaseChartContext | null,
    currentValue: BaseChartContext | null,
  ): void {}
}
