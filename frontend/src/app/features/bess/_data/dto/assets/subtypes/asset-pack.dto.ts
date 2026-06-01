import { BESSAssetBaseDTO, BESSAssetType } from '../asset-base.dto';

export interface BESSBatteryPackDTO extends BESSAssetBaseDTO {
  type: BESSAssetType.BatteryPack;

  /**
   * TODO: Battery pack specific properties
   *
   * E.g:
   *  - pack position
   *  - number of cells
   *  - pack voltage
   *  - pack capacity
   *  - etc.
   */
}
