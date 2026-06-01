import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isAfter } from 'date-fns';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  filter,
  map,
  Observable,
  of,
  ReplaySubject,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';
import { DataRequest, SSE_DataRequest, SSE_EventName } from '../../../constants';
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
import { PageRoutingService } from '../../../shared/page-routing.service';
import { WeatherApiService } from '../_data/api.service';
import {
  chartTitleForParameterName_Default,
  chartTitleForParameterName_GTI,
  PlantWeatherDataChartIdentifier,
} from '../_data/constants';
import { PlantWeather_HistoricalTimelineData_DTO } from '../_data/dto';
import {
  ChartSpecifics,
  DataRequestContext,
  DataRequestWithContext,
  ErrorWithContext,
} from '../_data/interfaces';
import { appendData_mutate, patchData_mutate, replaceData_mutate } from '../_data/updater';
import { getDataRows } from './chart/chart-exporting';
import { chartOptions, initializeChart, updateChartData } from './chart/chart-manipulation';
import { DatetimeRangeSyncService } from './datetime-range-sync.service';

@Component({
  selector: 'app-plant-weather-chart-widget',
  imports: [
    AsyncPipe,
    DatetimeRangeSelectComponent,
    NzAlertModule,
    HighchartsExportOptionComponent,
  ],
  templateUrl: './plant-weather-chart-widget.component.html',
  styleUrl: './plant-weather-chart-widget.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
})
export class PlantWeatherChartWidgetComponent implements ExportableChart {
  @Input({ required: true }) chartSpecifics: ChartSpecifics | undefined;

  get showFullRangeSelect() {
    return (
      this.chartSpecifics?.chartIdentifier === PlantWeatherDataChartIdentifier.PlantOverview ||
      this.chartSpecifics?.chartIdentifier === PlantWeatherDataChartIdentifier.CumulativePerTS ||
      this.chartSpecifics?.parameterName === 'rain'
    );
  }

  get chartTitle$(): Observable<string | undefined> | undefined {
    return this.plant$?.pipe(map((plant) => this._getChartTitleForPlant(plant)));
  }

  private _componentInput$ = new ReplaySubject<ChartSpecifics>(1);

  plant$: Observable<Plant | undefined> | undefined;

  targetRange$: Observable<DatetimeRangeModel>;
  timeZone$: Observable<string | undefined>;

  private _chart: Highcharts.Chart | undefined;
  get chart() {
    return this._chart;
  }

  private _chartReady$ = new Subject<void>();
  chartContainerId = this.constructor.name + Math.random().toString();

  private _isLoading$ = new BehaviorSubject<boolean>(false);

  data$ = new BehaviorSubject<
    undefined | DataRequestWithContext<PlantWeather_HistoricalTimelineData_DTO>
  >(undefined);

  dataError$: Observable<Error | undefined>;

  appError$: ReplaySubject<Error | undefined> = new ReplaySubject(1);

  private _destroy$ = new Subject<void>();

  constructor(
    pageRouting: PageRoutingService,
    data: WeatherApiService,
    private _syncTargetRange: DatetimeRangeSyncService,
  ) {
    const plantRequest$: Observable<DataRequest<Plant>> = pageRouting
      .getPlantRequestFromQueryParams()
      .pipe(takeUntilDestroyed());

    this.plant$ = plantRequest$.pipe(map((req) => req.data));

    this.timeZone$ = this.plant$.pipe(map((plant) => plant?.timeZone));

    this.targetRange$ = this._componentInput$.pipe(
      switchMap((componentInput) =>
        this._syncTargetRange
          .getTargetRangeForChartIdentifier(componentInput)
          .pipe(takeUntil(this._destroy$)),
      ),
    );

    const chartDataRequestWithContext$: Observable<
      DataRequestWithContext<PlantWeather_HistoricalTimelineData_DTO>
    > = combineLatest([
      this.plant$.pipe(
        filter((plant) => plant !== undefined),
        distinctUntilKeyChanged('id'),
      ),
      this.targetRange$.pipe(distinctUntilChanged(isSameDatetimeRange)),
      this._chartReady$,
      this._componentInput$,
    ]).pipe(
      switchMap(([plant, targetRange, _, chartSpecifics]) => {
        const chartTitle = this._getChartTitleForPlant(plant) || $localize`Weather data`;
        const context: DataRequestContext = {
          targetRange,
          plant,
          chartSpecifics,
          exportFileName: generateFileNameForExport(chartTitle, plant, targetRange),
        };

        const liveData = isAfter(new Date(targetRange.to), new Date());
        return data.fetchPlantWeatherData(plant, targetRange, liveData, chartSpecifics).pipe(
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
        const req: DataRequestWithContext<PlantWeather_HistoricalTimelineData_DTO> = {
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

    const chartDataRequest$: Observable<SSE_DataRequest<PlantWeather_HistoricalTimelineData_DTO>> =
      chartDataRequestWithContext$.pipe(map((req) => req.dataRequest));

    this._getLoadingStream(plantRequest$, chartDataRequest$)
      .pipe(takeUntilDestroyed())
      .subscribe((isLoading) => {
        this._isLoading$.next(isLoading);
      });

    this.dataError$ = this._getErrorsStream(plantRequest$, chartDataRequest$).pipe(
      takeUntilDestroyed(),
    );

    this._isLoading$.subscribe((loading) => {
      if (this._chart) {
        this._handleLoadingState(this._chart, loading);
      }
    });

    chartDataRequestWithContext$.subscribe((req) => {
      if (!this._chart) {
        /**
         * This is unexpected behaviour, as the data stream is triggered
         * by an event that is emitted after the chart is ready.
         */
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

          case SSE_EventName.DATA_INIT:
            this.data$.next(req);

            // Attach custom export handler
            (this._chart as any).customExportCallback_getDataRows = () => {
              return getDataRows(this.data$.getValue());
            };

            initializeChart(this._chart, req);

            updateChartData(this._chart, req.dataRequest.data, 'set', req.chartSpecifics);

            break;

          case SSE_EventName.DATA_REPLACE:
            replaceData_mutate(this.data$.getValue(), req);

            updateChartData(this._chart, req.dataRequest.data, 'set', req.chartSpecifics);

            break;

          case SSE_EventName.DATA_PATCH:
            patchData_mutate(this.data$.getValue(), req);

            updateChartData(this._chart, req.dataRequest.data, 'patch', req.chartSpecifics);

            break;

          case SSE_EventName.DATA_APPEND:
            appendData_mutate(this.data$.getValue(), req);

            updateChartData(this._chart, req.dataRequest.data, 'append', req.chartSpecifics);

            break;
        }
      } else {
        if (req.dataRequest.error) {
          updateChartData(this._chart, undefined, 'set', req.chartSpecifics);

          this.data$.next(req);
        }
      }
    });
  }

  ngAfterViewInit(): void {
    /**
     * Wait for the component view to settle (E.g: layout width),
     * then create the chart on the next cycle.
     */
    setTimeout(() => {
      this._chart = Highcharts.chart(this.chartContainerId, chartOptions);
      this._chartReady$.next();

      // if (this.forChart === PlantWeatherDataChartIdentifier.CumulativePerTS) {
      //   this._chart.update({ title: { text: 'GTI daily irradiation amount' } }, false);
      // }

      this._handleLoadingState(this._chart, this._isLoading$.getValue());
    }, 0);
  }

  ngOnInit() {
    if (this.chartSpecifics !== undefined) {
      this._componentInput$.next(this.chartSpecifics);
    }
  }

  ngOnDestroy(): void {
    this._chart?.destroy();

    this._destroy$.next();
    this._destroy$.complete();
  }

  onDatetimeRangeChange(value: DatetimeRangeModel, chartSpecifics: ChartSpecifics) {
    this._syncTargetRange.onDatetimeRangeChange(value, chartSpecifics);
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

  private _getErrorsStream(
    req1$: Observable<DataRequest<any>>,
    req2$: Observable<DataRequest<any>>,
  ): Observable<Error | undefined> {
    return combineLatest([
      req1$.pipe(
        startWith({ error: undefined }),
        map((req) => req.error),
      ),
      req2$.pipe(
        startWith({ error: undefined }),
        map((req) => req.error),
      ),
    ]).pipe(
      map(([plantRequestError, chartDataRequestError]) => {
        return plantRequestError || chartDataRequestError;
      }),
    );
  }

  private _getLoadingStream(
    req1$: Observable<DataRequest<any>>,
    req2$: Observable<DataRequest<any>>,
  ): Observable<boolean> {
    return combineLatest([
      req1$.pipe(
        startWith({ isLoading: false }),
        map((req) => req.isLoading),
      ),
      req2$.pipe(
        startWith({ isLoading: false }),
        map((req) => req.isLoading),
      ),
    ]).pipe(
      map(([plantRequestLoading, chartDataRequestLoading]) => {
        return plantRequestLoading || chartDataRequestLoading;
      }),
    );
  }

  private _getChartTitleForPlant(plant: Plant | undefined): string | undefined {
    const parameterName = this.chartSpecifics?.parameterName;
    const plantId = plant?.id;

    /**
     * TODO: do not check against HARDCODED plant ids!
     */
    if (plantId === '26') {
      return parameterName ? chartTitleForParameterName_GTI[parameterName] : undefined;
    }

    return parameterName ? chartTitleForParameterName_Default[parameterName] : undefined;
  }
}
