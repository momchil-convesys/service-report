import { BESSAssetBaseDTO, BESSAssetType } from '../asset-base.dto';

export interface BESSBatteryRackDTO extends BESSAssetBaseDTO {
  type: BESSAssetType.BatteryRack;

  /**
   * TODO: Battery rack specific properties
   *
   * E.g:
   *  - rack position
   *  - number of packs
   *  - rack capacity
   *  - etc.
   */
}
