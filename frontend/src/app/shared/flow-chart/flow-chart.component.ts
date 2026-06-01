import { NgClass, formatNumber } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { APP_LOCALE_ID } from '../../app-locale';
import { ChartBlockBatteriesComponent } from './chart-svgs/chart-block-batteries.component';
import { ChartBlockConsComponent } from './chart-svgs/chart-block-cons.component';
import { ChartBlockGridComponent } from './chart-svgs/chart-block-grid.component';
import { ChartBlockPvComponent } from './chart-svgs/chart-block-pv.component';
import { FlowPathsFullComponent } from './chart-svgs/flow-paths-full.component';
import { FlowPathsNoPvComponent } from './chart-svgs/flow-paths-no-pv.component';
import { FlowChartParameters } from './models';

@Component({
  selector: 'app-flow-chart',
  imports: [
    ChartBlockBatteriesComponent,
    ChartBlockGridComponent,
    ChartBlockPvComponent,
    ChartBlockConsComponent,
    FlowPathsFullComponent,
    FlowPathsNoPvComponent,
    NgClass,
  ],
  templateUrl: './flow-chart.component.html',
  styleUrl: './flow-chart.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlowChartComponent {
  @Input({ required: true }) options: { hasPv: boolean } = { hasPv: false };
  @Input({ required: true }) parameters: FlowChartParameters | null = null;

  outlets: null | {
    pvOut: SVGTextElement | null;

    gridIn: SVGElement | null;
    gridOut: SVGElement | null;

    battIn: SVGElement | null;
    battOut: SVGElement | null;

    consIn: SVGElement | null;
  } = null;

  private _viewInitialized = false;

  ngAfterViewInit(): void {
    const flowElementsGroup: SVGGElement | null = document.body.querySelector('#flow-elements');
    const flowPathsGroup: SVGGElement | null = document.body.querySelector('#flow-paths');

    if (!flowElementsGroup || !flowPathsGroup) {
      console.error('Missing group.');
      // alert('You may have forgotten to append the moving dots in svg.');
      return;
    }

    this._viewInitialized = true;
  }

  ngOnChanges(): void {
    if (this._viewInitialized && !this.outlets) {
      this.outlets = {
        pvOut: document.body.querySelector('#pv-out-value > tspan'),
        gridIn: document.body.querySelector('#grid-in-value > tspan'),
        gridOut: document.body.querySelector('#grid-out-value > tspan'),
        battIn: document.body.querySelector('#batt-in-value > tspan'),
        battOut: document.body.querySelector('#batt-out-value > tspan'),
        consIn: document.body.querySelector('#cons-in-value > tspan'),
      };
    }

    this._updateValues(this.parameters);
  }

  private _updateValues(params: FlowChartParameters | null) {
    if (this.outlets?.pvOut) {
      this.outlets.pvOut.textContent = this._stringValue(params?.pvOut);
    }

    if (this.outlets?.gridIn) {
      this.outlets.gridIn.textContent = this._stringValue(params?.gridIn);
    }

    if (this.outlets?.gridOut) {
      this.outlets.gridOut.textContent = this._stringValue(params?.gridOut);
    }

    if (this.outlets?.battIn) {
      this.outlets.battIn.textContent = this._stringValue(params?.battIn?.total);
    }

    if (this.outlets?.battOut) {
      this.outlets.battOut.textContent = this._stringValue(params?.battOut);
    }

    if (this.outlets?.consIn) {
      this.outlets.consIn.textContent = this._stringValue(params?.consIn?.total);
    }
  }

  private _stringValue(value: number | undefined | null): string {
    if (value !== null && value !== undefined) {
      const format = value === 0 ? '1.0-0' : '1.1-1';
      return formatNumber(value, APP_LOCALE_ID, format) + ' kW';
    }

    return '— kW';
  }
}
