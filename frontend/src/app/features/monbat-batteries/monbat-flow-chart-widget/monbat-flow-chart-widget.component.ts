import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { BehaviorSubject } from 'rxjs';
import { nullOrNumber } from '../../../helpers';
import { FlowChartComponent } from '../../../shared/flow-chart/flow-chart.component';
import { FlowChartParameters } from '../../../shared/flow-chart/models';
import { RelativeTimestampComponent } from '../../../shared/relative-timestamp/relative-timestamp.component';
import { HybridInverterCurrentData } from '../_data/models';

const nullParams: FlowChartParameters = {
  pvOut: null,

  gridIn: null,
  gridOut: null,

  battIn: null,
  battOut: null,

  consIn: {
    total: null,

    fromGrid: null,
    fromBatteries: null,
    fromPv: null,
  },
};

@Component({
  selector: 'app-monbat-flow-chart-widget',
  imports: [FlowChartComponent, AsyncPipe, RelativeTimestampComponent, NzSpinModule, NzAlertModule],
  templateUrl: './monbat-flow-chart-widget.component.html',
  styleUrl: './monbat-flow-chart-widget.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonbatFlowChartWidgetComponent implements OnChanges {
  @Input({ required: true }) data: HybridInverterCurrentData | null = null;
  @Input({ required: true }) loading: boolean | undefined;
  @Input() error: Error | undefined;

  @Input() hasPv: boolean = false;

  flowChartParameters$ = new BehaviorSubject<FlowChartParameters>({ ...nullParams });

  ngOnChanges(changes: SimpleChanges): void {
    const params: FlowChartParameters = { ...nullParams };

    const data = this.data;

    if (data !== null) {
      const energyDistribution = data.dataPoint.energyDistribution;

      params.battIn = energyDistribution.batteryIn;
      params.battOut = energyDistribution.batteryOut;

      params.gridIn = energyDistribution.gridIn;
      params.gridOut = energyDistribution.gridOut;

      params.consIn = energyDistribution.consumption;

      params.pvOut = nullOrNumber(energyDistribution.pvOut);
    }

    this.flowChartParameters$.next(params);
  }
}
