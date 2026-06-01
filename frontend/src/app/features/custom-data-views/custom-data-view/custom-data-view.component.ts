import Highcharts from '../../../highcharts-global-config';

import { JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ChartOptionsGuiComponent } from '../../chart-options-gui/chart-options-gui.component';
import { CustomDataViewConfig } from '../_data/models';

@Component({
  selector: 'app-custom-data-view',
  imports: [NzButtonModule, JsonPipe, ChartOptionsGuiComponent],
  templateUrl: './custom-data-view.component.html',
  styleUrl: './custom-data-view.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomDataViewComponent {
  @Input({ required: true }) dataViewConfig: CustomDataViewConfig | null = null;

  @Output() save = new EventEmitter<CustomDataViewConfig>();
  @Output() delete = new EventEmitter<string>();

  get chartContainerId() {
    return `chart-${this.dataViewConfig?.id}`;
  }

  private _chart: Highcharts.Chart | undefined;
  get chart(): Highcharts.Chart | undefined {
    return this._chart;
  }

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    /**
     * Wait for the component view to settle (E.g: layout width),
     * then create the chart on the next cycle.
     */
    setTimeout(() => {
      this._chart = Highcharts.chart(this.chartContainerId, {
        xAxis: { type: 'datetime' },
        series: [
          {
            type: 'line',
          },
        ],
      });
      this.cdr.detectChanges();
    }, 0);
  }

  onSave() {}

  onDelete(id: string) {
    this.delete.emit(id);
  }
}
