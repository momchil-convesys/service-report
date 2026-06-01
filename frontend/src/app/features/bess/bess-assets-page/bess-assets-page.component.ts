import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { Subject } from 'rxjs';
import { BESSDataService } from '../_data/data.service';
import { BESSAssetType } from '../_data/dto/assets/asset-base.dto';
import { BESSAssetDTO } from '../_data/dto/assets/asset.dto';
import { BESSConnectionDTO, BESSMetadataDTO } from '../_data/dto/bess.dto';
import { BESSParameterBindingDTO, BESSParameterDefinitionDTO } from '../_data/dto/parameters.dto';
import { BESSVendorProfileDTO } from '../_data/dto/vendor-profile.dto';

export interface AssetWithConnections {
  id: string;
  type: BESSAssetType;
  name: string;
  displayIndex?: number;
  vendorProfileId?: string | null;
  parentId?: string;
  parentName?: string;
  childrenIds: string[];
  childrenNames: string[];
  assetTypeLabel: string;
  assetTypeLabelShort: string;
  vendorProfileName?: string;
  applicableParameterKeys: string[];
}

@Component({
  selector: 'app-bess-assets-page',
  standalone: true,
  imports: [
    FormsModule,
    NzIconModule,
    NzSelectModule,
    NzInputModule,
    NzTableModule,
    NzEmptyModule,
    NzSpinModule,
    NzPopoverModule,
  ],
  templateUrl: './bess-assets-page.component.html',
  styleUrl: './bess-assets-page.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BessAssetsPageComponent implements OnInit, OnDestroy {
  private dataService = inject(BESSDataService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  // Search and filter controls
  searchQuery = '';
  selectedAssetType: BESSAssetType | 'all' = 'all';

  // Data streams
  private _bessMetadata = this.dataService.getBESSMetadataFromCache();

  metadata: BESSMetadataDTO | undefined = this._bessMetadata;
  allAssets: BESSAssetDTO[] = this._bessMetadata?.assets ?? [];
  topology: BESSConnectionDTO[] = this._bessMetadata?.topology ?? [];

  assets: AssetWithConnections[] = [];
  filteredAssets: AssetWithConnections[] = [];

  currentPopoverKeys: string[] = [];
  currentPopoverAssetType: BESSAssetType | undefined;
  currentPopoverVendorProfileId: string | null | undefined;

  // Asset type options
  assetTypeOptions: Array<{ value: BESSAssetType | 'all'; label: string }> = [
    { value: 'all', label: 'All Types' },
    { value: BESSAssetType.BESSItself, label: 'BESS' },
    { value: BESSAssetType.TransformerStation, label: 'Transformer Station' },
    { value: BESSAssetType.BatteryContainer, label: 'Battery Container' },
    { value: BESSAssetType.BatteryRack, label: 'Battery Rack' },
    { value: BESSAssetType.BatteryPack, label: 'Battery Pack' },
    { value: BESSAssetType.BatteryCell, label: 'Battery Cell' },
    { value: BESSAssetType.Inverter, label: 'Inverter' },
  ];

  ngOnInit(): void {
    if (!this.metadata) {
      throw new Error('Bess metadata not found in cache');
    }

    // Combine all data streams and wait for metadata
    this.assets = this.enrichAssetsWithConnections(this.allAssets, this.topology, this.metadata);
    this.applyFilters();
    this.cdr.markForCheck();
  }

  onPopoverEnter(asset: AssetWithConnections): void {
    this.currentPopoverKeys = asset.applicableParameterKeys;
    this.currentPopoverAssetType = asset.type;
    this.currentPopoverVendorProfileId = asset.vendorProfileId ?? null;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(value: string): void {
    this.searchQuery = value;
    this.applyFilters();
  }

  onClearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  onAssetTypeChange(value: BESSAssetType | 'all'): void {
    this.selectedAssetType = value;
    this.applyFilters();
  }

  onNameClick(name: string): void {
    this.searchQuery = name;
    this.applyFilters();
    this.cdr.markForCheck();
  }

  getParameterDetails(keys: string[]): Array<{
    id: string;
    key: string;
    name: string;
    unit: string | null;
    displayName: string | null;
  }> {
    if (!this.metadata) {
      return keys.map((key) => ({ id: '', key, name: key, unit: null, displayName: null }));
    }

    const metadata = this.metadata as BESSMetadataDTO;
    const paramMap = new Map<string, BESSParameterDefinitionDTO>(
      metadata.parameterDefinitions.map((p) => [p.key, p]),
    );

    const details = keys.map((key) => {
      const param = paramMap.get(key);
      // Bindings reference parameters by ID and are scoped to asset type (and optionally vendor).
      // Choose binding that matches the currently hovered asset's type and vendorProfileId.
      let binding: BESSParameterBindingDTO | undefined;
      if (this.currentPopoverAssetType != null) {
        const matches = metadata.parameterBindings.filter((b) => {
          const idMatches = param?.id != null ? b.parameterId === param.id : b.parameterId === key;
          if (!idMatches) return false;
          if (b.assetType !== this.currentPopoverAssetType) return false;
          if (b.vendorProfileId == null) return true;
          return b.vendorProfileId === this.currentPopoverVendorProfileId;
        });
        // Prefer vendor-specific binding if available
        binding =
          matches.find((b) => b.vendorProfileId === this.currentPopoverVendorProfileId) ||
          matches.find((b) => b.vendorProfileId == null);
      } else {
        // Fallback: any matching by ID
        binding = metadata.parameterBindings.find((b) =>
          param?.id != null ? b.parameterId === param.id : b.parameterId === key,
        );
      }
      return {
        id: param?.id || '',
        key,
        name: param?.name || key,
        unit: param?.unit ?? null,
        displayName: binding?.displayName ?? null,
      };
    });

    // Sort by numeric ID (ascending); unknown IDs last
    details.sort((a, b) => {
      const ai = a.id ? parseInt(a.id, 10) : Number.MAX_SAFE_INTEGER;
      const bi = b.id ? parseInt(b.id, 10) : Number.MAX_SAFE_INTEGER;
      return ai - bi;
    });

    return details;
  }

  private enrichAssetsWithConnections(
    assets: BESSAssetDTO[],
    topology: BESSConnectionDTO[],
    metadata: BESSMetadataDTO,
  ): AssetWithConnections[] {
    const assetMap = new Map<string, BESSAssetDTO>(assets.map((a) => [a.id, a]));
    const parentMap = new Map<string, string>(); // childId -> parentId
    const childrenMap = new Map<string, string[]>(); // parentId -> childIds[]

    // Build connection maps
    topology.forEach((conn) => {
      parentMap.set(conn.toAssetId, conn.fromAssetId);
      const children = childrenMap.get(conn.fromAssetId) || [];
      children.push(conn.toAssetId);
      childrenMap.set(conn.fromAssetId, children);
    });

    // Create maps for vendor profiles and parameter definitions
    const vendorMap = new Map<string, BESSVendorProfileDTO>(
      metadata.vendorProfiles.map((v) => [v.id, v]),
    );
    const paramMap = new Map<string, BESSParameterDefinitionDTO>(
      metadata.parameterDefinitions.map((p) => [p.id, p]),
    );

    // Enrich assets with connection info, vendor profile, and applicable parameters
    return assets.map((asset) => {
      const parentId = parentMap.get(asset.id);
      const parent = parentId ? assetMap.get(parentId) : undefined;
      const childrenIds = childrenMap.get(asset.id) || [];
      const childrenNames = childrenIds.map((id) => assetMap.get(id)?.name || id);

      // Get vendor profile
      const vendorProfile =
        asset.vendorProfileId && vendorMap.has(asset.vendorProfileId)
          ? vendorMap.get(asset.vendorProfileId)
          : undefined;

      // Get applicable parameters
      const applicableParameterKeys = this.getApplicableParameterKeys(
        asset,
        metadata.parameterBindings,
        paramMap,
      );

      return {
        ...asset,
        parentId,
        parentName: parent?.name,
        childrenIds,
        childrenNames,
        assetTypeLabel: this.getAssetTypeLabel(asset.type),
        assetTypeLabelShort: this.getAssetTypeLabelShort(asset.type),
        vendorProfileName: vendorProfile?.name,
        applicableParameterKeys,
      };
    });
  }

  private getApplicableParameterKeys(
    asset: BESSAssetDTO,
    bindings: BESSParameterBindingDTO[],
    paramMap: Map<string, BESSParameterDefinitionDTO>,
  ): string[] {
    const applicableBindings = bindings.filter((binding) => {
      // Must match asset type
      if (binding.assetType !== asset.type) return false;

      // If binding has vendorProfileId, asset must have matching vendorProfileId
      if (binding.vendorProfileId != null) {
        return asset.vendorProfileId === binding.vendorProfileId;
      }

      // Asset-type-level binding applies to all assets of that type
      // But if asset has vendorProfileId, we should also check for vendor-specific bindings
      return true;
    });

    // Get all bindings that apply (merge asset-type and vendor-specific)
    const allApplicableBindings = new Set<string>();
    applicableBindings.forEach((binding) => {
      allApplicableBindings.add(binding.parameterId);
    });

    // Convert parameter IDs to keys
    return Array.from(allApplicableBindings)
      .map((paramId) => {
        const param = paramMap.get(paramId);
        return param?.key || paramId;
      })
      .sort();
  }

  private getAssetTypeLabel(type: BESSAssetType): string {
    switch (type) {
      case BESSAssetType.BESSItself:
        return 'BESS Itself';
      case BESSAssetType.TransformerStation:
        return 'Transformer Station';
      case BESSAssetType.BatteryContainer:
        return 'Battery Container';
      case BESSAssetType.BatteryRack:
        return 'Battery Rack';
      case BESSAssetType.BatteryPack:
        return 'Battery Pack';
      case BESSAssetType.BatteryCell:
        return 'Battery Cell';
      case BESSAssetType.Inverter:
        return 'Inverter';
      default:
        return 'Unknown';
    }
  }

  private getAssetTypeLabelShort(type: BESSAssetType): string {
    switch (type) {
      case BESSAssetType.BESSItself:
        return 'BESS';
      case BESSAssetType.TransformerStation:
        return 'TS';
      case BESSAssetType.BatteryContainer:
        return 'BC';
      case BESSAssetType.BatteryRack:
        return 'BR';
      case BESSAssetType.BatteryPack:
        return 'BP';
      case BESSAssetType.BatteryCell:
        return 'BCL';
      case BESSAssetType.Inverter:
        return 'INV';
      default:
        return 'Unknown';
    }
  }

  private applyFilters(): void {
    let filtered = this.assets;

    // Filter by asset type
    if (this.selectedAssetType !== 'all') {
      filtered = filtered.filter((asset) => asset.type === this.selectedAssetType);
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (asset) =>
          asset.id.toLowerCase().includes(query) ||
          asset.name.toLowerCase().includes(query) ||
          asset.parentName?.toLowerCase().includes(query) ||
          false,
      );
    }

    // Sort: BESS first, then by type, then by name
    filtered.sort((a, b) => {
      if (a.type === BESSAssetType.BESSItself) return -1;
      if (b.type === BESSAssetType.BESSItself) return 1;

      const typeOrder = [
        BESSAssetType.TransformerStation,
        BESSAssetType.BatteryContainer,
        BESSAssetType.BatteryRack,
        BESSAssetType.BatteryPack,
        BESSAssetType.BatteryCell,
        BESSAssetType.Inverter,
      ];
      const aOrder = typeOrder.indexOf(a.type);
      const bOrder = typeOrder.indexOf(b.type);

      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.name.localeCompare(b.name);
    });

    this.filteredAssets = filtered;
    this.cdr.markForCheck();
  }
}
