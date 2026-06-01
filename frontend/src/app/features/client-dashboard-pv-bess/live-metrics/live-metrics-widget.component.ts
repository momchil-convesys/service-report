import { CommonModule, DatePipe, formatNumber } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { map, shareReplay, Subject, switchMap, takeUntil } from 'rxjs';
import { APP_LOCALE_ID } from '../../../app-locale';
import {
  BaseUnit,
  formatUnitSpacing,
  scaleAndFormatValue_v2,
  utcToZonedTimeSafe,
} from '../../../helpers';
import { IconName } from '../../../shared/flow-chart/icons/icon-names';
import { PageRoutingService } from '../../../shared/page-routing.service';
import { BESSMomentaryDataValue } from '../../bess/_data/models';
import { BessSocIndicatorComponent } from '../../bess/shared/bess-soc-indicator/bess-soc-indicator.component';
import { BessSocIndicatorData } from '../../bess/shared/bess-soc-indicator/model';
import { BessStateIndicatorComponent } from '../../bess/shared/bess-state-indicator/bess-state-indicator.component';
import { PvBessViewMode } from '../constants';
import { buildLiveMetricsBoxInput, LiveMetricUnitKind } from './_data/live-metrics.helpers';
import { PvBessLiveMetricsService } from './_data/live-metrics.service';
import { PvBessLiveMetricsData, PvBessLiveMetricValues } from './_data/models';
import { LiveMetricsBoxComponent } from './live-metrics-box/live-metrics-box.component';

@Component({
  selector: 'app-live-metrics-widget',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    NzSkeletonModule,
    BessSocIndicatorComponent,
    BessStateIndicatorComponent,
    LiveMetricsBoxComponent,
    NzPopoverModule,
    NzIconModule,
  ],
  templateUrl: './live-metrics-widget.component.html',
  styleUrl: './live-metrics-widget.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PvBessLiveMetricsService],
})
export class LiveMetricsWidgetComponent {
  @Input() viewMode: PvBessViewMode = 'default';

  private readonly pageRouting = inject(PageRoutingService);
  private readonly liveMetricsService = inject(PvBessLiveMetricsService);
  private readonly destroy$ = new Subject<void>();

  getGridPowerTitle(voltage: 'MV' | 'HV'): string {
    return voltage === 'MV' ? $localize`Grid power (MV)` : $localize`Grid power (HV)`;
  }

  readonly liveMetrics$ = this.pageRouting.getPlantFromQueryParams().pipe(
    switchMap((plant) =>
      this.liveMetricsService.getLiveMetrics(plant.id).pipe(
        map((req) => ({
          ...req,
          data: req.data
            ? {
                ...req.data,
                zonedUpdatedAt: utcToZonedTimeSafe(new Date(req.data.updatedAt), plant.timeZone),
              }
            : undefined,
        })),
        takeUntil(this.destroy$),
      ),
    ),
    shareReplay(1),
    takeUntil(this.destroy$),
  );

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  buildBoxInput(
    values: PvBessLiveMetricValues,
    subPlantLabels: string[],
    kind: LiveMetricUnitKind,
  ) {
    return buildLiveMetricsBoxInput(values, subPlantLabels, kind);
  }

  getSubPlantLabels(data: PvBessLiveMetricsData): string[] {
    return ['Sub-plant 1', 'Sub-plant 2'];
  }

  convertBessPowerToSocData(
    data: PvBessLiveMetricsData,
    collection: 'total' | 'subPlant1' | 'subPlant2',
  ): BessSocIndicatorData {
    return {
      timestamp: data.updatedAt,
      soc: data.values.soc?.[collection] ?? null,
      soh: null,
      maxChargeableEnergy: data.values.maximumChargeableEnergy?.[collection] ?? null,
      maxDischargeableEnergy: data.values.maximumDischargeableEnergy?.[collection] ?? null,
    };
  }

  convertBessPowerToStateData(
    value: number | null | undefined,
    timestamp: string,
  ): BESSMomentaryDataValue {
    return {
      value: value,
      unixTimestamp: new Date(timestamp).getTime(),
    };
  }

  getScaledValue(
    value: number | null,
    baseUnit: BaseUnit | undefined,
  ): { value: string | null; unit: string | undefined } {
    return scaleAndFormatValue_v2(value, value ?? undefined, baseUnit, 0);
  }

  formatNumber(value: number | null, unit: string): string {
    return value !== null
      ? formatNumber(value, APP_LOCALE_ID, '1.0-3') + formatUnitSpacing(unit)
      : 'No data';
  }

  getGridIconArrow(value: number | null): IconName | undefined {
    if (!value || value === 0) {
      return undefined;
    }

    if (value > 0) {
      return 'arrow-left';
    }

    if (value < 0) {
      return 'arrow-right';
    }

    return undefined;
  }
}
