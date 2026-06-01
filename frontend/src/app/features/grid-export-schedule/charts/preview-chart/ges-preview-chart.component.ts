import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  ViewEncapsulation,
} from '@angular/core';

import { addHours, addMinutes, isBefore, subHours, subMinutes } from 'date-fns';
import { chartColors } from '../../../../constants';
import { seriesById, utcToZonedTimeSafe } from '../../../../helpers';
import Highcharts from '../../../../highcharts-global-config';
import { GridExportSchedule_DataRecord_DTO } from '../../_data/models/grid-export-schedule.dto';
import { GridExportSchedule_ForDay } from '../../_data/models/grid-export-schedule.model';
import {
  priceSeriesColor,
  seriesId_DisabledExportToGrid,
  seriesId_MinPriceSetting,
  seriesId_Price,
} from '../chart-common-definitions';
import { chartOptions } from './chart-manipulation';

@Component({
  selector: 'app-ges-preview-chart',
  templateUrl: './ges-preview-chart.component.html',
  styleUrls: ['./ges-preview-chart.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class GesPreviewChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() schedule: GridExportSchedule_ForDay | undefined;

  get data(): GridExportSchedule_DataRecord_DTO[] {
    return this.schedule?.dataRecords || [];
  }

  chartContainerId = this.constructor.name + Math.random().toString();

  private _chart: Highcharts.Chart | undefined;

  constructor() {}

  ngOnChanges(): void {
    if (this._chart) {
      this._handleNewData(this._chart, this.data);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this._chart = Highcharts.chart(this.chartContainerId, chartOptions);

      this._handleNewData(this._chart, this.data);
    }, 0);
  }

  ngOnDestroy(): void {
    this._chart?.destroy();
  }

  private _handleNewData(chart: Highcharts.Chart, data: GridExportSchedule_DataRecord_DTO[]) {
    const chartData: Highcharts.PointOptionsObject[] =
      data.map((chunk: GridExportSchedule_DataRecord_DTO) => ({
        x: new Date(chunk.interval.from).getTime(),
        y: chunk.ibex.priceMWh,
        // color: (chunk.priceMWh || 0) > 100 ? chartColors[5] : chartColors[2],
      })) || [];

    const series_Price = seriesById(chart, seriesId_Price);
    series_Price?.setData(chartData, false, false);

    const disabledExportData: Highcharts.PointOptionsObject[] =
      data.map((chunk: GridExportSchedule_DataRecord_DTO) => ({
        x: new Date(chunk.interval.from).getTime(),
        y: chunk.objective.exportToGrid ? null : 1,
        color: isBefore(new Date(chunk.interval.from).getTime(), new Date())
          ? chartColors[5] + '00'
          : chartColors[5] + '11',
      })) || [];

    const series_DisabledExportToGrid = seriesById(chart, seriesId_DisabledExportToGrid);
    series_DisabledExportToGrid?.setData(disabledExportData, false, false);

    const seriesData_MinPriceSetting: Highcharts.PointOptionsObject[] =
      data.map((chunk: GridExportSchedule_DataRecord_DTO) => ({
        x: new Date(chunk.interval.from).getTime(),
        y: chunk.objective.minPriceToEnableExport,
        color: chunk.objective.exportToGrid ? '#b2c1cd00' : chartColors[5] + '00',
      })) || [];

    const series_MinPriceSetting = seriesById(chart, seriesId_MinPriceSetting);
    series_MinPriceSetting?.setData(seriesData_MinPriceSetting, false, false);

    chart.yAxis[0].update(
      {
        min: 0,
        max: 500,
        tickAmount: 6,
      },
      false,
    );

    chart.xAxis[0].update(
      {
        min: addMinutes(new Date(data[0].interval.from), 30).getTime(),
        max: subMinutes(new Date(data[data.length - 1].interval.to), 30).getTime(),
        // startOnTick: true,
        // showFirstLabel: true,
        // showLastLabel: false,
        // endOnTick: false,
        minPadding: 0,
        maxPadding: 0,
      },
      false,
    );

    //----------------------------------
    // Mark past periods and current hour

    const plotBandId_PastTime = 'plotBandId_PastTime';
    const plotBandId_CurrentHour = 'plotBandId_CurrentHour';

    chart.xAxis[0].removePlotBand(plotBandId_PastTime);
    chart.xAxis[0].removePlotBand(plotBandId_CurrentHour);

    if (data.length > 0) {
      const nowInPlanttimeZone = utcToZonedTimeSafe(new Date(), this.schedule?.plantTimeZone);

      let plotBandStart = utcToZonedTimeSafe(
        new Date(data[0].interval.from),
        this.schedule?.plantTimeZone,
      );
      let iterator = plotBandStart;

      while (isBefore(iterator, nowInPlanttimeZone)) {
        iterator = addHours(iterator, 1);
      }

      if (plotBandStart !== iterator) {
        chart.xAxis[0].addPlotBand({
          id: plotBandId_PastTime,
          color: '#edf0f3' + '77',
          zIndex: 3,
          from: plotBandStart.getTime(),
          to: subHours(iterator, 1).getTime(),
        });

        chart.xAxis[0].addPlotBand({
          id: plotBandId_CurrentHour,
          color: '#fff9e6' + '',
          zIndex: 2,
          from: subHours(iterator, 1).getTime(),
          to: iterator.getTime(),
        });
      }
    }

    //-----------------------
    // add zones

    if (data.length > 0) {
      const zones: Highcharts.SeriesZonesOptionsObject[] = [];

      data.forEach((point) => {
        const zone: Highcharts.SeriesZonesOptionsObject = {
          value: addHours(new Date(point.interval.from), 1).getTime(),
          color: point.objective.exportToGrid ? priceSeriesColor : '#d9343a',
        };
        zones.push(zone);
      });

      const series_Price = seriesById(chart, seriesId_Price);
      series_Price?.update(
        {
          type: 'line',
          zoneAxis: 'x',
          zones: zones,
        },
        false,
      );
    }

    chart.redraw();
  }
}
