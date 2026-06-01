import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { BehaviorSubject, Observable, filter, map, shareReplay, switchMap } from 'rxjs';
import { DataRequest, TypedChange } from '../../../constants';
import { ConsumptionWithIntegrationPeriod, Device } from '../../../data/models';
import { calculateIntegrationPeriodForTimeRange } from '../../../helpers';
import { ConsumptionService } from '../consumption.service';

interface ComponentChanges extends SimpleChanges {
  timeRange: TypedChange<Date[] | undefined>;
  devices: TypedChange<Device[] | undefined>;
}

interface ComponentInputChange {
  timeRange: Date[] | undefined;
  devices: Device[] | undefined;
}

@Component({
  selector: 'app-consumption-chart-loader',
  templateUrl: './consumption-chart-loader.component.html',
  styleUrls: ['./consumption-chart-loader.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ConsumptionChartLoaderComponent implements OnChanges {
  @Input() timeRange: Date[] | undefined;
  @Input() devices: Device[] | undefined;

  inputChange$ = new BehaviorSubject<ComponentInputChange>({
    timeRange: undefined,
    devices: undefined,
  });

  dataRequest$: Observable<DataRequest<ConsumptionWithIntegrationPeriod[]>> | undefined;
  data$: Observable<ConsumptionWithIntegrationPeriod | undefined> | undefined;

  constructor(private dataService: ConsumptionService) {
    this.dataRequest$ = this.inputChange$.pipe(
      filter(
        (changes): changes is { timeRange: Date[]; devices: Device[] } =>
          changes.timeRange !== undefined && changes.devices !== undefined,
      ),
      switchMap((changes) =>
        this.dataService.getConsumptionDataWithIntegrationPerod(
          changes.devices.map((device) => device.id),
          [changes.timeRange[0], changes.timeRange[1]],
          calculateIntegrationPeriodForTimeRange(changes.timeRange),
        ),
      ),
      shareReplay(1),
    );

    this.data$ = this.dataRequest$.pipe(
      filter((req) => req.isLoading === false),
      map((req) => {
        if (req.data && req.data.length > 0) {
          return req.data[0];
        }

        return undefined;
      }),
    );
  }

  ngOnChanges(changes: ComponentChanges): void {
    const inputChange: ComponentInputChange = {
      timeRange: changes.timeRange ? changes.timeRange.currentValue : this.timeRange,
      devices: changes.devices ? changes.devices.currentValue : this.devices,
    };

    this.inputChange$.next(inputChange);
  }
}
