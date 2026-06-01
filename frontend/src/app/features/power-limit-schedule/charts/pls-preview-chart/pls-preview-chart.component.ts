import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  ViewEncapsulation,
} from '@angular/core';

import { updateTimeZoneSettings } from '../../../../helpers';
import Highcharts from '../../../../highcharts-global-config';
import { PowerLimitSchedule } from '../../_data/models';
import { chartOptions, updateData, updateOptionsAccordingToData } from './chart-manipulation';

@Component({
  selector: 'app-pls-preview-chart',
  templateUrl: './pls-preview-chart.component.html',
  styleUrls: ['./pls-preview-chart.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class PlsPreviewChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() data: PowerLimitSchedule | undefined;

  chartContainerId = this.constructor.name + Math.random().toString();

  private _chart: Highcharts.Chart | undefined;

  constructor() {}

  ngOnChanges(): void {
    if (this._chart) {
      this._handleNewData(this._chart, this.data);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this._chart = Highcharts.chart(this.chartContainerId, chartOptions);

      this._handleNewData(this._chart, this.data);
    }, 0);
  }

  ngOnDestroy(): void {
    this._chart?.destroy();
  }

  private _handleNewData(chart: Highcharts.Chart, data: PowerLimitSchedule | undefined) {
    updateTimeZoneSettings(chart, data?.plantTimeZone, false);

    updateOptionsAccordingToData(chart, data);

    updateData(chart, data);

    chart.zoomOut();
    chart.redraw();
  }
}
