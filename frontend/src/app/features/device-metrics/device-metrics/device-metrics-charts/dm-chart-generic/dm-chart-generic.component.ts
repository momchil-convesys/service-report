import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';

import { celsiusDegreeSymbols, chartColors, TypedChange } from '../../../../../constants';
import {
  GroupedParameter,
  ParameterMappingService,
} from '../../../_data/parameter-mapping.service';
import { DmChartsService } from '../dm-charts.service';

import { formatNumber } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { APP_LOCALE_ID, formatTimestampForTooltip } from '../../../../../app-locale';
import { Device } from '../../../../../data/models';
import { PlantsService } from '../../../../../data/services/plants.service';
import {
  BaseUnit,
  BaseUnits,
  formatUnitSpacing,
  getMaxValueFromAllSeries,
  isString,
  nullOrNumberFromString,
  scaleAndFormatValue,
  yAxisFormatter_ScaleValue,
} from '../../../../../helpers';
import { DeviceMetrics } from '../../../_data/device-metrics.model';

import Highcharts from '../../../../../highcharts-global-config';

const plotHeight = 200;
const defaultSeriesColor = chartColors[2];

interface ComponentChanges extends SimpleChanges {
  data: TypedChange<DeviceMetrics[] | undefined>;
  loading: TypedChange<boolean>;
  title: TypedChange<string>;
  groupedParameter: TypedChange<GroupedParameter>;
  parameterDefinitionId: TypedChange<string>;
  unit: TypedChange<string>;
}

@Component({
  selector: 'app-dm-chart-generic',
  templateUrl: './dm-chart-generic.component.html',
  styleUrls: ['./dm-chart-generic.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class DmChartGenericComponent implements OnChanges, AfterViewInit {
  @Input() data: DeviceMetrics[] = [];
  @Input() isLoading = false;

  @Input() title = '';
  @Input() groupedParameter: GroupedParameter | undefined;
  @Input() parameterDefinitionId = '';
  @Input() unit = '';

  @ViewChild('chartElement', { read: ElementRef }) chartElement: ElementRef | undefined;

  chartContainerId = this.constructor.name + Math.random().toString();

  private _chart: Highcharts.Chart | undefined;

  get enableGradient() {
    return celsiusDegreeSymbols.indexOf(this.unit || '') >= 0;
  }

  get extractKnownBaseUnit(): BaseUnit | undefined {
    const unitToCheck = this.unit.trim();

    const baseUnit: BaseUnit | undefined = BaseUnits.find(
      (baseUnit) => unitToCheck.endsWith(baseUnit) && unitToCheck.startsWith('k'),
    );

    return baseUnit;
  }

  chartOptions: Highcharts.Options = {
    chart: {
      type: 'column',
      height: plotHeight,
      marginLeft: 103, // TODO: define var
      borderColor: '#edf0f3',
      zooming: {
        mouseWheel: false,
      },
    },
    legend: {
      enabled: false,
    },
    title: {
      text: this.title,
      align: 'left',
      style: {
        fontSize: '120%',
        fontWeight: '500',
      },
    },
    plotOptions: {
      series: {
        borderWidth: 0,
        color: defaultSeriesColor,
        states: {
          hover: {
            enabled: false,
          },
        },
      },
    },
    yAxis: this.getYAxisOptions(),
    xAxis: {
      crosshair: true,
      categories: [],
    },
    tooltip: {
      enabled: true,
      shared: true,
      distance: 25,
      useHTML: true,
      style: {
        fontSize: '0.9em',
        lineHeight: '1.2',
      },
      headerFormat: `<table>
      <tr><th colspan=2>
        <div style="display: flex">
          <span style="padding-right: 8px; flex: 1">
            {point.key}
          </span>
          <span style="text-align: right; font-weight: normal; width: 100%" class="secondary-text">
            {point.custom.formattedTimestamp}
          </span>
        </div>
      </th></tr>`,
      pointFormat: `
      <tr>
        <td><span style="color:{series.color}">\u25CF</span> {series.name} </td>
        <td style="text-align: right; padding-left: 8px"><b>{point.y}{tooltip.valueSuffix}</b></td>
      </tr>`,
      footerFormat: `</table>`,
    },
  };

  constructor(
    private dmChartsService: DmChartsService,
    private plantsService: PlantsService,
    private parameterMappingService: ParameterMappingService,
  ) {
    this.dmChartsService.syncedColumnHover$.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (!this._chart?.series) {
        return;
      }

      const xAxis = this._chart?.xAxis[0];

      if (event === undefined) {
        this._chart?.tooltip.hide(0);
        xAxis?.hideCrosshair();
        return;
      }

      const points: Highcharts.Point[] = [];

      this._chart?.series.forEach((series) => {
        const point = series.searchPoint(event, true);
        if (point) {
          points.push(point);
        }
      });

      if (points.length > 0) {
        xAxis?.drawCrosshair(undefined, points[0]);
        this._chart?.tooltip.refresh(points);
      }
    });
  }

  ngOnChanges(changes: ComponentChanges): void {
    if (!this._chart) {
      return;
    }

    if (changes.loading) {
      this._handleLoadingState(this._chart, changes.loading.currentValue);

      // If finished loading but data is not passed as a change...
      // E.g. if an error has occured.
      if (!changes.loading.currentValue && !changes.data) {
        this._handleNewData(this._chart, this.data);
      }
    }

    if (changes.data) {
      this._handleNewData(this._chart, this.data);
    }
  }

  protected _handleNewData(chart: Highcharts.Chart, data: DeviceMetrics[] | undefined) {
    this._handleDataChange();
    chart.redraw();
  }

  protected _handleLoadingState(chart: Highcharts.Chart, isLoading: boolean | undefined) {
    if (isLoading) {
      chart.showLoading();
    } else {
      chart.hideLoading();
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this._chart = Highcharts.chart(this.chartContainerId, this.chartOptions);

      this._handleLoadingState(this._chart, this.isLoading);
      this._handleNewData(this._chart, this.data);
    }, 0);

    const chartContainer = this.chartElement?.nativeElement as
      | (HTMLElement & { removeAllListeners?: (eventType: string) => void })
      | undefined;

    ['mousemove', 'mouseout'].forEach((eventType) => {
      chartContainer.addEventListener(eventType, (e: any) => {
        if (eventType === 'mouseout') {
          this.dmChartsService.syncedColumnHover$.next(undefined);
        } else {
          const event = this._chart?.pointer.normalize(<PointerEvent>e);
          this.dmChartsService.syncedColumnHover$.next(event);
        }
      });
    });
  }

  ngOnDestroy(): void {
    const chartContainer = this.chartElement?.nativeElement as
      | (HTMLElement & { removeAllListeners?: (eventType: string) => void })
      | undefined;

    ['mousemove', 'mouseout'].forEach((eventType) => {
      if (chartContainer && chartContainer.removeAllListeners) {
        chartContainer.removeAllListeners(eventType);
      }
    });

    this._chart?.destroy();
  }

  private _handleDataChange() {
    const chart = this._chart;
    if (!chart) {
      return;
    }

    const categories = this.data.map((d) => this._deviceNameById(d.deviceId));
    chart.xAxis[0].setCategories(categories, false);

    chart.update({ yAxis: this.getYAxisOptions() }, false);

    if (this.data && (this.groupedParameter || this.parameterDefinitionId)) {
      const series: Highcharts.SeriesOptionsType = {
        type: 'column',
        name: this.title,
        maxPointWidth: 50,
        data: this.data.map((columnData) => {
          let value: number | string | null | undefined;

          if (this.groupedParameter) {
            // Use grouped parameter logic
            value = this.parameterMappingService.getGroupedParameterValue(
              columnData,
              this.groupedParameter,
            );
          } else {
            // Use individual parameter logic
            value = columnData.values[this.parameterDefinitionId];
          }

          return {
            // TODO: add information in custom object to show nulls in tooltip
            y: nullOrNumberFromString(value),
            custom: {
              formattedTimestamp: formatTimestampForTooltip(columnData.timestamp, undefined, {
                customFormat: 'HH:mm:ss',
              }),
            },
            color: this.enableGradient
              ? {
                  linearGradient: {
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 1,
                  },
                  stops: [
                    [0, `rgba(255, ${158 - 158 * (Number(value) / 100)}, 19, 1)`],
                    [1, `rgba(255, 158, 19, 1)`],
                  ],
                }
              : defaultSeriesColor,
          };
        }),
        dataLabels: {
          enabled: true,
          formatter: this.extractKnownBaseUnit
            ? function () {
                const dataMax = getMaxValueFromAllSeries(this.series.chart);
                return scaleAndFormatValue(this.y, dataMax, undefined);
              }
            : function () {
                if (this.y !== undefined) {
                  return formatNumber(this.y, APP_LOCALE_ID, '0.0-1');
                }

                return undefined;
              },
        },
      };
      if (chart.series && chart.series.length > 0) {
        chart.series[0].update(series, false);
      } else {
        chart.addSeries(series, false);
      }
    }

    chart.setSize(undefined, plotHeight, false);

    chart.update(
      {
        title: { text: this.title },
        tooltip: { valueSuffix: formatUnitSpacing(this.unit) },
      },
      false,
    );
  }

  private _deviceById(deviceId: string): Device | undefined {
    return this.plantsService.getCachedDeviceById(deviceId);
  }

  private _deviceNameById(deviceId: string): string {
    const device = this._deviceById(deviceId);

    if (device) {
      return device.name;
    }

    return deviceId;
  }

  getYAxisOptions(): Highcharts.YAxisOptions {
    return {
      softMin: 0,
      title: undefined,
      // opposite: true,
      labels: {
        formatter: (ctx) => {
          const knownBaseUnit = this.extractKnownBaseUnit;
          if (knownBaseUnit) {
            const dataMax = getMaxValueFromAllSeries(ctx.chart);
            return yAxisFormatter_ScaleValue(ctx, knownBaseUnit, dataMax);
          }

          if (ctx.value === undefined) {
            return '';
          }

          if (ctx.isFirst) {
            return `${ctx.value} ${this.unit}`;
          }

          if (isString(ctx.value)) {
            return ctx.value as string;
          }

          return formatNumber(ctx.value as number, APP_LOCALE_ID, '0.0-1');
        },
      },
    };
  }
}
