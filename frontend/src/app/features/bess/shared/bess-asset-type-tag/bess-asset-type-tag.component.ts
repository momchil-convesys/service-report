import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { BESSAssetType } from '../../_data/dto/assets/asset-base.dto';

@Component({
  selector: 'app-bess-asset-type-tag',
  standalone: true,
  imports: [],
  templateUrl: './bess-asset-type-tag.component.html',
  styleUrl: './bess-asset-type-tag.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BessAssetTypeTagComponent {
  @Input() assetType!: BESSAssetType;
  @Input() variant: 'short' | 'long' = 'long';
  @Input() compact: boolean = false;

  getAssetTypeLabelShort(type: BESSAssetType): string {
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
        return 'UNK';
    }
  }

  getAssetTypeLabel(type: BESSAssetType): string {
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

  getDisplayText(): string {
    return this.variant === 'short'
      ? this.getAssetTypeLabelShort(this.assetType)
      : this.getAssetTypeLabel(this.assetType);
  }

  getDataTypeValue(): string {
    return this.getAssetTypeLabelShort(this.assetType);
  }
}
