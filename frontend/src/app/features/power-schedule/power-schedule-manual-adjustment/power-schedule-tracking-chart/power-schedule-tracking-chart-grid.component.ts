import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { bufferCount, Subject, takeUntil } from 'rxjs';

import { DataRequest } from 'src/app/constants';
import { DataAdapter } from 'src/app/data/adapters';
import { ClockService } from 'src/app/data/services/clock.service';
import Highcharts from 'src/app/highcharts-global-config';
import {
  BaseChartComponentComponent,
  BaseChartContext,
} from 'src/app/shared/base-chart-component/base-chart-component.component';
import { PowerScheduleTracking } from '../_data/power-schedule-tracking.model';
import { chartOptions_Grid, updateChartData_Grid } from './chart-manipulation-grid';
import { updatePlotBandsForCurrentInterval } from './chart-plotbands-current-interval';

@Component({
  selector: 'app-power-schedule-tracking-chart-grid',
  templateUrl: './power-schedule-tracking-chart-grid.component.html',
  styleUrls: ['./power-schedule-tracking-chart-grid.component.less'],
  imports: [],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PowerScheduleTrackingChartGridComponent
  extends BaseChartComponentComponent<PowerScheduleTracking>
  implements OnChanges, OnDestroy
{
  @Input() dataRequest: DataRequest<PowerScheduleTracking> | null | undefined;
  @Input() optimizeForDashboard = false;

  // Base class inputs - these will be set internally from dataRequest
  // The template provides them but they're overridden by _updateChartDataFromRequest
  override data: PowerScheduleTracking | undefined = undefined;
  override loading: boolean | undefined = false;

  private _chartData: PowerScheduleTracking | undefined;
  private _clockService = inject(ClockService);
  private _destroy$ = new Subject<void>();
  private _clockSubscriptionActive = false;

  override getChartOptions(): Highcharts.Options {
    return chartOptions_Grid;
  }

  override ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataRequest'] || changes['context']) {
      this._updateChartDataFromRequest();
    }

    // Call parent with proper changes object
    const baseChanges: any = {
      data: {
        currentValue: this.data,
        previousValue: changes['data']?.previousValue,
        firstChange: changes['data']?.firstChange ?? false,
      },
      loading: {
        currentValue: this.loading,
        previousValue: changes['loading']?.previousValue,
        firstChange: changes['loading']?.firstChange ?? false,
      },
      context: changes['context'],
    };
    super.ngOnChanges(baseChanges);
  }

  private _updateChartDataFromRequest(): void {
    if (!this.dataRequest) {
      this._chartData = undefined;
      this.data = undefined;
      this.loading = false;
      return;
    }

    this.loading = this.dataRequest.isLoading;

    if (this.dataRequest.error || !this.dataRequest.data) {
      this._chartData = undefined;
      this.data = undefined;
      return;
    }

    const chartData = { ...this.dataRequest.data };
    if (this.context?.targetRange) {
      chartData.targetRange = this.context.targetRange;
    }
    chartData.exportFileName = `power-schedule-tracking-grid-${chartData.plantId}-${DataAdapter.modelToDtoTimestamp(chartData.from)}-${DataAdapter.modelToDtoTimestamp(chartData.to)}`;

    this._chartData = chartData;
    this.data = chartData;
  }

  override updateChartData(chart: Highcharts.Chart, data: PowerScheduleTracking | undefined): void {
    updateChartData_Grid(chart, data, this.context, this._clockService);
    this._subscribeToClockTicks(chart);
  }

  override handleContextChange(
    chart: Highcharts.Chart,
    previousValue: BaseChartContext | null,
    currentValue: BaseChartContext | null,
  ): void {
    if (currentValue?.targetRange && this._chartData) {
      this._chartData.targetRange = currentValue.targetRange;
      this.data = this._chartData;
    }
  }

  override ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    super.ngOnDestroy();
  }

  private _subscribeToClockTicks(chart: Highcharts.Chart): void {
    // Subscribe to clock ticks only once to update current interval plot band independently
    if (this._clockSubscriptionActive) {
      return;
    }
    this._clockSubscriptionActive = true;

    this._clockService.tick$.pipe(bufferCount(2), takeUntil(this._destroy$)).subscribe(() => {
      if (this.data && chart) {
        updatePlotBandsForCurrentInterval(
          chart,
          this.data,
          this._clockService,
          this.context?.plant?.timeZone,
        );
      }
    });
  }
}
