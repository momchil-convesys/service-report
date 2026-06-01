import { AsyncPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzTableModule } from 'ng-zorro-antd/table';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
  withLatestFrom,
} from 'rxjs';
import { DataRequest } from '../../../../constants';
import { Inverter_DTO, TransformerStation_DTO } from '../../../../data/dtos';
import { Device, DeviceParametersTemplate } from '../../../../data/models';
import { ParameterTemplatesService } from '../../../../data/services/parameter-templates.service';
import { PlantsService } from '../../../../data/services/plants.service';
import { StaleDataService } from '../../../../data/services/stale-data.service';
import { DeviceStateModule } from '../../../../shared/device-state/device-state.module';
import { ValueDisplayComponent } from '../../../../shared/value-display/value-display.component';
import { DeviceMetrics } from '../../../device-metrics/_data/device-metrics.model';
import { InverterMetricsService } from '../_data/api';
import { InverterMetrics_DataPoint_DTO } from '../_data/dto';
import { InvertersService } from '../_data/inverters.service';
import { InverterAlarmIconComponent } from '../inverters-grid-view/inverter-grid-box/inverter-alarm-icon/inverter-alarm-icon.component';
import { InverterPowerBarComponent } from '../inverters-grid-view/inverter-power-bar/inverter-power-bar.component';
import { InverterDetailsApiService } from './_data/api';
import { InverterPowerChartContext } from './_data/models';
import { InverterParametersTableComponent } from './inverter-parameters-table/inverter-parameters-table.component';
import { InverterPowerChartComponent } from './inverter-power-chart/inverter-power-chart.component';
import { PrFormulaComponent } from './pr-formula/pr-formula.component';

@Component({
  selector: 'app-inverter-detail-page',
  imports: [
    NzButtonModule,
    NzIconModule,
    RouterLink,
    AsyncPipe,
    InverterParametersTableComponent,
    InverterPowerChartComponent,
    NzAlertModule,
    DeviceStateModule,
    NzPopoverModule,
    InverterPowerBarComponent,
    NzSkeletonModule,
    NzTableModule,
    ValueDisplayComponent,
    PrFormulaComponent,
    InverterAlarmIconComponent,
    DatePipe,
  ],
  templateUrl: './inverter-detail-page.component.html',
  styleUrl: './inverter-detail-page.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [InverterDetailsApiService],
})
export class InverterDetailPageComponent {
  inverterMetadata$: Observable<Inverter_DTO | undefined>;
  tsParametersTemplate$: Observable<DeviceParametersTemplate | undefined>;
  inverterMetricsDataRequest$: Observable<DataRequest<DeviceMetrics | undefined>>;
  powerChartContext$: Observable<InverterPowerChartContext | undefined>;
  inverterDataRequest$: Observable<DataRequest<InverterMetrics_DataPoint_DTO | undefined>>;

  loadingMetadata$: Observable<boolean>;
  loading$: Observable<boolean>;
  error$: Observable<Error | undefined>;

  popoverVisible$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private route: ActivatedRoute,
    private api: InverterMetricsService,
    private metadata: InvertersService,
    private plantsService: PlantsService,
    private parameterTemplates: ParameterTemplatesService,
    private inveterApiService: InverterDetailsApiService,
    private staleDataService: StaleDataService,
  ) {
    const inverterId$ = this.route.paramMap.pipe(
      map((params) => params.get('inverterId') || 'MISSING_INVERTER_ID'),
      distinctUntilChanged(),
    );

    const tsId$ = this.route.paramMap.pipe(
      map((params) => params.get('contextTsId') || 'MISSING_TRANSFORMER_STATION_ID'),
      distinctUntilChanged(),
    );

    const plantId$ = this.route.paramMap.pipe(
      map((params) => params.get('plantId') || 'MISSING_PLANT_ID'),
      distinctUntilChanged(),
    );

    const tsMetadataRequest$: Observable<DataRequest<TransformerStation_DTO[]>> = tsId$.pipe(
      switchMap((tsId) =>
        tsId
          ? this.metadata.getTsMetadata(tsId)
          : of({
              error: new Error('Application error: missing transformer station ID as context.'),
              data: [],
              isLoading: false,
            }),
      ),
      takeUntilDestroyed(),
    );

    const tsMetadata$ = tsMetadataRequest$.pipe(
      map((req) => (req.data?.length ? req.data[0] : undefined)),
    );

    this.inverterMetadata$ = combineLatest([inverterId$, tsMetadata$]).pipe(
      map(([inverterId, tsMetadata]) => {
        return tsMetadata?.inverters.find(
          (inverterMetadata) => inverterMetadata.inverterId === inverterId,
        );
      }),
    );

    this.tsParametersTemplate$ = tsId$.pipe(
      switchMap((deviceId) => {
        const device: Device | undefined = this.plantsService.getCachedDeviceById(deviceId);

        return this.parameterTemplates
          .getDeviceParametersTemplates()
          .pipe(
            map((request) =>
              request.data?.find(
                (template) => template.id === device?.metadata?.parametersTemplateId,
              ),
            ),
          );
      }),
      shareReplay(1),
      takeUntilDestroyed(),
    );

    /**
     * TODO: temporary fix until we have a better way to handle this.
     * When user is on the active alarms page, then refreshes the page, then go to inverters page
     * and selects an inverter, then the parameters template request is not executed properly
     * and stays as pending request for some reason.
     */
    this.tsParametersTemplate$.subscribe();

    this.inverterMetricsDataRequest$ = inverterId$.pipe(
      withLatestFrom(tsId$),
      switchMap(([inverterId, tsId]) =>
        this.inveterApiService.fetchInverterMetrics(tsId, inverterId),
      ),
      shareReplay(1),
    );

    this.powerChartContext$ = combineLatest([plantId$, tsId$, this.inverterMetadata$]).pipe(
      map(([plantId, tsId, inverter]) => {
        const plant = this.plantsService.getCachedPlantById(plantId);
        if (!plant) return undefined;

        const device = plant.devices.find((d: Device) => d.id === tsId);
        if (!device) return undefined;

        if (!inverter) return undefined;

        return {
          plant,
          device,
          inverter,
        };
      }),
      shareReplay(1),
    );

    this.inverterDataRequest$ = combineLatest([tsId$, inverterId$]).pipe(
      switchMap(([tsId, inverterId]) => this.api.getInverterDataFromTsMetrics(tsId, inverterId)),
      shareReplay(1),
    );

    this.loading$ = this.inverterMetricsDataRequest$.pipe(map((req) => req.isLoading));
    this.loadingMetadata$ = tsMetadataRequest$.pipe(map((req) => req.isLoading));

    this.error$ = combineLatest([tsMetadataRequest$, this.inverterMetricsDataRequest$]).pipe(
      map(([tsMetadataReq, inverterMetricsReq]) => tsMetadataReq.error || inverterMetricsReq.error),
    );
  }

  onClosePopover() {
    this.popoverVisible$.next(false);
  }

  onPopoverVisibilityChange(visible: boolean) {
    this.popoverVisible$.next(visible);
  }

  isStaleData(inverterData: InverterMetrics_DataPoint_DTO | undefined): Observable<boolean> {
    return this.staleDataService.isStaleData(inverterData?.timestamp);
  }
}
