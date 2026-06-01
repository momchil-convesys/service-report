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
import { format } from 'date-fns';
import { IntegrationPeriod, chartColors } from '../../../../constants';
import { FaultDefinition } from '../../../../data/models';

import Highcharts from '../../../../highcharts-global-config';

export interface FaultCountersColumnChartData {
  integrationPeriod: IntegrationPeriod;

  series: {
    fault: FaultDefinition;
    values: {
      timestamp: Date;
      value: number;
    }[];
  }[];
}

@Component({
  selector: 'app-fault-counters-column-chart[data]',
  templateUrl: './fault-counters-column-chart.component.html',
  styleUrls: ['./fault-counters-column-chart.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class FaultCountersColumnChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input({ required: true }) data!: FaultCountersColumnChartData;

  @ViewChild('chartElement', { read: ElementRef }) chartElement: ElementRef | undefined;

  chartContainerId = this.constructor.name + Math.random().toString();

  chartOptions: Highcharts.Options = {
    chart: {
      type: 'column',
      events: {
        load: (e: Event) => {
          const target = <unknown>e.target;
          const chart: Highcharts.Chart = <Highcharts.Chart>target;

          this._chartInstance = chart;
          this._initializeWithData();
        },
      },
    },
    colors: chartColors,
    xAxis: {
      crosshair: true,
      categories: [],
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Count',
      },
    },
    legend: {
      labelFormatter: function () {
        if (!this.options.custom) {
          return this.name;
        }

        const fault: FaultDefinition = <FaultDefinition>this.options.custom['fault'];
        if (!fault) {
          return this.name;
        }

        return `${fault.code} ${fault.name}`;
      },
    },
    tooltip: {
      headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      pointFormat:
        '<tr><td style="color:{series.color};padding:0">{series.options.custom.fault.code} {series.options.custom.fault.name} </td>' +
        '<td style="padding:0; text-align: right"><b>&nbsp;{point.y}</b></td></tr>',
      footerFormat: '</table>',
      shared: true,
      useHTML: true,
    },
    plotOptions: {
      column: {
        // pointPadding: 0.2,
        // borderWidth: 0,
      },
    },
    series: [],
  };

  private _chartInstance: Highcharts.Chart | undefined;

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (!this._chartInstance) {
      // Chart instance is not loaded yet!
      return;
    }

    this._initializeWithData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this._chartInstance = Highcharts.chart(this.chartContainerId, this.chartOptions);
    }, 0);
  }

  ngOnDestroy(): void {
    this._chartInstance?.destroy();
  }

  private _initializeWithData() {
    this._handleSelectedFaultsChange();
    this._updateIntegrationPeriod();
  }

  private _handleSelectedFaultsChange() {
    const faultIds = Object.keys(this.data);

    const seriesArray: Highcharts.Series[] | undefined = this._chartInstance?.series;
    const seriesToRemove = seriesArray?.filter((series) => faultIds.indexOf(series.name) < 0);

    seriesToRemove?.forEach((series) => {
      series?.remove();
    });

    this.data.series.map((dataForSingleFault) => {
      if (seriesArray?.find((s) => s.name === dataForSingleFault.fault.id) === undefined) {
        this._chartInstance?.addSeries({
          type: 'column',
          name: dataForSingleFault.fault.id,
          custom: { fault: dataForSingleFault.fault },
          // pointPadding: 0,
          data: dataForSingleFault.values.map((valueObject) => valueObject.value),
        });
      }
    });
  }

  private _updateIntegrationPeriod() {
    const type: IntegrationPeriod = this.data.integrationPeriod;

    let labelFormat: string;

    switch (type) {
      case IntegrationPeriod.Hours:
        labelFormat = 'HH:mm';
        break;
      case IntegrationPeriod.Days:
        labelFormat = 'd MMM';
        break;
      case IntegrationPeriod.Months:
        labelFormat = 'MMMM';
        break;
    }

    const categories: string[] = [];

    this.data.series[0].values.forEach((valueObject) => {
      const label = `${format(valueObject.timestamp, labelFormat)}`;
      categories.push(label);
    });

    this._chartInstance?.xAxis[0].setCategories(categories);
    this._chartInstance?.series.forEach((series, index) => {
      series.update({
        type: 'column',
        data: this.data.series[index].values.map((valueObject) => valueObject.value),
      });
    });
  }
}
