import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { map, Observable, shareReplay, switchMap } from 'rxjs';
import { DataRequest } from '../../../constants';
import { ExtendedPlantMetricsDataService } from '../_data/data.service';
import {
  LevelOfMeasurement,
  levelOfMeasurementForRouteSegment,
  LevelOfMeasurementMetadata_DTO,
} from '../_data/dto';
import { getMetadataForLevelOfMeasurement } from '../_data/helpers';
import { EpmHistoricalDataWidgetComponent } from '../epm-historical-data-widget/epm-historical-data-widget.component';
import { EpmLiveDataWidgetComponent } from '../epm-live-data-widget/epm-live-data-widget.component';

interface Context {
  plantId: string;
  levelOfMeasurement: LevelOfMeasurement;
}

@Component({
  selector: 'app-epm-tab-content',
  imports: [
    AsyncPipe,
    EpmLiveDataWidgetComponent,
    NzAlertModule,
    EpmHistoricalDataWidgetComponent,
    NzSpinModule,
  ],
  templateUrl: './epm-tab-content.component.html',
  styleUrl: './epm-tab-content.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EpmTabContentComponent {
  context$: Observable<Context>;

  labelsForLevels: Record<LevelOfMeasurement, string> = {
    [LevelOfMeasurement.PowerMeters]: $localize`Power meters`,
    [LevelOfMeasurement.HighVoltage]: $localize`High voltage`,
    [LevelOfMeasurement.MediumVoltage]: $localize`Medium voltage`,
    [LevelOfMeasurement.TransformerStations]: $localize`Transformer stations`,
  };

  metadataForLevel$: Observable<DataRequest<LevelOfMeasurementMetadata_DTO | null>>;

  constructor(route: ActivatedRoute, data: ExtendedPlantMetricsDataService) {
    this.context$ = route.paramMap.pipe(
      map((params) => {
        const plantId = params.get('plantId');
        const levelOfMeasurement = params.get('level');
        if (!plantId || !levelOfMeasurement) {
          throw new Error('Missing parameters in route.');
        }

        return {
          plantId,
          levelOfMeasurement: levelOfMeasurementForRouteSegment[levelOfMeasurement],
        };
      }),
      takeUntilDestroyed(),
    );

    this.metadataForLevel$ = this.context$.pipe(
      switchMap((context) =>
        data.getPlantMetricsMetadata(context.plantId).pipe(
          map((req) => {
            return {
              ...req,
              data: req.data
                ? getMetadataForLevelOfMeasurement(context.levelOfMeasurement, req.data)
                : undefined,
            };
          }),
        ),
      ),
      shareReplay(1),
      takeUntilDestroyed(),
    );
  }
}
