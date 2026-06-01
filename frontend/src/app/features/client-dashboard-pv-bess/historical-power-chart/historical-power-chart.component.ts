import { AsyncPipe } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { isWithinInterval } from 'date-fns';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import {
  BehaviorSubject,
  combineLatest,
  debounce,
  distinctUntilChanged,
  filter,
  Observable,
  of,
  ReplaySubject,
  Subject,
  takeUntil,
  timer,
} from 'rxjs';
import { IntegrationPeriod, SSE_EventName } from '../../../constants';
import { Plant } from '../../../data/models';
import Highcharts from '../../../highcharts-global-config';
import { ExportableChart } from '../../../shared/base-chart-component/exportable-chart';
import { DatetimeRangeSelectComponent } from '../../../shared/datetime-range-select/datetime-range-select.component';
import {
  DatetimeRangeModel,
  isSameDatetimeRange,
} from '../../../shared/datetime-range-select/models';
import { HighchartsExportOptionComponent } from '../../../shared/highcharts-export-option/highcharts-export-option.component';
import { PvBessViewMode } from '../constants';
import { HistoricalPowerApiService } from './_data/api.service';
import { DataResolutionPeriod, resolutionForRange } from './_data/constants';
import { HistoricalPowerDataService } from './_data/data.service';
import { DataPointsBatch } from './_data/interfaces';
import { PVBESSHistoricalPowerData_Point } from './_data/models';
import { getDataRows } from './chart/chart-exporting';
import {
  mainChartOptions,
  subPlantChartOptions,
  updateChartData,
} from './chart/chart-manipulation';
import {
  chartSeriesOptions,
  chartSeriesOptionsIdsDefaultView,
  chartSeriesOptionsIdsHighVoltageView,
} from './chart/chart-series';
import { updateXAxisRange } from './chart/chart-x-axis';

interface ExtremesRange {
  min: number;
  max: number;
  resolution: DataResolutionPeriod;
  trigger: string;
}

function isZoomed(chart: Highcharts.Chart) {
  const e = chart.xAxis[0].getExtremes();
  // userMin/userMax are set when the user zooms/sets extremes
  return e.userMin !== undefined && e.userMax !== undefined;
}

@Component({
  selector: 'app-historical-power-chart',
  standalone: true,
  imports: [
    AsyncPipe,
    DatetimeRangeSelectComponent,
    NzAlertModule,
    HighchartsExportOptionComponent,
    NzSwitchModule,
    FormsModule,
  ],
  templateUrl: './historical-power-chart.component.html',
  styleUrl: './historical-power-chart.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HistoricalPowerApiService, HistoricalPowerDataService],
})
export class HistoricalPowerChartComponent implements AfterViewInit, OnDestroy, ExportableChart {
  @Input({ required: true }) plant: Plant | undefined;
  @Input() viewMode: PvBessViewMode = 'default';

  readonly IntegrationPeriod = IntegrationPeriod;

  get timeZone(): string | undefined {
    return this.plant?.timeZone;
  }

  private _targetRange$ = new BehaviorSubject<DatetimeRangeModel | undefined>(undefined);
  targetRange$: Observable<DatetimeRangeModel>;

  private _extremesRange$ = new BehaviorSubject<ExtremesRange | undefined>(undefined);

  private _chart: Highcharts.Chart | undefined;
  private _chartSP1: Highcharts.Chart | undefined;
  private _chartSP2: Highcharts.Chart | undefined;

  get charts(): Highcharts.Chart[] {
    return [this._chart, this._chartSP1, this._chartSP2].filter((chart) => chart !== undefined);
  }

  chartContainerId = this.constructor.name + Math.random().toString();
  chartContainerIdSP1 = this.constructor.name + 'subPlant1' + Math.random().toString();
  chartContainerIdSP2 = this.constructor.name + 'subPlant2' + Math.random().toString();

  isLoading$: Observable<boolean> = this.data.isLoading$;
  dataError$: Observable<Error | undefined> = this.data.error$;
  appError$: ReplaySubject<Error | undefined> = new ReplaySubject(1);

  private _chartReady$ = new Subject<void>();
  private _destroy$ = new Subject<void>();

  constructor(private data: HistoricalPowerDataService) {
    this.targetRange$ = this._targetRange$.pipe(
      filter((targetRange) => targetRange !== undefined),
      distinctUntilChanged((a, b) => isSameDatetimeRange(a, b, false)),
    );

    this.isLoading$.pipe(takeUntil(this._destroy$)).subscribe((loading) => {
      this._handleLoadingState(loading);
    });

    data.pointsStreamChanges$.pipe(takeUntil(this._destroy$)).subscribe((changes) => {
      this._handleDataChanges(changes);
    });

    /**
     * On main target range change
     */
    combineLatest([this.targetRange$, this._chartReady$])
      .pipe(takeUntil(this._destroy$))
      .subscribe(([targetRange, _]) => {
        if (!this.plant || !targetRange) {
          this.appError$.next(new Error($localize`Plant or target range is undefined!`));
          return;
        }

        if (!this._chart || !this._chartSP1 || !this._chartSP2) {
          this.appError$.next(new Error($localize`Received data before chart is ready!`));
          return;
        }

        data.setMainRangeContext(this.plant, targetRange);
      });

    /**
     * On sub range change
     */
    combineLatest([
      this._extremesRange$.pipe(
        distinctUntilChanged((a, b) => a?.min === b?.min && a?.max === b?.max),
        debounce((extremesRange) => (extremesRange?.trigger === 'navigator' ? timer(0) : of({}))),
      ),
      this._chartReady$,
    ])
      .pipe(takeUntil(this._destroy$))
      .subscribe(([extremesRange]) => {
        if (extremesRange) {
          this.data.setSubRangeContext({
            plant: this.plant!,
            range: { from: new Date(extremesRange.min), to: new Date(extremesRange.max) },
          });
        } else {
          /**
           * Reset to main range data
           */

          this.data.setSubRangeContext(null);
          this.data.reemitMainRangeData();
        }
      });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this._initializeCharts();
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['viewMode'] && !changes['viewMode'].firstChange) {
      this._updateSeriesVisibility();
      this.charts.forEach((chart) => {
        const yAxis = chart.yAxis[0];
        const keepY = isZoomed(chart) ? yAxis.getExtremes() : null;

        // If zoomed, force the y-axis to stay where it was.
        if (keepY) {
          yAxis.setExtremes(keepY.min, keepY.max, false, false, { trigger: 'keepExtremes' });
        }

        chart.redraw(false);

        // Reset the user extremes to undefined,
        // otherwise the axis will not rescale automatically anymore.
        if (keepY) {
          yAxis.setExtremes(undefined, undefined, false, false, { trigger: 'resetExtremes' });
        }
      });
    }
  }

  ngOnDestroy(): void {
    this._chart?.destroy();
    this._chartSP1?.destroy();
    this._chartSP2?.destroy();

    this._destroy$.next();
    this._destroy$.complete();
  }

  onDatetimeRangeChange(value: DatetimeRangeModel) {
    this._targetRange$.next(value);
  }

  /**
   * ExportableChart interface
   */
  getChartInstance(): Highcharts.Chart | undefined {
    return this._chart;
  }

  get exportFileName(): string | undefined {
    return this.data.getFilenameForCurrentlyVisibleRange();
  }

  private _updateSeriesVisibility() {
    const isHighVoltageView = this.viewMode === 'high-voltage';
    const visibleSeriesIds = isHighVoltageView
      ? chartSeriesOptionsIdsHighVoltageView
      : chartSeriesOptionsIdsDefaultView;

    this.charts.forEach((chart, index) => {
      chart.series.forEach((s) => {
        const predefinedSeriesOptions: Highcharts.SeriesOptionsType | undefined =
          chartSeriesOptions.find((so) => so.id === s.options.id);
        const shouldShow = visibleSeriesIds.includes(s.options.id as string);

        const isNavigatorSeries = (s as any).baseSeries;
        if (!isNavigatorSeries) {
          /**
           * Updating the series causes errors if data has changed.
           * Issue could be investigated further, but as a workaround we use setVisible and manual legend update.
           */
          // s.update(
          //   {
          //     // type: s.type as any,
          //     visible: shouldShow && predefinedSeriesOptions?.visible !== false,
          //     showInLegend: shouldShow,
          //     showInNavigator:
          //       shouldShow && (predefinedSeriesOptions as any)?.showInNavigator !== false,
          //   } as any,
          //   false,
          // );

          s.setVisible(shouldShow && predefinedSeriesOptions?.visible !== false, false);
          s.options.showInLegend = shouldShow;
          chart.legend.update({}, false);
        }
      });

      /**
       * Iterate again and set visible to true for navigator series.
       * Setting this in the previous loop does not work, because showInNavigator has not
       * been set yet (or for some other reason...).
       */
      if (index === 0) {
        chart.series.forEach((s) => {
          const isNavigatorSeries = (s as any).baseSeries;
          if (isNavigatorSeries) {
            s.setVisible(true, false);
          }
        });
      }
    });
  }

  private _afterSetExtremesHandler(e: Highcharts.AxisSetExtremesEventObject) {
    const resolution = resolutionForRange(e.min, e.max);
    if (resolution === '1m') {
      this._extremesRange$.next(undefined);
      return;
    }

    const currentExtremes = this._extremesRange$.getValue();
    if (currentExtremes) {
      // Do not update extremes range if the new range is within the current range and the resolution is the same
      if (
        resolution === currentExtremes.resolution &&
        isWithinInterval(e.min, { start: currentExtremes.min, end: currentExtremes.max }) &&
        isWithinInterval(e.max, { start: currentExtremes.min, end: currentExtremes.max })
      ) {
        return;
      }
    }

    const zoomOut = e.min === undefined && e.max === undefined;
    if (zoomOut) {
      this._extremesRange$.next(undefined);
      return;
    }

    this._extremesRange$.next({
      min: e.min,
      max: e.max,
      resolution,
      trigger: e.trigger,
    });
  }

  private _handleDataChanges(changes: DataPointsBatch) {
    if (!this._chart || !this._chartSP1 || !this._chartSP2) {
      this.appError$.next(new Error($localize`Received data before chart is ready!`));
      return;
    }

    if (changes.isMainRange && changes.eventName === SSE_EventName.DATA_INIT) {
      this.charts.forEach((chart) => {
        if (!chart) {
          return;
        }
        updateXAxisRange(chart, changes.from, changes.to);
        chart.zoomOut();
      });
    }

    switch (changes.eventName) {
      /**
       * Note that updating data$ stream should precede updating chart,
       * beacause updating chart could trigger our custom getDataRows
       * which depends on the latest value in data$ stream.
       */

      case SSE_EventName.DATA_INIT:
      case SSE_EventName.DATA_REPLACE: {
        if (changes.fullData) {
          // Attach custom export handler
          (this._chart as any).customExportCallback_getDataRows = () => {
            return getDataRows(changes.fullData, this.timeZone);
          };
        }

        this._updateChartsData(changes.pointsAdded, [], 'set', changes.isMainRange);

        break;
      }

      case SSE_EventName.DATA_PATCH: {
        this.appError$.next(new Error($localize`DATA_PATCH event received! Not implemented yet.`));

        break;
      }

      case SSE_EventName.DATA_APPEND: {
        const timestampsToRemove: Date[] = changes.pointsRemoved.map((p) => p.timestamp);
        this._updateChartsData(
          changes.pointsAdded,
          timestampsToRemove,
          'append',
          changes.isMainRange,
        );

        break;
      }
    }
  }

  private _initializeCharts() {
    this._chart = Highcharts.stockChart(this.chartContainerId, mainChartOptions);
    this._chartSP1 = Highcharts.stockChart(this.chartContainerIdSP1, subPlantChartOptions);
    this._chartSP2 = Highcharts.stockChart(this.chartContainerIdSP2, subPlantChartOptions);

    this._chart.update(
      {
        time: { timezone: this.timeZone },
        xAxis: { events: { afterSetExtremes: (e) => this._afterSetExtremesHandler(e) } },
      },
      false,
    );

    this._chartSP1.update(
      { time: { timezone: this.timeZone }, title: { text: 'Sub Plant 1' } },
      false,
    );

    this._chartSP2.update(
      { time: { timezone: this.timeZone }, title: { text: 'Sub Plant 2' } },
      false,
    );

    this._updateSeriesVisibility();

    this._chartReady$.next();
  }

  private _handleLoadingState(loading: boolean) {
    this.charts.forEach((chart) => (loading ? chart.showLoading() : chart.hideLoading()));
  }

  private _updateChartsData(
    newPoints: PVBESSHistoricalPowerData_Point[],
    timestampsToRemove: Date[],
    action: 'set' | 'append',
    affectNavigator: boolean = false,
  ) {
    let addedPoint: Highcharts.Point | undefined;

    if (this._chart) {
      addedPoint = updateChartData(
        this._chart,
        action,
        newPoints,
        timestampsToRemove,
        'total',
        affectNavigator,
      );
    }

    if (this._chartSP1) {
      const addedPointSP1 = updateChartData(
        this._chartSP1,
        action,
        newPoints,
        timestampsToRemove,
        'subPlant1',
        false,
      );

      if (!addedPoint) {
        addedPoint = addedPointSP1;
      }
    }

    if (this._chartSP2) {
      const addedPointSP2 = updateChartData(
        this._chartSP2,
        action,
        newPoints,
        timestampsToRemove,
        'subPlant2',
        false,
      );

      if (!addedPoint) {
        addedPoint = addedPointSP2;
      }
    }

    if (addedPoint) {
      addedPoint.onMouseOver();
    }
  }
}
