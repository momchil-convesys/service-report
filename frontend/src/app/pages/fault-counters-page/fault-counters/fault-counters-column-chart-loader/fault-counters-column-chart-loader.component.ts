import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { Observable, combineLatest, filter, map } from 'rxjs';
import { PredefinedTimeRange, TypedChange } from '../../../../constants';
import { FaultCountersWithIntegrationPeriod, FaultDefinition } from '../../../../data/models';
import {
  calculateIntegrationPeriodForTimeRange,
  convertPredefinedRange,
} from '../../../../helpers';
import { FaultCountersColumnChartData } from '../fault-counters-column-chart/fault-counters-column-chart.component';
import { FaultCountersService } from '../fault-counters.service';

interface ComponentInputChanges extends SimpleChanges {
  timeRange: TypedChange<Date[] | string>;
  faultIds: TypedChange<Set<string> | null>;
  deviceId: TypedChange<string>;
}

@Component({
  selector: 'app-fault-counters-column-chart-loader[timeRange][faults][deviceId]',
  templateUrl: './fault-counters-column-chart-loader.component.html',
  styleUrls: ['./fault-counters-column-chart-loader.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class FaultCountersColumnChartLoaderComponent implements OnChanges {
  @Input({ required: true }) deviceId!: string;
  @Input({ required: true }) faults!: Array<FaultDefinition> | null;
  @Input({ required: true }) timeRange!: Date[] | PredefinedTimeRange;

  data$: Observable<FaultCountersColumnChartData> | undefined;

  constructor(private _dataService: FaultCountersService) {}

  ngOnChanges(simpleChanges: ComponentInputChanges): void {
    const convertedTimeRange = convertPredefinedRange(this.timeRange);

    if (!this.faults || this.faults.length === 0) {
      return;
    }

    const dataRequests = this.faults.map((fault) => {
      return this._dataService
        .getFaultCountersDataWithIntegrationPerod(
          this.deviceId,
          convertedTimeRange,
          fault.id,
          calculateIntegrationPeriodForTimeRange(convertedTimeRange),
        )
        .pipe(
          filter((response) => response.data !== undefined),
          map((response) => ({
            dataWithIntegrationPeriod: response.data as FaultCountersWithIntegrationPeriod,
            fault,
          })),
        );
    });

    this.data$ = combineLatest([...dataRequests]).pipe(
      map((dataArrays) => ({
        integrationPeriod: dataArrays[0].dataWithIntegrationPeriod.integrationPeriod,
        series: dataArrays.map(({ dataWithIntegrationPeriod, fault }) => ({
          fault,
          values: dataWithIntegrationPeriod.values,
        })),
      })),
    );
  }
}
