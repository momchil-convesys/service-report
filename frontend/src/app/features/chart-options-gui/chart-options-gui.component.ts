import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { CogPlotOptionsComponent } from './cog-plot-options/cog-plot-options.component';
import { CogSeriesComponent } from './cog-series/cog-series.component';
import { CogTreeNavComponent } from './cog-tree-nav/cog-tree-nav.component';
import { CogXAxisComponent } from './cog-x-axis/cog-x-axis.component';
import { CogYAxisComponent } from './cog-y-axis/cog-y-axis.component';
import { ActionContext } from './constants';

function parseDotNotation(key: string, value: any): Record<string, any> {
  return key.split('.').reduceRight((acc, cur) => ({ [cur]: acc }), value);
}

@Component({
  selector: 'app-chart-options-gui',
  imports: [
    CogYAxisComponent,
    CogXAxisComponent,
    CogSeriesComponent,
    CogPlotOptionsComponent,
    NzBreadCrumbModule,
    CogTreeNavComponent,
  ],
  templateUrl: './chart-options-gui.component.html',
  styleUrl: './chart-options-gui.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartOptionsGuiComponent {
  @Input({ required: true }) chart: Highcharts.Chart | null | undefined;

  selectionContext: ActionContext | undefined;

  chartOptions: Highcharts.Options | undefined;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.chartOptions = this.chart?.options;
  }

  findYAxis(chart: Highcharts.Chart, axisId: string | undefined): Highcharts.Axis | undefined {
    return chart.yAxis.find((axis) => axis.options.id === axisId);
  }

  findXAxis(chart: Highcharts.Chart, axisId: string | undefined): Highcharts.Axis | undefined {
    return chart.xAxis.find((axis) => axis.options.id === axisId);
  }

  findSeries(chart: Highcharts.Chart, seriesId: string | undefined): Highcharts.Series | undefined {
    return chart.series.find((series) => series.options.id === seriesId);
  }

  onSelectionContextChange(selectionContext: ActionContext | undefined) {
    this.selectionContext = selectionContext;
  }

  // onNodeRemove(selectionContext: ActionContext | undefined) {
  //   switch (selectionContext?.section) {
  //     case 'yAxis':
  //       // const filteredYAxis = toArray(this.chart?.options.yAxis).filter(
  //       //   (_, index) => index !== selectionContext.subSectionIndex
  //       // );
  //       // this.chart?.update({ yAxis: filteredYAxis });
  //       // this.chart?.redraw();

  //       this.chart?.yAxis.find((axis) => axis.options.id === selectionContext.objectId)?.remove();

  //       console.log('HERE: updated yAxes options with: ', this.chart?.yAxis.length);
  //       break;
  //   }

  //   this.chartOptions = { ...this.chart?.options };
  //   this.cdr.detectChanges();
  // }

  // onNodeAdd(selectionContext: ActionContext | undefined) {
  //   switch (selectionContext?.section) {
  //     case 'yAxis':
  //       this.chart?.addAxis(yAxisOptionsDefault);
  //       break;
  //   }

  //   this.chartOptions = { ...this.chart?.options };
  //   this.cdr.detectChanges();
  // }

  onAxisOptionChange(option: { value: any; key: string }, axis: Highcharts.Axis) {
    const object = parseDotNotation(option.key, option.value);
    axis.update(object);
  }

  onSeriesOptionChange(option: { value: any; key: string }, series: Highcharts.Series) {
    const object = parseDotNotation(option.key, option.value);
    series.update(object as any); // TODO: fix cast
  }

  onPlotOptionChange(option: { value: any; key: string }, chart: Highcharts.Chart) {
    const object = parseDotNotation(option.key, option.value);
    chart.update({ plotOptions: object });
  }
}
