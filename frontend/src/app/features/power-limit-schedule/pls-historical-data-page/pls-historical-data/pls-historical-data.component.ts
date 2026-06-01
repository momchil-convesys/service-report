import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Observable,
  ReplaySubject,
  combineLatest,
  delay,
  distinctUntilChanged,
  filter,
  map,
  shareReplay,
  switchMap,
} from 'rxjs';
import { DataRequest } from '../../../../constants';
import { BaseChartContext } from '../../../../shared/base-chart-component/base-chart-component.component';
import {
  DatetimeRangeModel,
  isSameDatetimeRange,
} from '../../../../shared/datetime-range-select/models';
import { PageRoutingService } from '../../../../shared/page-routing.service';
import { PlsHistoricalDataApiService } from '../_data/api.service';
import { MasterGwScheduledPowerLimitHistoricalData } from '../_data/dto';

@Component({
  selector: 'app-pls-historical-data',
  templateUrl: './pls-historical-data.component.html',
  styleUrl: './pls-historical-data.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class PlsHistoricalDataComponent {
  dataRequest$: Observable<DataRequest<MasterGwScheduledPowerLimitHistoricalData> | undefined>;
  dataRequestFinishedData$: Observable<MasterGwScheduledPowerLimitHistoricalData | undefined>;

  chartContext$: Observable<BaseChartContext>;
  deviceChartContexts$: Observable<BaseChartContext[]>;

  timeZone$: Observable<string | undefined>;

  private _targetRange$: ReplaySubject<DatetimeRangeModel> = new ReplaySubject(1);

  constructor(pageRouting: PageRoutingService, api: PlsHistoricalDataApiService) {
    const plant$ = pageRouting.getPlantFromQueryParams().pipe();

    this.timeZone$ = plant$.pipe(map((plant) => plant.timeZone));

    this.chartContext$ = combineLatest([
      plant$,
      this._targetRange$.pipe(distinctUntilChanged(isSameDatetimeRange)),
    ]).pipe(
      map(([plant, targetRange]) => ({
        plant,
        deviceId: null,
        targetRange,
      })),
      shareReplay(1),
    );

    this.deviceChartContexts$ = this.chartContext$.pipe(
      map((context) => context.plant.deviceIds.map((deviceId) => ({ ...context, deviceId }))),
    );

    // TODO: delay(0) resolves the issue with double requests,
    // as component is destroyed AFTER the route is changed.
    // Also see device page overview component implementation.

    this.dataRequest$ = combineLatest([plant$, this._targetRange$]).pipe(
      delay(0),
      switchMap(([plant, targetRange]) =>
        api.fetchPowerLimitScheduleHistoricalData(plant.id, targetRange),
      ),
      shareReplay(1),
      takeUntilDestroyed(),
    );

    this.dataRequestFinishedData$ = this.dataRequest$.pipe(
      filter((req) => !req?.isLoading),
      map((req) => req?.data),
      shareReplay(1),
    );
  }

  onDatetimeRangeChange(value: DatetimeRangeModel) {
    this._targetRange$.next(value);
  }
}
