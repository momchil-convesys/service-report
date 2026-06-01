import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { filter, map, Observable, shareReplay, switchMap } from 'rxjs';
import { Plant } from '../../data/models';
import { FlowChartParameters } from '../../shared/flow-chart/models';
import { PageRoutingService } from '../../shared/page-routing.service';
import { BESSApiService } from '../bess/_data/api.service';
import { BESSDataService } from '../bess/_data/data.service';
import { BESSMetadataDTO } from '../bess/_data/dto/bess.dto';
import { BESSMomentaryDataService } from '../bess/_data/momentary-data.service';
import { PowerScheduleManualAdjustmentComponent } from '../power-schedule/power-schedule-manual-adjustment/power-schedule-manual-adjustment.component';
import { PvBessViewMode } from './constants';
import { EnergyDistributionDataService } from './energy-distribution/_data/data.service';
import { EnergyDistributionComponent } from './energy-distribution/energy-distribution.component';
import { HistoricalEnergyChartComponent } from './historical-energy-chart/historical-energy-chart.component';
import { HistoricalPowerChartComponent } from './historical-power-chart/historical-power-chart.component';
import { LiveMetricsWidgetComponent } from './live-metrics/live-metrics-widget.component';

@Component({
  selector: 'app-client-dashboard-pv-bess-page',
  standalone: true,
  imports: [
    CommonModule,
    LiveMetricsWidgetComponent,
    EnergyDistributionComponent,
    HistoricalPowerChartComponent,
    HistoricalEnergyChartComponent,
    NzButtonModule,
    NzIconModule,
    NzTooltipModule,
    PowerScheduleManualAdjustmentComponent,
    NzResultModule,
    FormsModule,
    NzRadioModule,
    // NzTabsModule,
  ],
  templateUrl: './client-dashboard-pv-bess-page.component.html',
  styleUrl: './client-dashboard-pv-bess-page.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // TODO: providers should be at a more global level
  providers: [
    PageRoutingService,
    BESSApiService,
    BESSDataService,
    BESSMomentaryDataService,
    EnergyDistributionDataService,
  ],
})
export class ClientDashboardPvBessPageComponent {
  private pageRouting = inject(PageRoutingService);
  private bessDataService = inject(BESSDataService);

  plant$: Observable<Plant>;

  bessMetadata$: Observable<BESSMetadataDTO | undefined> | undefined;

  readonly defaultFlowChartParameters: FlowChartParameters = {
    pvOut: null,
    gridIn: null,
    gridOut: null,
    battIn: null,
    battOut: null,
    consIn: null,
  };

  viewMode: PvBessViewMode = 'default';

  constructor() {
    this.plant$ = this.pageRouting.getPlantFromQueryParams();

    // Load BESS metadata if plant has BESS
    this.bessMetadata$ = this.plant$.pipe(
      map((plant) => plant.plantSpecificMetadata?.bessId),
      filter((bessId): bessId is string => !!bessId),
      switchMap((bessId) => this.bessDataService.getBESSMetadata(bessId)),
      map((request) => request.data),
      shareReplay(1),
      takeUntilDestroyed(),
    );
  }

  setViewMode(mode: PvBessViewMode): void {
    this.viewMode = mode;
  }
}
