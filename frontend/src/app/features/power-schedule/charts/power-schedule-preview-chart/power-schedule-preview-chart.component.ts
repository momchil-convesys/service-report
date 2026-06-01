import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  ViewEncapsulation,
} from '@angular/core';
import { Subscription } from 'rxjs';

import { ClockService } from '../../../../data/services/clock.service';
import { updateTimeZoneSettings } from '../../../../helpers';
import Highcharts from '../../../../highcharts-global-config';
import { PowerSchedule } from '../../_data/models';
import { chartOptions, updateData } from './chart-manipulation';

@Component({
  selector: 'app-power-schedule-preview-chart',
  templateUrl: './power-schedule-preview-chart.component.html',
  styleUrls: ['./power-schedule-preview-chart.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class PowerSchedulePreviewChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() data: PowerSchedule | undefined;

  chartContainerId = this.constructor.name + Math.random().toString();

  private _chart: Highcharts.Chart | undefined;
  private _clock = inject(ClockService);
  private _tickSubscription: Subscription | undefined;

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

      // Subscribe to clock ticks to update plot bands
      this._tickSubscription = this._clock.tick$.subscribe(() => {
        if (this._chart) {
          // updatePlotBands(this._chart, this.data, this._clock);
        }
      });
    }, 0);
  }

  ngOnDestroy(): void {
    this._tickSubscription?.unsubscribe();
    this._chart?.destroy();
  }

  private _handleNewData(chart: Highcharts.Chart, data: PowerSchedule | undefined) {
    updateTimeZoneSettings(chart, data?.plantTimeZone, false);

    updateData(chart, data);

    // updatePlotBands(chart, data, this._clock);

    chart.zoomOut();
    chart.redraw();
  }
}
