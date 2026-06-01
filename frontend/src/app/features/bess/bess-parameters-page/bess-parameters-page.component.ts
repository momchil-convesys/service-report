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
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { Subject } from 'rxjs';
import { BESSDataService } from '../_data/data.service';
import { BESSAssetType } from '../_data/dto/assets/asset-base.dto';
import { BESSMetadataDTO } from '../_data/dto/bess.dto';
import { BESSParameterBindingDTO, BESSParameterDefinitionDTO } from '../_data/dto/parameters.dto';
import { BESSVendorProfileDTO } from '../_data/dto/vendor-profile.dto';
import { BessAssetTypeTagComponent } from '../shared/bess-asset-type-tag/bess-asset-type-tag.component';

interface BindingDisplayItem extends BESSParameterBindingDTO {
  parameterName?: string;
  parameterKey?: string;
  vendorName?: string;
}

@Component({
  selector: 'app-bess-parameters-page',
  standalone: true,
  imports: [
    FormsModule,
    NzTableModule,
    NzEmptyModule,
    NzSpinModule,
    NzSelectModule,
    NzInputModule,
    NzIconModule,
    BessAssetTypeTagComponent,
  ],
  templateUrl: './bess-parameters-page.component.html',
  styleUrl: './bess-parameters-page.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BessParametersPageComponent implements OnInit, OnDestroy {
  private dataService = inject(BESSDataService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  private _bessMetadata = this.dataService.getBESSMetadataFromCache();
  metadata: BESSMetadataDTO | undefined = this._bessMetadata;

  parameters: BESSParameterDefinitionDTO[] = [];
  bindings: BESSParameterBindingDTO[] = [];
  vendorProfiles: BESSVendorProfileDTO[] = [];
  loading = false;

  // Filter
  selectedAssetType: BESSAssetType | 'all' = 'all';
  searchQuery: string = '';

  // Display data
  filteredBindings: BindingDisplayItem[] = [];
  assetTypeBindings: BindingDisplayItem[] = [];
  vendorSpecificBindings: BindingDisplayItem[] = [];

  // Asset type options
  assetTypeOptions: Array<{ value: BESSAssetType | 'all'; label: string }> = [
    { value: 'all', label: 'All Types' },
    { value: BESSAssetType.BESSItself, label: 'BESS Itself' },
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

    this.parameters = this.metadata.parameterDefinitions;
    this.bindings = this.metadata.parameterBindings;
    this.vendorProfiles = this.metadata.vendorProfiles;
    this.updateBindingsDisplay();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onAssetTypeChange(value: BESSAssetType | 'all'): void {
    this.selectedAssetType = value;
    this.updateBindingsDisplay();
    this.cdr.markForCheck();
  }

  onSearchChange(value: string): void {
    this.searchQuery = value;
    this.updateBindingsDisplay();
    this.cdr.markForCheck();
  }

  onClearSearch(): void {
    this.searchQuery = '';
    this.updateBindingsDisplay();
    this.cdr.markForCheck();
  }

  private updateBindingsDisplay(): void {
    if (!this.metadata) {
      this.filteredBindings = [];
      this.assetTypeBindings = [];
      this.vendorSpecificBindings = [];
      return;
    }

    // Create parameter and vendor maps
    const paramMap = new Map<string, BESSParameterDefinitionDTO>(
      this.parameters.map((p) => [p.id, p]),
    );
    const vendorMap = new Map<string, BESSVendorProfileDTO>(
      this.vendorProfiles.map((v) => [v.id, v]),
    );

    // Enrich bindings with parameter and vendor info
    let enriched: BindingDisplayItem[] = this.bindings.map((binding) => {
      const param = paramMap.get(binding.parameterId);
      const vendor = binding.vendorProfileId ? vendorMap.get(binding.vendorProfileId) : undefined;

      return {
        ...binding,
        parameterName: param?.name,
        parameterKey: param?.key,
        vendorName: vendor?.name,
      };
    });

    // Filter by asset type
    if (this.selectedAssetType !== 'all') {
      enriched = enriched.filter((b) => b.assetType === this.selectedAssetType);
    }

    // Filter by search query (parameter name, key, or ID)
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      enriched = enriched.filter(
        (b) =>
          b.parameterName?.toLowerCase().includes(query) ||
          b.parameterKey?.toLowerCase().includes(query) ||
          b.parameterId.toLowerCase().includes(query),
      );
    }

    // Separate vendor-specific bindings
    this.vendorSpecificBindings = enriched.filter((b) => b.vendorProfileId != null);
    this.assetTypeBindings = enriched.filter((b) => b.vendorProfileId == null);

    // Combined list (asset type first, then vendor-specific)
    this.filteredBindings = [...this.assetTypeBindings, ...this.vendorSpecificBindings];
  }

  getParameterName(binding: BindingDisplayItem): string {
    return binding.parameterName || binding.parameterId;
  }

  getParameterKey(binding: BindingDisplayItem): string {
    return binding.parameterKey || binding.parameterId;
  }
}
