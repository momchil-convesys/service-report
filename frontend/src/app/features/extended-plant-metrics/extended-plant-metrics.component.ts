import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { map, Observable, switchMap } from 'rxjs';
import { DataRequest } from '../../constants';
import { ExtendedPlantMetricsDataService } from './_data/data.service';
import {
  LevelOfMeasurement,
  PlantMetricsMetadata_DTO,
  routeSegmentForLevelOfMeasurement,
} from './_data/dto';

@Component({
  selector: 'app-extended-plant-metrics',
  imports: [NzTabsModule, RouterLink, RouterOutlet, AsyncPipe, NzSpinModule],
  templateUrl: './extended-plant-metrics.component.html',
  styleUrl: './extended-plant-metrics.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtendedPlantMetricsComponent {
  LevelOfMeasurement = LevelOfMeasurement;
  routeSegment = routeSegmentForLevelOfMeasurement;

  metadataRequest$: Observable<DataRequest<PlantMetricsMetadata_DTO>>;

  constructor(route: ActivatedRoute, data: ExtendedPlantMetricsDataService) {
    const plant$ = route.paramMap.pipe(
      map((params) => {
        const plantId = params.get('plantId');

        if (!plantId) {
          throw new Error('Missing parameters in route.');
        }

        return plantId;
      }),
      takeUntilDestroyed(),
    );

    this.metadataRequest$ = plant$.pipe(
      switchMap((plantId) => data.getPlantMetricsMetadata(plantId)),
    );
  }
}
