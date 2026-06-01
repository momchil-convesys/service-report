import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzCardModule } from 'ng-zorro-antd/card';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  Observable,
  of,
  ReplaySubject,
  shareReplay,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';
import { DataRequest } from '../../../constants';
import { Plant } from '../../../data/models';
import { BaseChartContext } from '../../../shared/base-chart-component/base-chart-component.component';
import { DatetimeRangeSelectComponent } from '../../../shared/datetime-range-select/datetime-range-select.component';
import {
  DatetimeRangeModel,
  isSameDatetimeRange,
} from '../../../shared/datetime-range-select/models';
import { HighchartsExportOptionComponent } from '../../../shared/highcharts-export-option/highcharts-export-option.component';
import { PageRoutingService } from '../../../shared/page-routing.service';
import { ExtendedPlantMetricsDataService } from '../_data/data.service';
import { LevelOfMeasurementMetadata_DTO } from '../_data/dto';
import { PowerMetersCumulativeData } from '../_data/models';
import { EpmHistoricalDataChartComponent } from '../epm-historical-data-chart/epm-historical-data-chart.component';
import { EpmMeasurementLevelNavComponent } from '../epm-measurement-level-nav/epm-measurement-level-nav.component';

@Component({
  selector: 'app-epm-historical-data-widget',
  imports: [
    NzAlertModule,
    AsyncPipe,
    EpmMeasurementLevelNavComponent,
    RouterModule,
    EpmHistoricalDataChartComponent,
    HighchartsExportOptionComponent,
    NzCardModule,
    DatetimeRangeSelectComponent,
  ],
  templateUrl: './epm-historical-data-widget.component.html',
  styleUrl: './epm-historical-data-widget.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EpmHistoricalDataWidgetComponent {
  @Input({ required: true }) showSubLevels = false;

  @Input({ required: true }) set metadata(value: LevelOfMeasurementMetadata_DTO | null) {
    this.metadata$.next(value);
  }

  metadata$ = new BehaviorSubject<LevelOfMeasurementMetadata_DTO | null>(null);

  chartDataRequest$: Observable<DataRequest<PowerMetersCumulativeData>>;

  chartContext$: Observable<BaseChartContext>;

  timeZone$: Observable<string | undefined>;

  private _targetRange$: ReplaySubject<DatetimeRangeModel> = new ReplaySubject(1);

  private _destroy$ = new Subject<void>();

  constructor(
    route: ActivatedRoute,
    private data: ExtendedPlantMetricsDataService,
    pageRouting: PageRoutingService,
  ) {
    const subLevelId$: Observable<string | null> = route.queryParamMap.pipe(
      map((queryParams) => queryParams.get('subLevelId')),
      takeUntil(this._destroy$),
    );

    const plant$: Observable<Plant> = pageRouting
      .getPlantFromQueryParams()
      .pipe(takeUntil(this._destroy$));

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
      takeUntil(this._destroy$),
    );

    this.chartDataRequest$ = combineLatest([
      this._targetRange$.pipe(distinctUntilChanged(isSameDatetimeRange)),
      plant$,
      this.metadata$,
      subLevelId$,
    ]).pipe(
      switchMap(([targetRange, plant, metadata, subLevelId]) => {
        if (!metadata) {
          return of({
            isLoading: false,
            error: new Error('Missing metadata in component parameters.'),
          });
        }

        return this.data
          .getCumulativeData(plant, targetRange, metadata.levelOfMeasurement, subLevelId)
          .pipe(takeUntil(this._destroy$));
      }),
      shareReplay(1),
      takeUntil(this._destroy$),
    );
  }

  onDatetimeRangeChange(value: DatetimeRangeModel) {
    this._targetRange$.next(value);
  }

  showPowerMeterIndicator(context: BaseChartContext | null): boolean {
    return (context?.plant.plantSpecificMetadata?.hasPowerMeter && !context.deviceId) || false;
  }

  ngOnDestroy() {
    this._destroy$.next();
  }
}
