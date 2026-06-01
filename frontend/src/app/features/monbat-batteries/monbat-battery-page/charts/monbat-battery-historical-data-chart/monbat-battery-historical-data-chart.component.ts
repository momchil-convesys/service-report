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
import { differenceInSeconds, isWithinInterval } from 'date-fns';
import { BehaviorSubject, of, Subject, switchMap, takeUntil } from 'rxjs';
import { TypedChange } from '../../../../../constants';
import Highcharts from '../../../../../highcharts-global-config';
import { ExportableChart } from '../../../../../shared/base-chart-component/exportable-chart';
import { BatteriesApiService } from '../../../_data/api.service';
import { MonbatBatteryHistoricalData } from '../../../_data/models';
import { updateYAxisExtremes, updateYAxisExtremesToDefault } from '../y-axis-extremes';
import { chartOptions, updateChartData } from './chart-manipulation';

interface ComponentChanges extends SimpleChanges {
  data: TypedChange<MonbatBatteryHistoricalData | undefined>;
  loading: TypedChange<boolean>;
}

@Component({
  selector: 'app-monbat-battery-historical-data-chart',
  templateUrl: './monbat-battery-historical-data-chart.component.html',
  styleUrls: ['./monbat-battery-historical-data-chart.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class MonbatBatteryHistoricalDataChartComponent
  extends ExportableChart
  implements OnChanges, AfterViewInit, OnDestroy
{
  @Input() data: MonbatBatteryHistoricalData | undefined;
  @Input() loading = false;

  chartContainerId = this.constructor.name + Math.random().toString();

  private _chart: Highcharts.Chart | undefined;

  private _requestedSubrange$ = new BehaviorSubject<Date[] | undefined | null>(null);
  private _loadedData: MonbatBatteryHistoricalData | undefined;

  private _destroy$ = new Subject<void>();

  constructor(private api: BatteriesApiService) {
    super();

    this._requestedSubrange$
      .pipe(
        switchMap((range) => {
          if (range === null) {
            return of(null);
          }

          if (range === undefined || this.data === undefined) {
            return of(undefined);
          }

          return this.api.fetchBatteryHistoricalData(
            this.data.deviceId,
            this.data.batteryId || '',
            range[0],
            range[1],
          );
        }),
        takeUntil(this._destroy$),
      )
      .subscribe((dataRequest) => {
        if (!this._chart || dataRequest === null) {
          return;
        }

        if (dataRequest === undefined) {
          this._loadedData = this.data;

          // Reset to original data
          updateChartData(this._chart, this.data, true);
          this._chart.redraw();

          updateYAxisExtremes(this._chart);

          return;
        }

        if (dataRequest.isLoading) {
          this._chart.showLoading();
        } else {
          this._chart.hideLoading();
          updateChartData(this._chart, dataRequest.data, true);
          this._chart.redraw();

          updateYAxisExtremes(this._chart);

          this._loadedData = dataRequest.data;
        }
      });
  }

  getChartInstance(): Highcharts.Chart | undefined {
    return this._chart;
  }

  ngOnChanges(changes: ComponentChanges): void {
    // console.log(this.constructor.name, ' | ngOnChanges: ', changes);

    if (!this._chart) {
      return;
    }

    const requestedSubrangeValue = this._requestedSubrange$.getValue();
    if (requestedSubrangeValue) {
      // If zoomed in and loading sub data, stop current requests and
      // reset chart to full range data
      this._requestedSubrange$.next(undefined);
    } else {
      // Null would mean to stop current requests and leave the chart as is
      this._requestedSubrange$.next(null);
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

      this._chart.update(
        {
          xAxis: {
            events: {
              afterSetExtremes: (e) => {
                this._afterSetExtremesHandler(e);
              },
            },
          },
        },
        false,
      );

      this._handleLoadingState(this._chart, this.loading);
      this._handleNewData(this._chart, this.data);
    }, 0);
  }

  ngOnDestroy(): void {
    this._chart?.destroy();
    this._destroy$.next();
  }

  private _handleNewData(chart: Highcharts.Chart, data: MonbatBatteryHistoricalData | undefined) {
    if (
      this._loadedData?.batteryId === data?.batteryId &&
      this._loadedData?.from === data?.from &&
      this._loadedData?.to === data?.to
    ) {
      // Data is already loaded, avoid duplicated updates
      return;
    }

    this._loadedData = data;

    updateChartData(chart, data, false);

    chart.redraw();

    updateYAxisExtremes(chart);
  }

  private _handleLoadingState(chart: Highcharts.Chart, isLoading: boolean) {
    if (isLoading) {
      chart.showLoading();
    } else {
      chart.hideLoading();
    }
  }

  private _afterSetExtremesHandler(e: any) {
    const chart: Highcharts.Chart | undefined = this._chart;
    if (!chart) {
      return;
    }

    updateYAxisExtremesToDefault(chart);

    if (!this.data) {
      return;
    }

    let zoomInsideCurrentInterval = false;

    if (this._loadedData) {
      const currentInterval = {
        start: new Date(this._loadedData.from),
        end: new Date(this._loadedData.to),
      };
      if (isWithinInterval(e.min, currentInterval) && isWithinInterval(e.max, currentInterval)) {
        zoomInsideCurrentInterval = true;
      }

      if (zoomInsideCurrentInterval && this._loadedData.detailedDataTresholdSeconds === 0) {
        // No more details to load

        updateYAxisExtremes(chart);
        return;
      }
    }

    if (
      this.data &&
      differenceInSeconds(new Date(e.min), new Date(this.data.from)) === 0 &&
      differenceInSeconds(new Date(e.max), new Date(this.data.to)) === 0
    ) {
      // Reset to initial data

      this._handleNewData(chart, this.data);
      return;
    }

    this._requestedSubrange$.next([new Date(e.min), new Date(e.max)]);
  }
}
