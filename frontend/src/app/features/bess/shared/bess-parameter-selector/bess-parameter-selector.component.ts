import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { BESSAssetType } from '../../_data/dto/assets/asset-base.dto';
import { BESSMetadataDTO } from '../../_data/dto/bess.dto';
import { BESSParameterDefinitionDTO } from '../../_data/dto/parameters.dto';

export interface ParameterOption {
  key: string;
  name: string;
  unit?: string | null;
}

@Component({
  selector: 'app-bess-parameter-selector',
  standalone: true,
  imports: [FormsModule, NzSelectModule],
  templateUrl: './bess-parameter-selector.component.html',
  styleUrl: './bess-parameter-selector.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BessParameterSelectorComponent implements OnChanges {
  @Input({ required: true }) bessMetadata: BESSMetadataDTO | null = null;
  @Input({ required: true }) assetType: BESSAssetType | null = null;
  @Input() vendorProfileId: string | null | undefined = null;
  @Input() selectedParameterKey: string | null = null;
  @Input() includeVendorSpecific: boolean = true;
  @Input() placeholder: string = 'Select parameter';

  @Output() parameterChange = new EventEmitter<string>();

  availableParameters: ParameterOption[] = [];
  internalSelectedKey: string | null = null;

  constructor(private cdr: ChangeDetectorRef) {
    // Initialize from input
    this.internalSelectedKey = this.selectedParameterKey;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedParameterKey']) {
      this.internalSelectedKey = this.selectedParameterKey;
    }

    if (
      changes['bessMetadata'] ||
      changes['assetType'] ||
      changes['vendorProfileId'] ||
      changes['includeVendorSpecific']
    ) {
      this.updateAvailableParameters();
    } else if (changes['selectedParameterKey']) {
      if (this.availableParameters.length > 0) {
        this.validateSelection();
      }
    }
  }

  private updateAvailableParameters(): void {
    if (!this.bessMetadata || !this.assetType) {
      this.availableParameters = [];
      this.cdr.markForCheck();
      return;
    }

    const parameterIds = new Set<string>();

    // Get all parameter IDs that are bound to the specified asset type
    this.bessMetadata.parameterBindings
      .filter((binding) => {
        // Must match asset type
        if (binding.assetType !== this.assetType) return false;

        // If includeVendorSpecific is false, only include asset-type-level bindings
        if (!this.includeVendorSpecific) {
          return binding.vendorProfileId == null;
        }

        // If vendorProfileId is specified, include both asset-type-level and vendor-specific bindings
        if (this.vendorProfileId != null) {
          return (
            binding.vendorProfileId == null || binding.vendorProfileId === this.vendorProfileId
          );
        }

        // Otherwise, include all bindings (asset-type-level and vendor-specific)
        return true;
      })
      .forEach((binding) => {
        parameterIds.add(binding.parameterId);
      });

    // Map parameter definitions to available parameters
    const paramMap = new Map<string, BESSParameterDefinitionDTO>(
      this.bessMetadata.parameterDefinitions.map((p) => [p.id, p]),
    );

    const paramsArray: ParameterOption[] = [];
    Array.from(parameterIds).forEach((paramId) => {
      const param = paramMap.get(paramId);
      if (param) {
        paramsArray.push({
          key: param.key,
          name: param.name,
          unit: param.unit,
        });
      }
    });

    this.availableParameters = paramsArray.sort((a, b) => a.name.localeCompare(b.name));

    // Validate and update selection if needed
    this.validateSelection();

    this.cdr.markForCheck();
  }

  private validateSelection(): void {
    // If the currently selected parameter is not available, select the first one
    if (
      this.availableParameters.length > 0 &&
      this.internalSelectedKey &&
      !this.availableParameters.some((p) => p.key === this.internalSelectedKey)
    ) {
      this.internalSelectedKey = this.availableParameters[0].key;
      this.parameterChange.emit(this.internalSelectedKey);
    } else if (this.availableParameters.length > 0 && !this.internalSelectedKey) {
      // If no selection and parameters are available, select the first one
      this.internalSelectedKey = this.availableParameters[0].key;
      this.parameterChange.emit(this.internalSelectedKey);
    }
  }

  onParameterChange(key: string): void {
    this.internalSelectedKey = key;
    this.parameterChange.emit(key);
  }

  getParameterLabel(param: ParameterOption): string {
    return param.unit ? `${param.name} (${param.unit})` : param.name;
  }
}
