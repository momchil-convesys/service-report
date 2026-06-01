import { AsyncPipe, formatNumber } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnDestroy,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import {
  BehaviorSubject,
  combineLatest,
  Observable,
  ReplaySubject,
  Subject,
  takeUntil,
} from 'rxjs';
import { APP_LOCALE_ID, formatTimestampForTooltip } from '../../../../../app-locale';
import { yAxisZeroPlotLine } from '../../../../../helpers';
import Highcharts from '../../../../../highcharts-global-config';
import { BESSDataService } from '../../../_data/data.service';
import { BESSAssetDTO } from '../../../_data/dto/assets/asset.dto';
import { BESSLiveMomentaryDataMessageDTO } from '../../../_data/dto/live-momentary-data.dto';
import { BESSParameterDefinitionDTO } from '../../../_data/dto/parameters.dto';
import { BESSMomentaryDataService } from '../../../_data/momentary-data.service';
import { preferredOptionsPerParameter } from '../charts-options/hints';
import { chartOptions } from './chart-manipulation';
import { MomentaryDataChartRequest } from './interfaces';

@Component({
  selector: 'app-momentary-data-chart',
  imports: [NzAlertModule, AsyncPipe],
  templateUrl: './momentary-data-chart.component.html',
  styleUrl: './momentary-data-chart.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MomentaryDataChartComponent implements OnDestroy {
  @Input({ required: true }) request: MomentaryDataChartRequest | null = null;
  @Input() extremes: { min: number; max: number } | null = null;

  private _componentInput$ = new ReplaySubject<MomentaryDataChartRequest | undefined>(1);

  private _chart: Highcharts.Chart | undefined;
  get chart() {
    return this._chart;
  }

  private _chartReady$ = new Subject<Highcharts.Chart>();
  chartContainerId = this.constructor.name + Math.random().toString();

  private _isLoading$ = new BehaviorSubject<boolean>(false);

  private _destroy$ = new Subject<void>();
  private readonly _componentWatchId =
    this.constructor.name + '-' + Math.random().toString(36).slice(2);

  dataError$: Observable<Error | undefined> | undefined;

  appError$: ReplaySubject<Error | undefined> = new ReplaySubject(1);

  private _dataService: BESSDataService = inject(BESSDataService);
  private _liveData = inject(BESSMomentaryDataService);

  private _trackedAssetIds = new Set<string>();
  private _parameterKeyById = new Map<string, string>();
  private _parameterDefinitions: BESSParameterDefinitionDTO[] = [];
  private _chartAssets: BESSAssetDTO[] = [];
  private _latestValues = new Map<string, Record<string, ParameterSnapshot>>();
  private _currentBessId: string | null = null;

  constructor() {
    combineLatest([this._componentInput$, this._chartReady$])
      .pipe(takeUntil(this._destroy$))
      .subscribe(([request, chart]) => {
        if (!chart) {
          return;
        }

        if (!request) {
          this._liveData.unregisterWatch(this._componentWatchId);
          this._clearChart(chart);
          this._isLoading$.next(false);
          return;
        }

        this._initWithData(chart, request);
      });

    this._liveData.liveMessage$
      .pipe(takeUntil(this._destroy$))
      .subscribe((message) => this._handleLiveMessage(message));

    this._isLoading$.pipe(takeUntil(this._destroy$)).subscribe((loading) => {
      if (this._chart) {
        this._handleLoadingState(this._chart, loading);
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

      this._chartReady$.next(this._chart);

      this._handleLoadingState(this._chart, this._isLoading$.getValue());
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['request']) {
      this._componentInput$.next(changes['request'].currentValue);
    }

    if (changes['extremes']) {
      this._chart?.xAxis[0].setExtremes(this.extremes?.min, this.extremes?.max, false);
      this.chart?.showResetZoom();
    }
  }

  ngOnDestroy(): void {
    this._liveData.unregisterWatch(this._componentWatchId);
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _handleLoadingState(chart: Highcharts.Chart, loading: boolean) {
    if (loading) {
      chart.showLoading();
    } else {
      chart.hideLoading();
    }
  }

  private _initWithData(chart: Highcharts.Chart, request: MomentaryDataChartRequest) {
    const bessMetadata = this._dataService.bessMetadataCache;

    if (!bessMetadata) {
      this.appError$.next(new Error('Missing BESS metadata'));
      this._liveData.unregisterWatch(this._componentWatchId);
      this._isLoading$.next(false);
      return;
    }

    const assets =
      request.assetIds
        .map((id) => bessMetadata.assets.find((asset) => asset.id === id))
        .filter((asset): asset is BESSAssetDTO => !!asset) ?? [];
    const parametersToShow =
      request.parameterKeys
        .map((key) => {
          const parameterDefinition = bessMetadata.parameterDefinitions.find((p) => p.key === key);
          if (!parameterDefinition) {
            console.warn(`Parameter definition not found for key: ${key}`);
          }
          return parameterDefinition;
        })
        .filter((param): param is BESSParameterDefinitionDTO => !!param) ?? [];

    if (!assets.length || !parametersToShow.length) {
      this.appError$.next(new Error('No assets or parameters to display'));
      this._liveData.unregisterWatch(this._componentWatchId);
      this._chartAssets = [];
      this._parameterDefinitions = [];
      this._latestValues.clear();
      this._isLoading$.next(false);
      this._clearChart(chart);
      return;
    }

    this.appError$.next(undefined);

    this._chartAssets = assets;
    this._parameterDefinitions = parametersToShow;
    this._latestValues.clear();

    this._updateXAxis(chart, assets);
    this._configureAxesAndSeries(chart, parametersToShow);
    this._applyInteractivity(chart, request);
    this._applyDataToChart(chart);
    this._syncLiveWatch(request, parametersToShow);
  }

  private _updateXAxis(chart: Highcharts.Chart, assets: BESSAssetDTO[]): void {
    chart.xAxis[0].update(
      {
        categories: assets.map((a) => a.id),
        max: assets.length - 1,
        labels: {
          formatter: function (context) {
            const assetId = context.value.toString();
            const asset = assets.find((a) => a.id === assetId);
            if (!asset) {
              return assetId;
            }
            return asset.name;
          },
        },
      },
      false,
    );
  }

  private _configureAxesAndSeries(
    chart: Highcharts.Chart,
    parametersToShow: BESSParameterDefinitionDTO[],
  ): void {
    const defaultUnitKey = '__no_unit__';
    const parametersByUnit = new Map<string, BESSParameterDefinitionDTO[]>();

    parametersToShow.forEach((p) => {
      const unitKey = p.unit || defaultUnitKey;
      if (!parametersByUnit.has(unitKey)) {
        parametersByUnit.set(unitKey, []);
      }
      parametersByUnit.get(unitKey)!.push(p);
    });

    while (chart.series.length > 0) {
      chart.series[0].remove(false);
    }

    while (chart.yAxis.length > 1) {
      chart.yAxis[chart.yAxis.length - 1].remove(false);
    }

    const unitToYAxisIndex = new Map<string, number>();
    let yAxisIndex = 0;

    parametersByUnit.forEach((params, unitKey) => {
      const yAxisOptions = this._getYAxisOptionsForParameter(params[0]);

      if (yAxisIndex === 0) {
        chart.yAxis[0].update(yAxisOptions, false);
      } else {
        chart.addAxis(
          {
            ...yAxisOptions,
            opposite: yAxisIndex % 2 === 1,
          },
          false,
          false,
        );
      }

      unitToYAxisIndex.set(unitKey, yAxisIndex);
      yAxisIndex++;
    });

    parametersToShow.forEach((p) => {
      const unitKey = p.unit || defaultUnitKey;
      const axisIndex = unitToYAxisIndex.get(unitKey) ?? 0;

      const preferredColor: string | undefined = preferredOptionsPerParameter[p.key]?.color;
      const preferredNegativeColor: string | undefined =
        preferredOptionsPerParameter[p.key]?.negativeColor;

      chart.addSeries(
        {
          id: p.key,
          type: 'column',
          yAxis: axisIndex,
          name: p.name,
          dataLabels: {
            enabled: true,
          },
          tooltip: {
            valueSuffix: p.unit || undefined,
          },
          ...(preferredColor ? { color: preferredColor } : {}),
          ...(preferredNegativeColor ? { negativeColor: preferredNegativeColor } : {}),
        },
        false,
      );
    });
  }

  private _applyInteractivity(chart: Highcharts.Chart, request: MomentaryDataChartRequest): void {
    chart.update(request.chartConfiguration, false);

    const assetNameLookup = (assetId: string | null | undefined): string | undefined =>
      assetId ? this._dataService.getBESSAssetName(assetId) : undefined;

    chart.update(
      {
        plotOptions: {
          column: {
            cursor: request.columnClickHandler ? 'pointer' : undefined,
            events: {
              click: (e: Highcharts.SeriesClickEventObject) =>
                request.columnClickHandler?.(e.point.key.toString()),
            },
          },
        },
        tooltip: {
          shared: true,
          useHTML: true,
          outside: true,
          borderRadius: 4,
          padding: 12,
          formatter: function () {
            const context = this as any;

            const points: Highcharts.Point[] = context.points || [context.point];

            const tooltipPoints = points.map((point) => ({
              point: point,
              series: point.series as Highcharts.Series & {
                tooltipOptions?: { valueSuffix?: string };
              },
              color: point.color ?? point.series.color,
              value: point.y ?? null,
            }));

            if (!tooltipPoints.length) {
              return '';
            }

            // TODO: set timezone
            // const timezone = tooltipPoints[0].series.chart.options.time?.timezone;
            const measurementTimestamp =
              (tooltipPoints[0].point as any).custom?.measurementTime ?? null;
            const timestampLabel = measurementTimestamp
              ? formatTimestampForTooltip(measurementTimestamp, undefined, {
                  customFormat: 'HH:mm:ss',
                })
              : '';

            const borderSpacing = '0 0.25em';

            let tooltipHtml = `
              <table style="border-spacing: ${borderSpacing}; border-collapse: separate; width: 100%">
                <tr>
                  <td colspan="2">
                    <span style="display: flex;">
                      <b>${assetNameLookup(tooltipPoints[0].point.key.toString()) ?? ''}</b>
                      <span class="secondary-text" style="margin-left: auto; padding-left: 0.5em;">${timestampLabel ?? ''}</span>
                    </span>
                  </td>
                </tr>
                `;

            tooltipPoints.forEach((entry) => {
              const valueSuffix = entry.series.tooltipOptions?.valueSuffix ?? '';
              const formattedValue =
                entry.value === null || entry.value === undefined
                  ? '&mdash;'
                  : `${formatNumber(entry.value, APP_LOCALE_ID, '1.0-1')}${valueSuffix}`;

              tooltipHtml += `
                <tr>
                  <td>
                    <span style="color:${entry.color}; padding-right: 0.25em">\u25CF</span>
                    ${entry.series.name}
                  </td>
                  <td style="text-align: right; padding-left: 0.5em; font-weight: bold;">
                    ${formattedValue}
                  </td>
                </tr>`;
            });

            tooltipHtml += `
              </table>
            `;

            return tooltipHtml;
          },
        },
      },
      false,
    );
  }

  private _getYAxisOptionsForParameter(
    parameter: BESSParameterDefinitionDTO,
  ): Highcharts.YAxisOptions {
    const min: number | undefined = preferredOptionsPerParameter[parameter.key]?.min;
    const max: number | undefined = preferredOptionsPerParameter[parameter.key]?.max;

    const shouldEmphasizeZeroLine = true;

    return {
      min,
      max,
      title: { text: parameter.unit ?? undefined },
      plotLines: shouldEmphasizeZeroLine ? [yAxisZeroPlotLine] : undefined,
    };
  }

  private _syncLiveWatch(
    request: MomentaryDataChartRequest,
    parameters: BESSParameterDefinitionDTO[],
  ): void {
    this._trackedAssetIds = new Set(request.assetIds);
    this._parameterKeyById.clear();

    const logicalParameterIds: string[] = [];

    parameters.forEach((parameter) => {
      if (parameter.id) {
        logicalParameterIds.push(parameter.id);
        this._parameterKeyById.set(parameter.id, parameter.key);
      }
    });

    const hasAssets = this._trackedAssetIds.size > 0;
    const hasParameters = logicalParameterIds.length > 0;

    if (!hasAssets || !hasParameters) {
      this._liveData.unregisterWatch(this._componentWatchId);
      this._isLoading$.next(false);
      return;
    }

    if (this._currentBessId !== request.bessId) {
      this._currentBessId = request.bessId;
      this._liveData.setBESS(request.bessId);
    }

    this._liveData.registerWatch(this._componentWatchId, {
      assetFilter: { assetIds: Array.from(this._trackedAssetIds) },
      logicalParameterIds,
    });
    this._isLoading$.next(true);
  }

  private _handleLiveMessage(message: BESSLiveMomentaryDataMessageDTO | null): void {
    if (
      !message ||
      !this._chart ||
      this._trackedAssetIds.size === 0 ||
      this._parameterKeyById.size === 0
    ) {
      return;
    }

    let hasUpdate = false;

    message.assets.forEach((assetMessage) => {
      if (!this._trackedAssetIds.has(assetMessage.assetId)) {
        return;
      }

      const assetValues = this._latestValues.get(assetMessage.assetId) ?? {};

      Object.entries(assetMessage.values || {}).forEach(([parameterId, entry]) => {
        if (!entry) {
          return;
        }
        const parameterKey = this._parameterKeyById.get(parameterId);
        if (!parameterKey) {
          return;
        }
        const [unixTimestamp, value] = entry;
        const measurementTime =
          typeof unixTimestamp === 'number'
            ? new Date(unixTimestamp * 1000).toISOString()
            : message.timestamp;

        assetValues[parameterKey] = {
          value,
          measurementTime,
        };
        hasUpdate = true;
      });

      this._latestValues.set(assetMessage.assetId, assetValues);
    });

    if (!hasUpdate) {
      return;
    }

    this._isLoading$.next(false);
    this._applyDataToChart(this._chart);
  }

  private _applyDataToChart(chart: Highcharts.Chart): void {
    if (!this._chartAssets.length || !this._parameterDefinitions.length) {
      chart.redraw();
      return;
    }

    this._parameterDefinitions.forEach((parameter) => {
      const series = chart.get(parameter.key) as Highcharts.Series | undefined;
      if (!series) {
        return;
      }

      const data = this._chartAssets.map((asset) => {
        const assetValues = this._latestValues.get(asset.id);
        const snapshot = assetValues?.[parameter.key];
        return {
          y: snapshot?.value ?? null,
          custom: {
            measurementTime: snapshot?.measurementTime ?? null,
          },
        };
      });

      series.setData(data, false);
    });

    chart.redraw();
  }

  private _clearChart(chart: Highcharts.Chart): void {
    while (chart.series.length > 0) {
      chart.series[0].remove(false);
    }
    while (chart.yAxis.length > 1) {
      chart.yAxis[chart.yAxis.length - 1].remove(false);
    }
    chart.redraw();
  }
}

interface ParameterSnapshot {
  value: number | null;
  measurementTime: string | null;
}
