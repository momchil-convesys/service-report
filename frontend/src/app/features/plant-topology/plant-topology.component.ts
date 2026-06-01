import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { map, Observable, shareReplay } from 'rxjs';
import { DataRequest } from '../../constants';
import { handleAnyError } from '../../helpers';
import { PlantTopologyApiService } from './_data/api';
import { PlantTopology_DTO } from './_data/models';
import { PtGridViewComponent } from './pt-grid-view/pt-grid-view.component';
import { PtTableViewComponent } from './pt-table-view/pt-table-view.component';

@Component({
  selector: 'app-plant-topology',
  imports: [
    AsyncPipe,
    NzAlertModule,
    NzSpinModule,
    NzRadioModule,
    FormsModule,
    PtGridViewComponent,
    PtTableViewComponent,
  ],
  templateUrl: './plant-topology.component.html',
  styleUrl: './plant-topology.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PlantTopologyApiService],
})
export class PlantTopologyComponent {
  data$: Observable<PlantTopology_DTO | undefined>;

  error$: Observable<Error | null>;
  loading$: Observable<boolean>;

  selectedView: 'table' | 'grid' = 'table';

  constructor(api: PlantTopologyApiService) {
    const plantTopologyRequest$: Observable<DataRequest<PlantTopology_DTO>> = api
      .getPlantTopology()
      .pipe(shareReplay(1));

    this.loading$ = plantTopologyRequest$.pipe(map((req) => req.isLoading));
    this.error$ = plantTopologyRequest$.pipe(
      map((req) => (req.error ? handleAnyError(req.error, undefined) : null)),
    );

    this.data$ = plantTopologyRequest$.pipe(map((req) => req.data));
  }
}
