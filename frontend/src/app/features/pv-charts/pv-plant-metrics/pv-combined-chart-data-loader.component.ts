import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Observable,
  combineLatest,
  filter,
  map,
  of,
  shareReplay,
  switchMap,
  withLatestFrom,
} from 'rxjs';
import { AccessControlPermission, DataRequest, DeviceType } from '../../../constants';
import { Plant, PowerLimitDetails } from '../../../data/models';
import { UsersService } from '../../../data/services/users.service';
import { BaseChartContext } from '../../../shared/base-chart-component/base-chart-component.component';
import { PageRoutingService } from '../../../shared/page-routing.service';
import { ActivePowerLimitSchedule } from '../../power-limit-schedule/_data/active-schedule';

import { PvPlantMetricsDataService } from './_data/data.service';
import { PVPlantEssentialMetrics } from './_data/pv-plant-metrics.model';

@Component({
  selector: 'app-pv-combined-chart-data-loader',
  templateUrl: './pv-combined-chart-data-loader.component.html',
  styleUrls: ['./pv-combined-chart-data-loader.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PvPlantMetricsDataService],
  standalone: false,
})
export class PvCombinedChartDataLoaderComponent {
  chartData$: Observable<PVPlantEssentialMetrics | undefined>;
  chartDataLoading$: Observable<boolean>;
  error$: Observable<Error | undefined>;

  chartContext$: Observable<BaseChartContext>;

  constructor(
    pvData: PvPlantMetricsDataService,
    pageRouting: PageRoutingService,
    private usersService: UsersService,
  ) {
    const plant$: Observable<Plant> = pageRouting.getPlantFromQueryParams().pipe(
      filter((plant) => plant.type === DeviceType.Solar),
      takeUntilDestroyed(),
    );

    this.chartContext$ = plant$.pipe(
      map((plant) => ({ plant, deviceId: null })),
      takeUntilDestroyed(),
    );

    const chartDataRequest$: Observable<DataRequest<PVPlantEssentialMetrics>> = plant$.pipe(
      switchMap((plant) => pvData.getPvPlantMetricsRequest(plant.id)),
      shareReplay(1),
      takeUntilDestroyed(),
    );

    const pvPlantMetrics$ = chartDataRequest$.pipe(map((req) => req.data));

    this.chartDataLoading$ = chartDataRequest$.pipe(map((req) => req.isLoading));
    this.error$ = chartDataRequest$.pipe(map((req) => req.error));

    const invertersPowerLimit$: Observable<(PowerLimitDetails | null)[]> = plant$.pipe(
      map((plant) => plant.devices),
      switchMap((devices) => {
        if (!devices) {
          return of([]);
        }

        const powerLimitObservables: Observable<PowerLimitDetails | null>[] = devices.map(
          (device) =>
            device.powerLimitSubject.pipe(
              map((powerLimit) =>
                powerLimit ? { ...powerLimit, deviceId: device.id } : powerLimit,
              ),
            ),
        );
        return combineLatest(powerLimitObservables);
      }),
      takeUntilDestroyed(),
    );

    const activePowerLimitSchedule$: Observable<ActivePowerLimitSchedule | null> = plant$.pipe(
      switchMap((plant) => plant.activePowerLimitSchedule$),
      takeUntilDestroyed(),
    );

    this.chartData$ = combineLatest([
      pvPlantMetrics$,
      invertersPowerLimit$,
      activePowerLimitSchedule$,
    ]).pipe(
      map(([pvPlantMetricsData, powerLimits, activePowerLimitSchedule]) => {
        const data: PVPlantEssentialMetrics | undefined = pvPlantMetricsData;

        if (!data) {
          return data;
        }

        return {
          ...data,
          plantEssentialMetrics: {
            ...data.plantEssentialMetrics,
            activePowerLimitSchedule: activePowerLimitSchedule || undefined,
          },
          deviceEssentialMetrics: data.deviceEssentialMetrics.map((point) => ({
            ...point,
            powerLimit: powerLimits.find((pl) =>
              pl ? (pl as any).deviceId === point.deviceId : false,
            ),
          })),
        };
      }),
      withLatestFrom(plant$),
      map(([data, plant]: [PVPlantEssentialMetrics | undefined, Plant]) => {
        if (!data) {
          return data;
        }

        /**
         * ----------------------------------------------------------------------
         * Show "unlimited" if the current power limit
         * is more than plant installed power capacity.
         */
        if (
          data.plantScheduledLimitData &&
          data.plantScheduledLimitData.requestedPowerLimitSet !== null
          // && data.plantScheduledLimitData.hasEffectivePowerLimit !== true
        ) {
          const maxPowerLimitTreshold: number | undefined =
            plant.plantSpecificMetadata?.maxPowerLimitTreshold;
          const limitIsOverTreshold: boolean =
            maxPowerLimitTreshold !== undefined &&
            data.plantScheduledLimitData.requestedPowerLimitSet > maxPowerLimitTreshold;

          if (
            // data.plantScheduledLimitData.hasEffectivePowerLimit === false ||
            limitIsOverTreshold
          ) {
            data.plantScheduledLimitData.requestedPowerLimitSet = null;

            data.deviceScheduledLimitDataPoints?.map((point) => {
              point.requestedPowerLimitSet = null;
            });
          }
        }

        /**
         * ----------------------------------------------------------------------
         * Reset negative active power values to zero.
         * Negative power values are either unexpected
         * or measure energy consumption.
         */
        if (data.powerMetersData?.totalActivePower && data.powerMetersData?.totalActivePower < 0) {
          data.powerMetersData.totalActivePower = 0;
        }

        /**
         * ----------------------------------------------------------------------
         * Fix for the following case:
         *
         * After sun set, plant active power is zero (measured from power meter)
         * and sheculed limit (from file) is zero,
         * the limiting algorithm has stopped,
         * but keeps the last effective value.
         *
         * In this case we show the limit as zero
         * and ignore transformer stations limits.
         */
        if (plant.plantSpecificMetadata?.powerLimitType === 'power') {
          if (
            data.plantScheduledLimitData?.requestedPowerLimit === 0 &&
            data.powerMetersData?.totalActivePower === 0
            // && Math.abs(
            //   new Date(data.plantScheduledLimitData.timestamp).getTime() -
            //     new Date(data.powerMetersData.timestamp).getTime()
            // ) <
            //   ONE_SECOND * 30
          ) {
            data.plantScheduledLimitData.requestedPowerLimitSet = 0;
            data.deviceScheduledLimitDataPoints = [];
            // data.deviceScheduledLimitDataPoints?.map((point) => {
            //   point.requestedPowerLimitSet = null;
            //   point.requestedPowerLimit = 0;
            // });
          }
        }

        /**
         * Show more details in chart for developers only.
         */
        data.hasPermissionToSeeAllDetails = this.usersService.hasCurrentUserPermission(
          AccessControlPermission.ThirdEye,
        );

        return data;
      }),
      takeUntilDestroyed(),
    );
  }
}
