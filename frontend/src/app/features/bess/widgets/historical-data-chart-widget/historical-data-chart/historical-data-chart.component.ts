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
import {
  BESSHistoricalDataPoint,
  BESSHistoricalSeriesMock,
  generateBESSHistoricalSeriesForToday,
} from '../../../../../../mock/bess-historical-metrics';
import { chartColors } from '../../../../../constants';
import { yAxisZeroPlotLine } from '../../../../../helpers';
import Highcharts from '../../../../../highcharts-global-config';
import { BESSAssetType } from '../../../_data/dto/assets/asset-base.dto';
import { BESSParameterDefinitionDTO } from '../../../_data/dto/parameters.dto';
import {
  getPreferredColors,
  preferredOptionsPerParameter,
} from '../../momentary-data-chart-widget/charts-options/hints';
import { chartOptions } from './chart-manipulation';
import { HistoricalDataChartRequest } from './interfaces';

@Component({
  selector: 'app-historical-data-chart',
  standalone: true,
  templateUrl: './historical-data-chart.component.html',
  styleUrl: './historical-data-chart.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoricalDataChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() request: HistoricalDataChartRequest | null = null;

  chartContainerId = `${this.constructor.name}-${Math.random().toString(36).slice(2, 9)}`;

  private _chart: Highcharts.Chart | undefined;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this._chart = Highcharts.chart(this.chartContainerId, chartOptions);
      this._updateChart();
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['request'] && !changes['request'].firstChange) {
      this._updateChart();
    }
  }

  ngOnDestroy(): void {
    this._chart?.destroy();
    this._chart = undefined;
  }

  private _updateChart(): void {
    if (!this._chart || !this.request) {
      return;
    }

    const metadata = this.request.bessMetadata;
    const parameterDefinition = this._getParameterDefinition(
      metadata.parameterDefinitions,
      this.request.parameterKey,
    );

    const historicalSeries = this._generateHistoricalSeries(this.request);
    if (!historicalSeries) {
      return;
    }

    this._applySeriesToChart(historicalSeries, parameterDefinition, this.request.day);
  }

  private _generateHistoricalSeries(
    request: HistoricalDataChartRequest,
  ): BESSHistoricalSeriesMock | null {
    try {
      return generateBESSHistoricalSeriesForToday(
        request.parameterKey,
        request.assetId,
        request.day,
      );
    } catch (error) {
      console.error('Failed to generate historical data', error);
      return null;
    }
  }

  private _applySeriesToChart(
    series: BESSHistoricalSeriesMock,
    parameterDefinition: BESSParameterDefinitionDTO | undefined,
    day: Date,
  ): void {
    if (!this._chart) {
      return;
    }

    const unit = parameterDefinition?.unit ?? series.unit ?? null;
    const parameterName = parameterDefinition?.name ?? series.parameterKey;
    let color = getPreferredColors(series.parameterKey, BESSAssetType.BatteryContainer);

    if (!color) {
      color = preferredOptionsPerParameter[series.parameterKey]?.color ?? chartColors[0];
    }

    const negativeColor = preferredOptionsPerParameter[series.parameterKey]?.negativeColor ?? color;

    this._chart.update(
      {
        title: {
          text: `${parameterName} — ${this._formatDateLabel(day)}`,
          align: 'left',
        },
        xAxis: {
          type: 'datetime',
          title: { text: undefined },
        },
        yAxis: [
          {
            title: { text: unit ?? undefined },
            plotLines: [yAxisZeroPlotLine],
          },
        ],
        tooltip: {
          shared: true,
          xDateFormat: '%H:%M',
          valueSuffix: unit ? ` ${unit}` : undefined,
        },
      },
      false,
      false,
      false,
    );

    while (this._chart.series.length > 0) {
      this._chart.series[0].remove(false);
    }

    this._chart.addSeries(
      {
        type: 'areaspline',
        name: parameterName,
        color,
        negativeColor,
        data: series.points.map((point: BESSHistoricalDataPoint) => [
          new Date(point.timestamp).getTime(),
          point.value,
        ]),
        fillOpacity: 0.2,
        marker: {
          enabled: false,
        },
        tooltip: {
          valueSuffix: unit ? ` ${unit}` : undefined,
        },
      },
      false,
    );

    this._chart.redraw();
  }

  private _getParameterDefinition(
    definitions: BESSParameterDefinitionDTO[],
    parameterKey: string,
  ): BESSParameterDefinitionDTO | undefined {
    return definitions.find((p) => p.key === parameterKey);
  }

  private _formatDateLabel(date: Date): string {
    const formatter = new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return formatter.format(date);
  }
}
