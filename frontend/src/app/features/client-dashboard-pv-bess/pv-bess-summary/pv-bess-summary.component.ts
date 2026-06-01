import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { shareReplay, Subscription, switchMap } from 'rxjs';
import { utcToZonedTimeSafe } from '../../../helpers';
import { PageRoutingService } from '../../../shared/page-routing.service';
import { ValueDisplayComponent } from '../../../shared/value-display/value-display.component';
import { BESSDataService } from '../../bess/_data/data.service';
import { BESSAssetType } from '../../bess/_data/dto/assets/asset-base.dto';
import { BESSMomentaryDataValue } from '../../bess/_data/models';
import { BESSMomentaryDataService } from '../../bess/_data/momentary-data.service';
import {
  BessActiveAlarmsSummary,
  BessActiveAlarmsSummaryComponent,
} from '../../bess/bess-overview-page/bess-summary/bess-active-alarms-summary/bess-active-alarms-summary.component';
import { BessSocIndicatorComponent } from '../../bess/shared/bess-soc-indicator/bess-soc-indicator.component';
import { getBessState } from '../../bess/shared/bess-state';
import {
  BessState,
  BessStateIndicatorComponent,
} from '../../bess/shared/bess-state-indicator/bess-state-indicator.component';
import {
  ActivePowerLimitSchedule,
  adaptActivePowerLimitSchedule,
} from '../../power-limit-schedule/_data/active-schedule';
import { MasterGwScheduledPowerLimitDataPoint_ForPlant } from '../../power-limit-schedule/_data/dto';
import { PvPlantMetricsDataService } from '../../pv-charts/pv-plant-metrics/_data/data.service';

@Component({
  selector: 'app-pv-bess-summary',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    RouterLink,
    BessStateIndicatorComponent,
    BessSocIndicatorComponent,
    BessActiveAlarmsSummaryComponent,
    ValueDisplayComponent,
    NzSkeletonModule,
    NzButtonModule,
  ],
  templateUrl: './pv-bess-summary.component.html',
  styleUrl: './pv-bess-summary.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PvPlantMetricsDataService],
})
export class PvBessSummaryComponent implements OnInit, OnDestroy {
  private readonly live = inject(BESSMomentaryDataService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly bessDataService = inject(BESSDataService);
  private readonly pvDataService = inject(PvPlantMetricsDataService);
  private readonly pageRouting = inject(PageRoutingService);

  private bessSub?: Subscription;
  private pvSub?: Subscription;
  private scheduleSub?: Subscription;
  private bessAssetId: string | null = null;

  // BESS displayed values
  bessSoc: BESSMomentaryDataValue | null = null;
  bessSoh: BESSMomentaryDataValue | null = null;
  bessActivePower: BESSMomentaryDataValue | null = null;
  chargeableCapacity: BESSMomentaryDataValue | null = null;
  dischargeableCapacity: BESSMomentaryDataValue | null = null;
  maximumChargePower: BESSMomentaryDataValue | null = null;
  maximumDischargePower: BESSMomentaryDataValue | null = null;
  activeAlarmsSummary: BessActiveAlarmsSummary | null = null;

  bessDataLoaded = false;
  hasBess = false;

  // PV displayed values
  pvActivePower: number | null = null;
  pvScheduledLimitData: MasterGwScheduledPowerLimitDataPoint_ForPlant | null = null;
  activeSchedule: ActivePowerLimitSchedule | null = null;
  pvDataLoading = true;
  scheduleLoading = true;

  private readonly componentId = 'PvBessSummaryComponent';

  plant$: ReturnType<PageRoutingService['getPlantFromQueryParams']>;
  plantId: string | null = null;

  constructor() {
    this.plant$ = this.pageRouting.getPlantFromQueryParams();
    this.plant$.subscribe((plant) => {
      this.plantId = plant.id;
    });
  }

  ngOnInit(): void {
    // Initialize BESS data
    const bessId = this.bessDataService.getBESSMetadataFromCache()?.id;
    if (bessId) {
      this.hasBess = true;
      this.bessDataLoaded = false;
      this.live.setBESS(bessId);

      const socId = this.bessDataService.getBESSParameterIdByKey('stateOfCharge');
      const sohId = this.bessDataService.getBESSParameterIdByKey('stateOfHealth');
      const apId = this.bessDataService.getBESSParameterIdByKey('activePower');
      const chargeableCapacityId =
        this.bessDataService.getBESSParameterIdByKey('chargeableCapacity');
      const dischargeableCapacityId =
        this.bessDataService.getBESSParameterIdByKey('dischargeableCapacity');
      const maximumChargePowerId =
        this.bessDataService.getBESSParameterIdByKey('maximumChargePower');
      const maximumDischargePowerId =
        this.bessDataService.getBESSParameterIdByKey('maximumDischargePower');
      const majorAlarmsId = this.bessDataService.getBESSParameterIdByKey('quantityOfMajorAlarms');
      const minorAlarmsId = this.bessDataService.getBESSParameterIdByKey('quantityOfMinorAlarms');
      const warningAlarmsId = this.bessDataService.getBESSParameterIdByKey('quantityOfWarnings');

      const bessAssetId = this.bessDataService.getBESSAssetIdsByType(BESSAssetType.BESSItself)[0];

      if (
        socId &&
        sohId &&
        apId &&
        majorAlarmsId &&
        minorAlarmsId &&
        warningAlarmsId &&
        bessAssetId
      ) {
        this.bessAssetId = bessAssetId;

        const logicalParameterIds = [
          socId,
          sohId,
          apId,
          majorAlarmsId,
          minorAlarmsId,
          warningAlarmsId,
          chargeableCapacityId,
          dischargeableCapacityId,
          maximumChargePowerId,
          maximumDischargePowerId,
        ].filter((id): id is string => typeof id === 'string');

        this.live.registerWatch(this.componentId, {
          assetFilter: { assetType: BESSAssetType.BESSItself },
          logicalParameterIds,
        });

        let firstMessageReceived = false;
        this.bessSub = this.live.liveMessage$.subscribe((message) => {
          // Mark as loaded after first message arrives (connection is active)
          if (!firstMessageReceived) {
            firstMessageReceived = true;
            this.bessDataLoaded = true;
          }

          if (!message) return;

          const bessAsset = message.assets.find((a) => a.assetId === this.bessAssetId);
          if (!bessAsset) return;

          this.bessSoc = {
            value: bessAsset.values[socId ?? '']?.[1],
            unixTimestamp: bessAsset.values[socId ?? '']?.[0],
          };
          this.bessSoh = {
            value: bessAsset.values[sohId ?? '']?.[1],
            unixTimestamp: bessAsset.values[sohId ?? '']?.[0],
          };
          this.bessActivePower = {
            value: bessAsset.values[apId ?? '']?.[1],
            unixTimestamp: bessAsset.values[apId ?? '']?.[0],
          };

          this.chargeableCapacity = chargeableCapacityId
            ? {
                value: bessAsset.values[chargeableCapacityId]?.[1],
                unixTimestamp: bessAsset.values[chargeableCapacityId]?.[0],
              }
            : null;

          this.dischargeableCapacity = dischargeableCapacityId
            ? {
                value: bessAsset.values[dischargeableCapacityId]?.[1],
                unixTimestamp: bessAsset.values[dischargeableCapacityId]?.[0],
              }
            : null;

          this.maximumChargePower = maximumChargePowerId
            ? {
                value: bessAsset.values[maximumChargePowerId]?.[1],
                unixTimestamp: bessAsset.values[maximumChargePowerId]?.[0],
              }
            : null;

          this.maximumDischargePower = maximumDischargePowerId
            ? {
                value: bessAsset.values[maximumDischargePowerId]?.[1],
                unixTimestamp: bessAsset.values[maximumDischargePowerId]?.[0],
              }
            : null;

          this.activeAlarmsSummary = {
            major: this.getParameterCount(bessAsset.values[majorAlarmsId]),
            minor: this.getParameterCount(bessAsset.values[minorAlarmsId]),
            warning: this.getParameterCount(bessAsset.values[warningAlarmsId]),
          };

          this.bessDataLoaded = true;
          this.cdr.detectChanges();
        });
      } else {
        // If setup conditions aren't met, mark as loaded (no BESS data available)
        this.bessDataLoaded = true;
      }
    }

    // Initialize PV data
    this.pvSub = this.plant$
      .pipe(
        switchMap((plant) => this.pvDataService.getPvPlantMetricsRequest(plant.id)),
        shareReplay(1),
      )
      .subscribe((request) => {
        if (request.data) {
          this.pvActivePower = request.data.plantEssentialMetrics.activePower;
          this.pvScheduledLimitData = request.data.plantScheduledLimitData;
          this.pvDataLoading = false;
        } else if (request.error) {
          this.pvDataLoading = false;
        } else {
          this.pvDataLoading = request.isLoading ?? true;
        }
        this.cdr.detectChanges();
      });

    // Initialize active schedule
    this.scheduleSub = this.plant$
      .pipe(
        switchMap((plant) => plant.activePowerLimitSchedule$),
        shareReplay(1),
      )
      .subscribe((schedule) => {
        // Mock schedule for testing - remove in production
        if (!schedule) {
          schedule = this.createMockSchedule(undefined);
        }
        this.activeSchedule = schedule;
        // Schedule loading is complete on first emission (null is a valid state)
        if (this.scheduleLoading) {
          this.scheduleLoading = false;
        }
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.live.unregisterWatch(this.componentId);
    this.bessSub?.unsubscribe();
    this.pvSub?.unsubscribe();
    this.scheduleSub?.unsubscribe();
  }

  getBessState(data: BESSMomentaryDataValue | null): BessState | null {
    return getBessState(data);
  }

  getScheduleInterval(): { start: Date; end: Date } | null {
    if (!this.activeSchedule?.currentRecord?.interval) {
      return null;
    }
    const record = this.activeSchedule.currentRecord;
    return {
      start: this.convertTimestampToPlantTimeZone(record.interval.from),
      end: this.convertTimestampToPlantTimeZone(record.interval.to),
    };
  }

  getScheduleTarget(): number | null {
    if (!this.activeSchedule?.currentRecord) {
      return null;
    }
    return (
      this.activeSchedule.currentRecord.calculatedTarget ??
      this.activeSchedule.currentRecord.powerLimitMw
    );
  }

  getScheduleUnit(): string {
    if (!this.activeSchedule?.currentRecord) {
      return ' MW';
    }
    return this.activeSchedule.currentRecord.powerLimitType === 'power' ? ' MW' : ' MWh';
  }

  getScheduleLink(plantId: string): string {
    return `/plants/${plantId}/power-limit-schedule/active-schedule`;
  }

  private convertTimestampToPlantTimeZone(timestamp: string): Date {
    return utcToZonedTimeSafe(timestamp, this.activeSchedule?.plantTimeZone);
  }

  private createMockSchedule(plantTimeZone?: string): ActivePowerLimitSchedule {
    const now = new Date();
    const fromTime = new Date(now);
    fromTime.setMinutes(Math.floor(now.getMinutes() / 15) * 15, 0, 0); // Round down to nearest 15 minutes
    const toTime = new Date(fromTime);
    toTime.setMinutes(toTime.getMinutes() + 15); // Add 15 minutes

    const mockScheduleDTO = {
      id: 'mock-schedule-1',
      timestamp: now.toISOString(),
      complianceStatus: 'compliant' as const,
      nonComplianceReason: null,
      currentRecord: {
        powerLimitMw: 5.5, // 5.5 MW for PV, or charge/discharge target for BESS
        interval: {
          from: fromTime.toISOString(), // ISO timestamp format
          to: toTime.toISOString(), // ISO timestamp format
        },
        powerLimitType: 'power' as const,
      },
      fileRefId: 'mock-file-123',
    };

    return adaptActivePowerLimitSchedule(mockScheduleDTO, plantTimeZone, undefined);
  }

  private getParameterCount(value: [number, number | null] | undefined): number | null | undefined {
    return value?.[1];
  }
}
