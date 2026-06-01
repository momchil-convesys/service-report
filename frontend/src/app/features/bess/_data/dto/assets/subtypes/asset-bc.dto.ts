import { BESSAssetBaseDTO, BESSAssetType } from '../asset-base.dto';

export interface BESSBatteryContainerDTO extends BESSAssetBaseDTO {
  type: BESSAssetType.BatteryContainer;

  /**
   * TODO: Battery container specific properties
   *
   * E.g:
   *  - physical location
   *  - number of batteries
   *  - battery cell type
   *  - battery capacity
   *  - etc.
   */
}
