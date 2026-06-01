import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Observable,
  ReplaySubject,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  shareReplay,
  switchMap,
} from 'rxjs';
import { DataRequest } from '../../../constants';
import { Plant } from '../../../data/models';
import { BaseChartContext } from '../../../shared/base-chart-component/base-chart-component.component';
import {
  DatetimeRangeModel,
  isSameDatetimeRange,
} from '../../../shared/datetime-range-select/models';
import { PageRoutingService } from '../../../shared/page-routing.service';
import { PVAveragePowerApiService } from './_data/api.service';
import { PVAveragePowerDataService } from './_data/data.service';
import { PVAveragePowerData } from './_data/pv-average-power.model';

@Component({
  selector: 'app-pv-average-power-chart-plant-widget',
  templateUrl: './pv-average-power-chart-plant-widget.component.html',
  styleUrl: './pv-average-power-chart-plant-widget.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PVAveragePowerApiService, PVAveragePowerDataService],
  standalone: false,
})
export class PvAveragePowerChartPlantWidgetComponent {
  private _targetRange$: ReplaySubject<DatetimeRangeModel> = new ReplaySubject(1);

  chartDataRequest$: Observable<DataRequest<PVAveragePowerData>>;

  chartContext$: Observable<BaseChartContext>;

  timeZone$: Observable<string | undefined>;

  constructor(data: PVAveragePowerDataService, pageRouting: PageRoutingService) {
    const plant$: Observable<Plant> = pageRouting.getPlantFromQueryParams().pipe(
      filter((plant) => plant.plantSpecificMetadata?.hasPowerMeter === true),
      takeUntilDestroyed(),
    );

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
      takeUntilDestroyed(),
    );

    this.chartDataRequest$ = combineLatest([
      plant$,
      this._targetRange$.pipe(distinctUntilChanged(isSameDatetimeRange)),
    ]).pipe(
      switchMap(([plant, targetRange]) => data.getPVAveragePowerData(plant, targetRange)),
      shareReplay(1),
      takeUntilDestroyed(),
    );
  }

  onDatetimeRangeChange(value: DatetimeRangeModel) {
    this._targetRange$.next(value);
  }

  showPowerMeterIndicator(context: BaseChartContext | null): boolean {
    return (context?.plant.plantSpecificMetadata?.hasPowerMeter && !context.deviceId) || false;
  }
}
