import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { chartColors } from '../../../../constants';
import { FaultCounterValues, FaultDefinition } from '../../../../data/models';

import Highcharts from '../../../../highcharts-global-config';

const barHeight = 18;
const barPadding = 2;

@Component({
  selector: 'app-fault-counters-bar-chart',
  templateUrl: './fault-counters-bar-chart.component.html',
  styleUrls: ['./fault-counters-bar-chart.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class FaultCountersBarChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() values: FaultCounterValues | null = null;
  @Input() faults: Array<FaultDefinition> | null = null;
  @Input() isLoadingData: boolean | null = false;

  @ViewChild('chartElement', { read: ElementRef }) chartElement: ElementRef | undefined;

  chartContainerId = this.constructor.name + Math.random().toString();

  chartOptions: Highcharts.Options = {
    chart: {
      type: 'bar',
      events: {
        load: (e: Event) => {
          const target = <unknown>e.target;
          const chart: Highcharts.Chart = <Highcharts.Chart>target;

          this._chartInstance = chart;
          this._initializeWithData(this._chartInstance);
        },
      },
    },
    xAxis: {
      type: 'category',
    },
    yAxis: {
      min: 0,
      softMin: 0,
      softMax: 5,
      tickInterval: 1,
      allowDecimals: false,
      title: {
        text: 'Count',
      },
    },
    legend: {
      labelFormat: '{name}',
    },
    tooltip: {
      // headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      headerFormat: '<table>',
      pointFormat:
        '<tr><td style="color:{series.color};padding:0">{point.fault.code} {point.fault.name} </td>' +
        '<td style="padding:0; text-align: right"><b>&nbsp;{point.y}</b></td></tr>',
      footerFormat: '</table>',
      shared: true,
      useHTML: true,
    },
    plotOptions: {
      column: {
        pointPadding: 0.2,
        borderWidth: 0,
      },
    },
    series: [],
  };

  autoSort = false;

  private _chartInstance: Highcharts.Chart | undefined;

  ngOnChanges(simpleChanges: SimpleChanges): void {
    if (this._chartInstance) {
      this._initializeWithData(this._chartInstance);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this._chartInstance = Highcharts.chart(this.chartContainerId, this.chartOptions);
    }, 0);
  }

  ngOnDestroy(): void {
    this._chartInstance?.destroy();
  }

  onAutoSortChange(autoSort: boolean) {
    this.autoSort = autoSort;

    if (this._chartInstance) {
      this._initializeWithData(this._chartInstance);
    }
  }

  private _initializeWithData(chartInstance: Highcharts.Chart) {
    if (!this.faults || this.faults.length === 0 || !this.values) {
      if (chartInstance.series && chartInstance.series.length > 0) {
        chartInstance.series[0].remove();
        this._updateChartSize(chartInstance);
      }

      return;
    }

    const values = this.values;

    const data = this.faults.map((fault) => ({
      x: 1,
      y: values[fault.id],
      fault: fault,
      name: fault.name,
    }));

    const seriesValue: Highcharts.SeriesOptionsType = {
      type: 'bar',
      name: $localize`Faults count`,
      color: chartColors[5],
      pointWidth: barHeight,
      pointPadding: barPadding,
      dataLabels: {
        enabled: true,
      },
      dataSorting: {
        enabled: true,
        sortKey: this.autoSort ? 'y' : 'x',
      },
      data,
    };

    // NOTE: disabling sorting will not return the original order
    // https://github.com/highcharts/highcharts/issues/13033

    if (chartInstance.series && chartInstance.series.length > 0) {
      chartInstance.series[0].update(seriesValue);
    } else {
      chartInstance.addSeries(seriesValue);
    }

    this._updateChartSize(chartInstance);
  }

  private _updateChartSize(chartInstance: Highcharts.Chart) {
    if (!this.chartElement) {
      return;
    }

    const containerHeight: number = (<HTMLElement>this.chartElement.nativeElement).clientHeight;

    const plotHeight = chartInstance.plotHeight || 0;
    const seriesCount = chartInstance.series?.length || 0;

    if (seriesCount === 0) {
      return;
    }

    const dataLength = this.faults?.length || 0;

    chartInstance.setSize(
      null,
      containerHeight - plotHeight + dataLength * (barHeight + barPadding),
    );
  }
}
