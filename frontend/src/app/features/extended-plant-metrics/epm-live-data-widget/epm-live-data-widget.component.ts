import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilKeyChanged,
  Observable,
  ReplaySubject,
  shareReplay,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';
import { DataRequest } from '../../../constants';
import { Plant } from '../../../data/models';
import { PageRoutingService } from '../../../shared/page-routing.service';
import { ExtendedPlantMetricsDataService } from '../_data/data.service';
import { LevelOfMeasurement, LevelOfMeasurementMetadata_DTO } from '../_data/dto';
import { PlantMetricsCurrentValuesData } from '../_data/models';
import { EpmLiveDataComponent } from '../epm-live-data/epm-live-data.component';

type RadioOptionValue = 'current-values' | 'daily-totals' | 'all-time-totals';

interface RadioOption {
  label: string;
  value: RadioOptionValue;
}

@Component({
  selector: 'app-epm-live-data-widget',
  imports: [AsyncPipe, NzSpinModule, NzAlertModule, EpmLiveDataComponent, NzTabsModule],
  templateUrl: './epm-live-data-widget.component.html',
  styleUrl: './epm-live-data-widget.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EpmLiveDataWidgetComponent {
  @Input({ required: true }) metadata: LevelOfMeasurementMetadata_DTO | undefined;
  @Input({ required: true }) set levelOfMeasurement(v: LevelOfMeasurement) {
    this.levelOfMeasurement$.next(v);
  }
  protected readonly levelOfMeasurement$ = new ReplaySubject<LevelOfMeasurement>(1);

  pmLiveData$: Observable<DataRequest<PlantMetricsCurrentValuesData>>;

  radioOptions: RadioOption[] = [
    { label: $localize`Current values`, value: 'current-values' },
    { label: $localize`Daily totals`, value: 'daily-totals' },
    { label: $localize`All time totals`, value: 'all-time-totals' },
  ];

  nzSelectedIndex = 0;

  radioValue$ = new BehaviorSubject<RadioOptionValue>(
    this.radioOptions[this.nzSelectedIndex].value,
  );

  private _destroy$ = new Subject<void>();

  constructor(
    private data: ExtendedPlantMetricsDataService,
    pageRouting: PageRoutingService,
  ) {
    const plant$: Observable<Plant> = pageRouting
      .getPlantFromQueryParams()
      .pipe(distinctUntilKeyChanged('id'), takeUntil(this._destroy$));

    this.pmLiveData$ = combineLatest([plant$, this.levelOfMeasurement$]).pipe(
      switchMap(([plant, levelOfMeasurement]) =>
        this.data.getLiveData(plant, levelOfMeasurement).pipe(takeUntil(this._destroy$)),
      ),
      shareReplay(1),
      takeUntil(this._destroy$),
    );
  }

  onSelectedTabIndexChange(index: number) {
    this.nzSelectedIndex = index;

    const newValue = this.radioOptions[index].value;
    this.radioValue$.next(newValue);
  }

  ngOnDestroy() {
    this._destroy$.next();
  }
}
