import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import {
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';
import { DataRequest } from '../../../constants';
import { TransformerStation_DTO } from '../../../data/dtos';
import { LiveDataIndicatorComponent } from '../../../shared/live-data-indicator/live-data-indicator.component';
import { InverterMetricsService } from './_data/api';
import { TransformerStation_Metrics_DTO } from './_data/dto';
import { InvertersService } from './_data/inverters.service';
import { InvertersGridViewComponent } from './inverters-grid-view/inverters-grid-view.component';
import { InverterMetricsTableComponent } from './inverters-table/inverter-metrics-table.component';

interface Context {
  plantId: string;
  deviceId: string | null;
}
@Component({
  selector: 'app-inverters-page',
  standalone: true,
  imports: [
    AsyncPipe,
    InverterMetricsTableComponent,
    NzAlertModule,
    LiveDataIndicatorComponent,
    InvertersGridViewComponent,
    NzRadioModule,
    FormsModule,
    RouterOutlet,
    // InvertersNavListComponent,
  ],
  templateUrl: './inverters-page.component.html',
  styleUrl: './inverters-page.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [InverterMetricsService],
})
export class InvertersPageComponent {
  data$: Observable<TransformerStation_Metrics_DTO[]>;
  metadata$: Observable<TransformerStation_DTO[]>;

  loading$: Observable<boolean>;
  error$: Observable<Error | undefined>;

  selectedView: 'table' | 'grid' = 'grid';

  constructor(
    private route: ActivatedRoute,
    private api: InverterMetricsService,
    private metadata: InvertersService,
  ) {
    const deviceId$ = this.route.paramMap.pipe(
      map((params) => params.get('deviceId')),
      distinctUntilChanged(),
    );

    const plantId$ = this.route.paramMap.pipe(
      map((params) => params.get('plantId')),
      distinctUntilChanged(),
    );

    const context$: Observable<Context> = combineLatest([plantId$, deviceId$]).pipe(
      map(([plantId, deviceId]) => {
        if (!plantId) {
          throw 'Application error: Component called without context';
        }
        return { plantId, deviceId };
      }),
    );

    const tsMetadataRequest$: Observable<DataRequest<TransformerStation_DTO[]>> = context$.pipe(
      switchMap((context) =>
        context.deviceId
          ? this.metadata.getTsMetadata(context.deviceId)
          : this.metadata.getTsMetadataForPlant(context.plantId),
      ),
      // shareReplay(1), // Sharing reply in API!
      takeUntilDestroyed(),
    );

    this.metadata$ = tsMetadataRequest$.pipe(
      map((req) => req.data),
      filter((data) => !!data),
    );

    const tsDataRequest$: Observable<DataRequest<TransformerStation_Metrics_DTO[]>> =
      tsMetadataRequest$.pipe(
        withLatestFrom(context$),
        switchMap(([metadataRequest, context]) => {
          if (metadataRequest.data) {
            return context.deviceId
              ? this.api.getTsMetrics(context.deviceId)
              : this.api.getTsMetricsForPlant(context.plantId);
          }

          if (metadataRequest.isLoading) {
            return of({
              data: undefined,
              isLoading: true,
            });
          }

          return of({
            data: undefined,
            isLoading: false,
            error: new Error('No metadata available'),
          });
        }),
        tap((req) => this.api.lastDataRequest$.next(req)),
        shareReplay(1),
        takeUntilDestroyed(),
      );

    this.data$ = tsDataRequest$.pipe(
      map((req) => req.data),
      filter((data) => !!data),
    );

    this.error$ = combineLatest([tsMetadataRequest$, tsDataRequest$]).pipe(
      map(([req1, req2]) => req1.error || req2.error),
    );

    this.loading$ = combineLatest([tsMetadataRequest$, tsDataRequest$]).pipe(
      map(([req1, req2]) => req1.isLoading || req2.isLoading),
    );
  }
}
