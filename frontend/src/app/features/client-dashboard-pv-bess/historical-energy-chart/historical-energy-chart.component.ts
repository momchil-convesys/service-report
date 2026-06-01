import { AsyncPipe } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnDestroy,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  of,
  ReplaySubject,
  shareReplay,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';
import { IntegrationPeriod, SSE_DataRequest, SSE_EventName } from '../../../constants';
import { Plant } from '../../../data/models';
import { generateFileNameForExport, handleAnyError } from '../../../helpers';
import Highcharts from '../../../highcharts-global-config';
import { ExportableChart } from '../../../shared/base-chart-component/exportable-chart';
import { DatetimeRangeSelectComponent } from '../../../shared/datetime-range-select/datetime-range-select.component';
import {
  DatetimeRangeModel,
  isSameDatetimeRange,
} from '../../../shared/datetime-range-select/models';
import { HighchartsExportOptionComponent } from '../../../shared/highcharts-export-option/highcharts-export-option.component';
import { PvBessViewMode } from '../constants';
import { aggregateEnergyDistributionFromChartData } from '../energy-distribution/_data/aggregate-energy-data.helper';
import { EnergyDistributionDataService } from '../energy-distribution/_data/data.service';
import { HistoricalEnergyApiService } from './_data/api.service';
import {
  appendData_mutate,
  patchData_mutate,
  replaceData_mutate,
} from './_data/historical-energy.updater';
import { DataRequestContext, DataRequestWithContext, ErrorWithContext } from './_data/interfaces';
import { PVBESSHistoricalEnergyData } from './_data/models';
import { getDataRows } from './chart/chart-exporting';
import {
  getMainChartOptions,
  getSubPlantChartOptions,
  initializeChart,
  updateChartData,
} from './chart/chart-manipulation';
import {
  chartSeriesOptionsIdsDefaultView,
  chartSeriesOptionsIdsHighVoltageView,
} from './chart/chart-series';
import { DatetimeRangeSyncService } from './datetime-range-sync.service';

@Component({
  selector: 'app-historical-energy-chart',
  standalone: true,
  imports: [
    AsyncPipe,
    DatetimeRangeSelectComponent,
    NzAlertModule,
    HighchartsExportOptionComponent,
  ],
  templateUrl: './historical-energy-chart.component.html',
  styleUrl: './historical-energy-chart.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [DatetimeRangeSyncService, HistoricalEnergyApiService],
})
export class HistoricalEnergyChartComponent implements AfterViewInit, OnDestroy, ExportableChart {
  @Input({ required: true }) plant: Plant | undefined;
  @Input() viewMode: PvBessViewMode = 'default';

  get timeZone(): string | undefined {
    return this.plant?.timeZone;
  }

  private _targetRange$ = new BehaviorSubject<DatetimeRangeModel | undefined>(undefined);
  targetRange$: Observable<DatetimeRangeModel>;

  get defaultIntegrationPeriod(): IntegrationPeriod {
    return this.plant?.plantSpecificMetadata?.scheduleIntegrationPeriodMinutes === 15
      ? IntegrationPeriod.QuaterOfAnHour
      : IntegrationPeriod.Hours;
  }

  private _chart: Highcharts.Chart | undefined;
  private _chartSubPlant1: Highcharts.Chart | undefined;
  private _chartSubPlant2: Highcharts.Chart | undefined;

  get chart() {
    return this._chart;
  }

  get charts(): Highcharts.Chart[] {
    return [this._chart, this._chartSubPlant1, this._chartSubPlant2].filter(
      (chart) => chart !== undefined,
    );
  }

  private _chartReady$ = new Subject<void>();
  chartContainerId = this.constructor.name + Math.random().toString();
  chartContainerIdSubPlant1 = this.constructor.name + 'subPlant1' + Math.random().toString();
  chartContainerIdSubPlant2 = this.constructor.name + 'subPlant2' + Math.random().toString();

  private _isLoading$ = new BehaviorSubject<boolean>(false);

  loadedData$ = new BehaviorSubject<undefined | DataRequestWithContext<PVBESSHistoricalEnergyData>>(
    undefined,
  );

  dataError$: Observable<Error | undefined>;

  appError$: ReplaySubject<Error | undefined> = new ReplaySubject(1);

  private _destroy$ = new Subject<void>();

  energyDistributionDataService = inject(EnergyDistributionDataService);

  constructor(
    data: HistoricalEnergyApiService,
    private _syncTargetRange: DatetimeRangeSyncService,
  ) {
    this.targetRange$ = this._targetRange$.pipe(
      filter((targetRange) => targetRange !== undefined),
      distinctUntilChanged((a, b) => isSameDatetimeRange(a, b, false)),
    );

    this.targetRange$ = this._syncTargetRange.getTargetRange().pipe(takeUntil(this._destroy$));

    this.loadedData$.pipe(takeUntil(this._destroy$)).subscribe((loadedData) => {
      const chartData = loadedData?.dataRequest?.data;
      const aggregatedData = aggregateEnergyDistributionFromChartData(chartData, this.timeZone);
      this.energyDistributionDataService.setData(aggregatedData);
    });

    const chartDataRequestWithContext$: Observable<
      DataRequestWithContext<PVBESSHistoricalEnergyData>
    > = combineLatest([
      this.targetRange$.pipe(distinctUntilChanged(isSameDatetimeRange)),
      this._chartReady$,
    ]).pipe(
      switchMap(([targetRange]) => {
        const plant = this.plant!;

        const chartTitle = $localize`Historical Energy Data`;
        const context: DataRequestContext = {
          targetRange,
          plant,
          exportFileName: generateFileNameForExport(chartTitle, plant, targetRange),
        };

        return data.fetchHistoricalEnergyData(plant, targetRange).pipe(
          map((req) => ({
            ...context,
            dataRequest: req,
          })),
          catchError((err: any) => {
            const errorWithContext: ErrorWithContext = {
              ...context,
              error: err,
            };

            throw errorWithContext;
          }),
          takeUntil(this._destroy$),
        );
      }),
      catchError((errorWithContext: ErrorWithContext) => {
        const req: DataRequestWithContext<PVBESSHistoricalEnergyData> = {
          ...errorWithContext,
          dataRequest: {
            isLoading: false,
            error: handleAnyError(errorWithContext.error, undefined),
            eventName: null,
          },
        };

        return of(req);
      }),
      shareReplay(1),
      takeUntil(this._destroy$),
    );

    const chartDataRequest$: Observable<SSE_DataRequest<PVBESSHistoricalEnergyData>> =
      chartDataRequestWithContext$.pipe(map((req) => req.dataRequest));

    chartDataRequest$.pipe(takeUntilDestroyed()).subscribe((req) => {
      this._isLoading$.next(req.isLoading);
    });

    this.dataError$ = chartDataRequest$.pipe(
      map((req) => req.error),
      takeUntilDestroyed(),
    );

    this._isLoading$.subscribe((loading) => {
      this.charts.forEach((chart) => this._handleLoadingState(chart, loading));
      this.energyDistributionDataService.setLoading(loading);
    });

    chartDataRequestWithContext$.subscribe((req) => {
      if (!this._chart || !this._chartSubPlant1 || !this._chartSubPlant2) {
        this.appError$.next(new Error($localize`Received data before chart is ready!`));
        return;
      }

      if (req.dataRequest.eventName) {
        switch (req.dataRequest.eventName) {
          /**
           * Note that updating data$ stream should precede updating chart,
           * beacause updating chart could trigger our custom getDataRows
           * which depends on the latest value in data$ stream.
           */

          case SSE_EventName.DATA_INIT: {
            this.loadedData$.next(req);

            // Attach custom export handler
            (this._chart as any).customExportCallback_getDataRows = () => {
              return getDataRows(this.loadedData$.getValue());
            };

            initializeChart(this._chart, req);
            initializeChart(this._chartSubPlant1, req);
            initializeChart(this._chartSubPlant2, req);

            this._updateSeriesVisibility();

            updateChartData(this._chart, req.dataRequest.data, 'set', 'total');
            updateChartData(this._chartSubPlant1, req.dataRequest.data, 'set', 'subPlant1');
            updateChartData(this._chartSubPlant2, req.dataRequest.data, 'set', 'subPlant2');

            break;
          }

          case SSE_EventName.DATA_REPLACE: {
            const currentData = this.loadedData$.getValue();
            replaceData_mutate(currentData, req);
            this.loadedData$.next(currentData);

            updateChartData(this._chart, req.dataRequest.data, 'set', 'total');
            updateChartData(this._chartSubPlant1, req.dataRequest.data, 'set', 'subPlant1');
            updateChartData(this._chartSubPlant2, req.dataRequest.data, 'set', 'subPlant2');

            break;
          }

          case SSE_EventName.DATA_PATCH: {
            const currentData = this.loadedData$.getValue();
            patchData_mutate(currentData, req);
            this.loadedData$.next(currentData);

            updateChartData(this._chart, req.dataRequest.data, 'patch', 'total');
            updateChartData(this._chartSubPlant1, req.dataRequest.data, 'patch', 'subPlant1');
            updateChartData(this._chartSubPlant2, req.dataRequest.data, 'patch', 'subPlant2');

            break;
          }

          case SSE_EventName.DATA_APPEND: {
            const currentData = this.loadedData$.getValue();
            appendData_mutate(currentData, req);
            this.loadedData$.next(currentData);

            updateChartData(this._chart, req.dataRequest.data, 'append', 'total');
            updateChartData(this._chartSubPlant1, req.dataRequest.data, 'append', 'subPlant1');
            updateChartData(this._chartSubPlant2, req.dataRequest.data, 'append', 'subPlant2');

            break;
          }
        }
      } else {
        if (req.dataRequest.error) {
          updateChartData(this._chart, undefined, 'set', 'total');
          updateChartData(this._chartSubPlant1, undefined, 'set', 'subPlant1');
          updateChartData(this._chartSubPlant2, undefined, 'set', 'subPlant2');
        }
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['viewMode']) {
      this._updateSeriesVisibility();
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this._chart = Highcharts.chart(this.chartContainerId, getMainChartOptions());
      this._chartSubPlant1 = Highcharts.chart(
        this.chartContainerIdSubPlant1,
        getSubPlantChartOptions('Sub Plant 1'),
      );
      this._chartSubPlant2 = Highcharts.chart(
        this.chartContainerIdSubPlant2,
        getSubPlantChartOptions('Sub Plant 2'),
      );

      this._updateSeriesVisibility();

      this.charts.forEach((chart) => this._handleLoadingState(chart, this._isLoading$.getValue()));

      this._chartReady$.next();
    }, 0);
  }

  ngOnDestroy(): void {
    this._chart?.destroy();
    this._chartSubPlant1?.destroy();
    this._chartSubPlant2?.destroy();
    this._destroy$.next();
    this._destroy$.complete();
  }

  onDatetimeRangeChange(value: DatetimeRangeModel) {
    this._syncTargetRange.onDatetimeRangeChange(value);
  }

  /**
   * ExportableChart interface
   */
  getChartInstance(): Highcharts.Chart | undefined {
    return this._chart;
  }

  private _handleLoadingState(chart: Highcharts.Chart, loading: boolean) {
    if (loading) {
      chart.showLoading();
    } else {
      chart.hideLoading();
    }
  }

  private _updateSeriesVisibility() {
    const isHighVoltageView = this.viewMode === 'high-voltage';
    const visibleSeriesIds = isHighVoltageView
      ? chartSeriesOptionsIdsHighVoltageView
      : chartSeriesOptionsIdsDefaultView;

    this.charts.forEach((chart) => {
      chart.series.forEach((s) => {
        const shouldShow = visibleSeriesIds.includes(s.options.id as string);
        s.update(
          {
            type: s.options.type as any,
            visible: shouldShow,
            showInLegend: shouldShow,
          },
          false,
        );
      });

      chart.redraw(false);
    });
  }
}
