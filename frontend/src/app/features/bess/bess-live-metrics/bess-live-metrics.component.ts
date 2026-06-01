import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSkeletonComponent } from 'ng-zorro-antd/skeleton';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { Observable, of, Subject, takeUntil } from 'rxjs';
import { noSpaceUnits } from '../../../constants';
import { BESSDataService } from '../_data/data.service';
import { BESSAssetMetrics_DataPoint_DTO } from '../_data/dto/asset-metrics.dto';
import { BESSAssetType } from '../_data/dto/assets/asset-base.dto';
import { BESSAssetDTO } from '../_data/dto/assets/asset.dto';
import { BESSConnectionDTO, BESSMetadataDTO } from '../_data/dto/bess.dto';
import { BESSLiveMomentaryDataMessageDTO } from '../_data/dto/live-momentary-data.dto';
import { BESSMomentaryDataService } from '../_data/momentary-data.service';
import { BessParameterSelectorComponent } from '../shared/bess-parameter-selector/bess-parameter-selector.component';

@Component({
  selector: 'app-bess-live-metrics',
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCheckboxModule,
    NzIconModule,
    NzSpinModule,
    NzSkeletonComponent,
    NzEmptyModule,
    NzSelectModule,
    NzSliderModule,
    NzTooltipModule,
    BessParameterSelectorComponent,
  ],
  templateUrl: './bess-live-metrics.component.html',
  styleUrl: './bess-live-metrics.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [],
})
export class BessLiveMetricsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() grouped: boolean = true;

  private dataService = inject(BESSDataService);
  private liveData = inject(BESSMomentaryDataService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();
  private readonly componentId = 'BessLiveMetricsComponent';

  // Expose BESSAssetType for template
  readonly BESSAssetType = BESSAssetType;

  // Asset type selector
  assetTypeOptions: Array<{ type: BESSAssetType; label: string; count: number }> = [];
  selectedAssetType: BESSAssetType | null = BESSAssetType.Inverter;

  // Parameter selector
  selectedParameterKey: string | null = null;
  private selectedParameterId: string | null = null;

  // Slider filter
  sliderValue: number[] = [0, 100];
  paramMin = 0;
  paramMax = 100;

  // Display options
  showShortNames = false;
  showUnit = true;

  private readonly assetTypeDisplayOrder: BESSAssetType[] = [
    BESSAssetType.Inverter,
    BESSAssetType.BatteryContainer,
    BESSAssetType.BatteryRack,
    BESSAssetType.BatteryPack,
    BESSAssetType.BESSItself,
    BESSAssetType.TransformerStation,
  ];

  metadata$: Observable<BESSMetadataDTO | undefined> = of(
    this.dataService.getBESSMetadataFromCache(),
  );

  assets: BESSAssetDTO[] = [];
  metricsData: BESSAssetMetrics_DataPoint_DTO[] = [];
  loading = true;

  // Indexes for grouping
  private idToAsset = new Map<string, BESSAssetDTO>();
  private adjacency = new Map<string, string[]>();
  private assetsByType = new Map<BESSAssetType, BESSAssetDTO[]>();
  private bessMetadata: BESSMetadataDTO | undefined;
  private metricsMap = new Map<string, BESSAssetMetrics_DataPoint_DTO>();
  private trackedAssetIds = new Set<string>();

  tsGroups: Array<{
    id: string;
    title: string;
    containers: Array<{ id: string; title: string; inverterIds: string[] }>;
  }> = [];

  private isUserSelectedSliderRange = false;

  ngOnInit() {
    const bessId = this.dataService.getBESSMetadataFromCache()?.id;
    if (!bessId) {
      throw new Error('Bess ID is not set. Please set the BESS ID in the URL.');
    }

    this.liveData.setBESS(bessId);

    // Keep metadata for grouping, assets catalog and parameter selector
    this.metadata$.pipe(takeUntil(this.destroy$)).subscribe((bess) => {
      this.bessMetadata = bess || undefined;
      if (bess) {
        this.buildIndexes(bess);
        this.updateAssetTypeOptions();
        this.computeGroups();
        this.syncSelectedParameterId();
        this.resetMetricsState();
        this.rebuildLiveWatch();
      } else {
        this.assets = [];
        this.assetTypeOptions = [];
        this.assetsByType.clear();
        this.selectedAssetType = null;
        this.selectedParameterKey = null;
        this.selectedParameterId = null;
        this.metricsMap.clear();
        this.metricsData = [];
        this.trackedAssetIds.clear();
        this.loading = false;
        this.liveData.unregisterWatch(this.componentId);
        this.updateSliderRange(this.isUserSelectedSliderRange);
        this.idToAsset.clear();
        this.adjacency.clear();
        this.tsGroups = [];
      }
      this.cdr.markForCheck();
    });

    // Subscribe to live data stream
    this.liveData.liveMessage$.pipe(takeUntil(this.destroy$)).subscribe((message) => {
      this.handleLiveMessage(message);
    });
  }

  ngOnDestroy() {
    this.liveData.unregisterWatch(this.componentId);
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['grouped']) {
      this.computeGroups();
      this.cdr.markForCheck();
    }
  }

  getSelectedParameter(): { key: string; name: string; unit?: string | null } | undefined {
    if (!this.bessMetadata || !this.selectedParameterKey) {
      return undefined;
    }

    const param = this.bessMetadata.parameterDefinitions.find(
      (p) => p.key === this.selectedParameterKey,
    );
    if (!param) {
      return undefined;
    }

    return {
      key: param.key,
      name: param.name,
      unit: param.unit,
    };
  }

  onAssetTypeChange(assetType: BESSAssetType): void {
    if (this.selectedAssetType === assetType) {
      return;
    }
    this.selectedAssetType = assetType;
    this.updateAssetsForSelectedType();
    this.selectedParameterKey = null;
    this.syncSelectedParameterId();
    this.resetMetricsState();
    this.rebuildLiveWatch();
    this.computeGroups();
    this.cdr.markForCheck();
  }

  getSelectedAssetTypeLabel(): string {
    if (!this.selectedAssetType) {
      return 'assets';
    }
    return this.getAssetTypeLabel(this.selectedAssetType);
  }

  onParameterChange(key: string): void {
    this.selectedParameterKey = key;
    this.syncSelectedParameterId();
    this.resetMetricsState();
    this.rebuildLiveWatch();
    this.cdr.markForCheck();
  }

  onSliderChange(values: number[]): void {
    this.sliderValue = values;
    this.isUserSelectedSliderRange = true;
    this.cdr.markForCheck();
  }

  updateSliderRange(preserveSelection: boolean = false): void {
    if (!this.selectedParameterKey) {
      this.paramMin = 0;
      this.paramMax = 100;
      this.sliderValue = [0, 100];
      return;
    }

    const values: number[] = [];

    // Extract all values for the selected parameter
    this.metricsData.forEach((metrics) => {
      const value = this.selectedParameterKey ? metrics.values[this.selectedParameterKey] : null;
      if (value !== null && value !== undefined) {
        values.push(value);
      }
    });

    if (values.length > 0) {
      const previousMin = this.paramMin;
      const previousMax = this.paramMax;
      const previousSelection: [number, number] = [this.sliderValue[0], this.sliderValue[1]];

      this.paramMin = Math.min(...values);
      this.paramMax = Math.max(...values);

      if (!preserveSelection) {
        this.sliderValue = [this.paramMin, this.paramMax];
        return;
      }

      // Preserve the user's selected range as much as possible
      const newRange = this.paramMax - this.paramMin;
      if (newRange <= 0) {
        this.sliderValue = [this.paramMin, this.paramMax];
        return;
      }

      const [prevStart, prevEnd] = previousSelection;
      let desiredStart = prevStart;
      let desiredEnd = prevEnd;

      // If range changed significantly (e.g. reset), fallback to full range
      if (previousMax <= previousMin) {
        this.sliderValue = [this.paramMin, this.paramMax];
        return;
      }

      // Clamp previous selection into the new min/max range
      desiredStart = Math.max(this.paramMin, Math.min(desiredStart, this.paramMax));
      desiredEnd = Math.max(this.paramMin, Math.min(desiredEnd, this.paramMax));

      // Ensure the selection width stays similar to previous width when possible
      const prevWidth = Math.max(prevEnd - prevStart, 0);
      const desiredWidth = Math.min(prevWidth || newRange, newRange);

      if (desiredEnd - desiredStart < desiredWidth) {
        desiredEnd = Math.min(this.paramMax, desiredStart + desiredWidth);
        desiredStart = Math.max(this.paramMin, desiredEnd - desiredWidth);
      }

      // Final safety clamp
      if (desiredStart >= desiredEnd) {
        desiredStart = this.paramMin;
        desiredEnd = this.paramMax;
      }

      this.sliderValue = [desiredStart, desiredEnd];
    } else {
      this.paramMin = 0;
      this.paramMax = 100;
      this.sliderValue = [0, 100];
    }
  }

  shouldShowAsset(assetId: string): boolean {
    if (!this.selectedParameterKey) {
      return true;
    }

    const metrics = this.getAssetMetrics(assetId);
    if (!metrics) return true;

    const value = metrics.values[this.selectedParameterKey];
    if (value === null || value === undefined) return true;

    return value >= this.sliderValue[0] && value <= this.sliderValue[1];
  }

  isFilterActive(): boolean {
    return this.sliderValue[0] !== this.paramMin || this.sliderValue[1] !== this.paramMax;
  }

  clearFilter(): void {
    this.sliderValue = [this.paramMin, this.paramMax];
    this.isUserSelectedSliderRange = false;
    this.cdr.markForCheck();
  }

  getAssetName(assetId: string, shortName: boolean): string {
    const asset = this.idToAsset.get(assetId);
    if (asset?.displayIndex !== undefined) {
      return shortName
        ? `${asset.displayIndex.toString().padStart(2, '0')}`
        : asset?.name || assetId;
    }
    return asset?.name || assetId;
  }

  getShortAssetName(asset: BESSAssetDTO): string {
    if (asset.displayIndex !== undefined) {
      return asset.displayIndex.toString().padStart(2, '0');
    }
    return asset.name;
  }

  shouldInsertSpace(unit: string): boolean {
    return noSpaceUnits.indexOf(unit.trim()) < 0;
  }

  private handleLiveMessage(message: BESSLiveMomentaryDataMessageDTO | null): void {
    if (
      !message ||
      !this.selectedParameterId ||
      !this.selectedParameterKey ||
      this.trackedAssetIds.size === 0
    ) {
      return;
    }

    const parameterId = this.selectedParameterId;
    const parameterKey = this.selectedParameterKey;
    let hasUpdate = false;

    message.assets.forEach((assetMessage) => {
      if (!this.trackedAssetIds.has(assetMessage.assetId)) {
        return;
      }

      const entry = assetMessage.values?.[parameterId];
      if (!entry) {
        return;
      }

      const [unixTimestamp, value] = entry;
      const timestamp =
        typeof unixTimestamp === 'number'
          ? new Date(unixTimestamp * 1000).toISOString()
          : message.timestamp;

      this.metricsMap.set(assetMessage.assetId, {
        assetId: assetMessage.assetId,
        timestamp,
        values: { [parameterKey]: value },
      });
      hasUpdate = true;
    });

    if (!hasUpdate && this.metricsMap.size === 0) {
      return;
    }

    this.metricsData = this.assets.map((asset) => {
      const dataPoint = this.metricsMap.get(asset.id);
      if (dataPoint) {
        return dataPoint;
      }
      return {
        assetId: asset.id,
        timestamp: message.timestamp,
        values: { [parameterKey]: null },
      };
    });

    this.loading = false;
    this.updateSliderRange(this.isUserSelectedSliderRange);
    this.cdr.markForCheck();
  }

  private syncSelectedParameterId(): void {
    this.selectedParameterId = this.selectedParameterKey
      ? (this.dataService.getBESSParameterIdByKey(this.selectedParameterKey) ?? null)
      : null;
  }

  private resetMetricsState(): void {
    this.isUserSelectedSliderRange = false;
    this.metricsMap.clear();
    this.metricsData = [];
    this.loading = this.trackedAssetIds.size > 0 && !!this.selectedParameterId;
    this.updateSliderRange(this.isUserSelectedSliderRange);
  }

  private rebuildLiveWatch(): void {
    if (!this.selectedParameterId || this.trackedAssetIds.size === 0) {
      this.liveData.unregisterWatch(this.componentId);
      if (this.trackedAssetIds.size === 0 || !this.selectedParameterKey) {
        this.loading = false;
      }
      return;
    }

    this.liveData.registerWatch(this.componentId, {
      assetFilter: {
        assetIds: Array.from(this.trackedAssetIds),
        // assetType: this.selectedAssetType || undefined,
      },
      logicalParameterIds: [this.selectedParameterId],
    });
    this.loading = true;
  }

  private buildIndexes(bess: BESSMetadataDTO) {
    this.idToAsset = new Map(bess.assets.map((a) => [a.id, a] as const));
    this.adjacency.clear();
    bess.topology.forEach((conn: BESSConnectionDTO) => {
      const list = this.adjacency.get(conn.fromAssetId) || [];
      list.push(conn.toAssetId);
      this.adjacency.set(conn.fromAssetId, list);
    });
  }

  private computeGroups() {
    if (!this.bessMetadata || !this.grouped || this.selectedAssetType !== BESSAssetType.Inverter) {
      this.tsGroups = [];
      return;
    }

    const tsAssets = this.bessMetadata.assets.filter(
      (a) => a.type === BESSAssetType.TransformerStation,
    );
    this.tsGroups = tsAssets.map((ts) => {
      const bbIds = this.adjacency.get(ts.id) || [];
      const containers = bbIds
        .map((bbId) => {
          if (this.idToAsset.get(bbId)?.type !== BESSAssetType.BatteryContainer) return null;
          const inverterIds = (this.adjacency.get(bbId) || []).filter(
            (id) => this.idToAsset.get(id)?.type === BESSAssetType.Inverter,
          );
          return {
            id: bbId,
            title: this.idToAsset.get(bbId)?.name || bbId,
            inverterIds,
          };
        })
        .filter((b): b is { id: string; title: string; inverterIds: string[] } => !!b);

      return { id: ts.id, title: this.idToAsset.get(ts.id)?.name || ts.id, containers };
    });
  }

  private updateAssetTypeOptions(): void {
    if (!this.bessMetadata) {
      this.assetTypeOptions = [];
      this.assets = [];
      return;
    }

    const assetsByType = new Map<BESSAssetType, BESSAssetDTO[]>();
    this.bessMetadata.assets.forEach((asset) => {
      // if (!this.hasParametersForAssetType(asset.type)) {
      //   return;
      // }
      const list = assetsByType.get(asset.type) ?? [];
      list.push(asset);
      assetsByType.set(asset.type, list);
    });

    this.assetsByType = assetsByType;

    const options = Array.from(assetsByType.entries()).map(([type, list]) => ({
      type,
      label: this.getAssetTypeLabel(type),
      count: list.length,
    }));

    options.sort((a, b) => this.compareAssetTypeOrder(a.type, b.type));
    this.assetTypeOptions = options;

    const previousSelection = this.selectedAssetType;

    if (!previousSelection || !assetsByType.has(previousSelection)) {
      this.selectedAssetType = options[0]?.type ?? null;
    }

    this.updateAssetsForSelectedType();
  }

  private updateAssetsForSelectedType(): void {
    if (!this.selectedAssetType) {
      this.assets = [];
      this.trackedAssetIds.clear();
      return;
    }

    this.assets = this.assetsByType.get(this.selectedAssetType) ?? [];
    this.trackedAssetIds = new Set(this.assets.map((asset) => asset.id));
  }

  private hasParametersForAssetType(assetType: BESSAssetType): boolean {
    if (!this.bessMetadata) {
      return false;
    }
    return this.bessMetadata.parameterBindings.some((binding) => binding.assetType === assetType);
  }

  private compareAssetTypeOrder(a: BESSAssetType, b: BESSAssetType): number {
    const indexA = this.assetTypeDisplayOrder.indexOf(a);
    const indexB = this.assetTypeDisplayOrder.indexOf(b);

    if (indexA === -1 && indexB === -1) {
      return this.getAssetTypeLabel(a).localeCompare(this.getAssetTypeLabel(b));
    }
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    if (indexA === indexB) {
      return this.getAssetTypeLabel(a).localeCompare(this.getAssetTypeLabel(b));
    }
    return indexA - indexB;
  }

  private getAssetTypeLabel(type: BESSAssetType): string {
    switch (type) {
      case BESSAssetType.Inverter:
        return 'Inverters';
      case BESSAssetType.BatteryContainer:
        return 'Battery Containers';
      case BESSAssetType.BatteryRack:
        return 'Battery Racks';
      case BESSAssetType.BatteryPack:
        return 'Battery Packs';
      case BESSAssetType.BESSItself:
        return 'BESS';
      case BESSAssetType.TransformerStation:
        return 'Transformer Stations';
      default:
        return type;
    }
  }

  getAssetMetrics(assetId: string): BESSAssetMetrics_DataPoint_DTO | undefined {
    return this.metricsData.find((data) => data.assetId === assetId);
  }

  getParameterValue(metrics: BESSAssetMetrics_DataPoint_DTO | undefined): number | null {
    if (!metrics?.values) return null;
    return this.selectedParameterKey ? (metrics.values[this.selectedParameterKey] ?? null) : null;
  }

  getMeasurementTimestamp(metrics: BESSAssetMetrics_DataPoint_DTO | undefined): Date | null {
    if (!metrics?.timestamp) {
      return null;
    }

    // TODO: timezone conversion
    return new Date(metrics.timestamp);
  }
}
