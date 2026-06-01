import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ValueDisplayComponent } from '../../../../shared/value-display/value-display.component';
import { BESSDataService } from '../../_data/data.service';
import { BESSAssetType } from '../../_data/dto/assets/asset-base.dto';
import { BESSAssetDTO } from '../../_data/dto/assets/asset.dto';
import { BESSMomentaryDataValue } from '../../_data/models';
import { BESSMomentaryDataService } from '../../_data/momentary-data.service';
import {
  BessState,
  BessStateIndicatorComponent,
} from '../../shared/bess-state-indicator/bess-state-indicator.component';

interface ContainerBarItem {
  id: string;
  name: string;
  soc: BESSMomentaryDataValue | null;
  soh: BESSMomentaryDataValue | null;
  activePower: BESSMomentaryDataValue | null;
  chargeableCapacity: BESSMomentaryDataValue | null;
  dischargeableCapacity: BESSMomentaryDataValue | null;
  maximumChargePower: BESSMomentaryDataValue | null;
  maximumDischargePower: BESSMomentaryDataValue | null;
}

@Component({
  selector: 'app-bess-containers-bars',
  standalone: true,
  imports: [BessStateIndicatorComponent, ValueDisplayComponent],
  templateUrl: './bess-containers-bars.component.html',
  styleUrl: './bess-containers-bars.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BessContainersBarsComponent implements OnInit, OnDestroy {
  private readonly live = inject(BESSMomentaryDataService);
  private readonly dataService = inject(BESSDataService);
  private readonly cdr = inject(ChangeDetectorRef);

  private readonly componentId = 'BessContainersBarsComponent';
  private readonly destroy$ = new Subject<void>();
  private containersMetadata: BESSAssetDTO[] = [];
  private socParameterId: string | undefined;
  private sohParameterId: string | undefined;
  private activePowerParameterId: string | undefined;
  private chargeableCapacityParameterId: string | undefined;
  private dischargeableCapacityParameterId: string | undefined;
  private maximumChargePowerParameterId: string | undefined;
  private maximumDischargePowerParameterId: string | undefined;

  containers: ContainerBarItem[] = [];

  private _bessId = this.dataService.getBESSMetadataFromCache()?.id;

  ngOnInit(): void {
    if (!this._bessId) {
      throw new Error('Bess ID is not set. Please set the BESS ID in the URL.');
    }

    // Set the BESS ID for the live data service
    this.live.setBESS(this._bessId);

    // Get metadata from cache (always available on BESS page)
    const metadata = this.dataService.bessMetadataCache;
    if (!metadata) {
      console.error('BESS metadata not available in cache');
      return;
    }

    // Get all battery containers from metadata
    this.containersMetadata = metadata.assets.filter(
      (a) => a.type === BESSAssetType.BatteryContainer,
    );

    // Get parameter IDs
    this.socParameterId = this.dataService.getBESSParameterIdByKey('stateOfCharge');
    if (!this.socParameterId) {
      console.warn('Parameter definition not found for key: stateOfCharge');
    }

    this.sohParameterId = this.dataService.getBESSParameterIdByKey('stateOfHealth');
    if (!this.sohParameterId) {
      console.warn('Parameter definition not found for key: stateOfHealth');
    }

    this.activePowerParameterId = this.dataService.getBESSParameterIdByKey('activePower');
    if (!this.activePowerParameterId) {
      console.warn('Parameter definition not found for key: activePower');
    }

    this.chargeableCapacityParameterId =
      this.dataService.getBESSParameterIdByKey('chargeableCapacity');
    if (!this.chargeableCapacityParameterId) {
      console.warn('Parameter definition not found for key: chargeableCapacity');
    }

    this.dischargeableCapacityParameterId =
      this.dataService.getBESSParameterIdByKey('dischargeableCapacity');
    if (!this.dischargeableCapacityParameterId) {
      console.warn('Parameter definition not found for key: dischargeableCapacity');
    }

    this.maximumChargePowerParameterId =
      this.dataService.getBESSParameterIdByKey('maximumChargePower');
    if (!this.maximumChargePowerParameterId) {
      console.warn('Parameter definition not found for key: maximumChargePower');
    }

    this.maximumDischargePowerParameterId =
      this.dataService.getBESSParameterIdByKey('maximumDischargePower');
    if (!this.maximumDischargePowerParameterId) {
      console.warn('Parameter definition not found for key: maximumDischargePower');
    }

    // Initialize containers with empty values
    this.containers = this.containersMetadata.map((c) => ({
      id: c.id,
      name: c.name,
      soc: null,
      soh: null,
      activePower: null,
      chargeableCapacity: null,
      dischargeableCapacity: null,
      maximumChargePower: null,
      maximumDischargePower: null,
    }));

    // Register watch for all BatteryContainer assets (explicit assetIds to avoid mock limit)
    const containerIds = this.containersMetadata.map((c) => c.id);
    if (containerIds.length > 0) {
      const logicalParameterIds = [
        this.socParameterId,
        this.sohParameterId,
        this.activePowerParameterId,
        this.chargeableCapacityParameterId,
        this.dischargeableCapacityParameterId,
        this.maximumChargePowerParameterId,
        this.maximumDischargePowerParameterId,
      ].filter((id): id is string => typeof id === 'string');

      this.live.registerWatch(this.componentId, {
        assetFilter: { assetIds: containerIds },
        logicalParameterIds,
      });
    }

    this.cdr.markForCheck();

    // Subscribe to live data updates
    this.live.liveMessage$.pipe(takeUntil(this.destroy$)).subscribe((message) => {
      if (!message || this.containersMetadata.length === 0) return;

      // Update containers with live data
      this.containers = this.containersMetadata.map((c) => {
        const assetData = message.assets.find((a) => a.assetId === c.id);
        if (!assetData) {
          return {
            id: c.id,
            name: c.name,
            soc: null,
            soh: null,
            activePower: null,
            chargeableCapacity: null,
            dischargeableCapacity: null,
            maximumChargePower: null,
            maximumDischargePower: null,
          };
        }

        // Extract values from the live message format: [timestamp, value]
        const values = assetData.values;
        const soc = this.mapDataValue(values, this.socParameterId);
        const soh = this.mapDataValue(values, this.sohParameterId);
        const activePower = this.mapDataValue(values, this.activePowerParameterId);
        const chargeableCapacity = this.mapDataValue(values, this.chargeableCapacityParameterId);
        const dischargeableCapacity = this.mapDataValue(
          values,
          this.dischargeableCapacityParameterId,
        );
        const maximumChargePower = this.mapDataValue(values, this.maximumChargePowerParameterId);
        const maximumDischargePower = this.mapDataValue(
          values,
          this.maximumDischargePowerParameterId,
        );

        return {
          id: c.id,
          name: c.name,
          soc,
          soh,
          activePower,
          chargeableCapacity,
          dischargeableCapacity,
          maximumChargePower,
          maximumDischargePower,
        };
      });

      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.live.unregisterWatch(this.componentId);
    this.destroy$.next();
    this.destroy$.complete();
  }

  getContainerState(item: ContainerBarItem): BessState | null {
    const value = item.activePower?.value;
    if (typeof value !== 'number') {
      return null;
    }
    if (value > 0) return 'charging';
    if (value < 0) return 'discharging';
    return 'idle';
  }

  private mapDataValue(
    values: Record<string, [number, number | null]>,
    parameterId?: string,
  ): BESSMomentaryDataValue | null {
    if (!parameterId) {
      return null;
    }
    const entry = values?.[parameterId];
    if (!entry) {
      return null;
    }
    return {
      unixTimestamp: entry[0],
      value: entry[1],
    };
  }
}
