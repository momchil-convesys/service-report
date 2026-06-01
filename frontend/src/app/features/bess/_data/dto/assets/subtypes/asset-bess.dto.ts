import { BESSAssetBaseDTO, BESSAssetType } from '../asset-base.dto';

export interface BESSItselfDTO extends BESSAssetBaseDTO {
  type: BESSAssetType.BESSItself;

  /**
   * TODO: BESS specific properties
   *
   * E.g:
   *  - installed capacity
   *  - physical location
   *  - etc.
   */
}
