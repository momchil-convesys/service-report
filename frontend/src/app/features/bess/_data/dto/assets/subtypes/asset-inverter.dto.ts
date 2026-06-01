import { BESSAssetBaseDTO, BESSAssetType } from '../asset-base.dto';

export interface BESSInverterDTO extends BESSAssetBaseDTO {
  type: BESSAssetType.Inverter;

  /**
   * TODO: Inverter specific properties
   *
   * E.g:
   *  - installed capacity
   *  - serial number
   *  - firmware version
   *  - etc.
   */
}
